/**
 * Cache rights-cleared images locally for production stability.
 *
 * Only public-domain / openly-licensed Commons files are cached. Each cached
 * work gets a 1200px card image and a 2400px detail image (WebP, aspect ratio
 * preserved, never upscaled). The original remote URL, license and attribution
 * are preserved in data/image-manifest.json, and the enriched dataset is
 * updated with the local paths.
 *
 * Network + the optional `sharp` dependency are required. If a work's rights
 * are unclear it is skipped (and shown with a source link only on the site).
 */
import fs from "node:fs";
import path from "node:path";
import {
  readInventory,
  loadEnrichedImages,
  writeEnriched,
  writeJson,
  PUBLIC_IMAGES_DIR,
  DATA_DIR,
  ensureDir,
  nowIso,
  type EnrichedRow
} from "./shared";
import {
  commonsThumbUrl,
  normalizeCommonsFilePath,
  type ImageMeta
} from "../lib/image";

const UA = "ShchukinCollectionArchive/1.0 (image cache)";

// Licenses we treat as safe to cache locally. Anything else → skip.
const ALLOW = /public domain|pd-|pd art|cc0|cc-by(?!-nc)|cc by(?!-nc)|no known copyright|open access/i;

function rightsAllowCaching(license: string | null): boolean {
  if (!license) return false;
  return ALLOW.test(license);
}

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

/**
 * Look up a Commons file's license when the enriched record lacks one. Pulls
 * several extmetadata fields so public-domain paintings (which often expose
 * License/UsageTerms rather than LicenseShortName) are correctly recognised.
 */
async function lookupCommonsLicense(
  fileName: string
): Promise<{ license: string | null; attribution: string | null; artist: string | null }> {
  try {
    const params = new URLSearchParams({
      format: "json",
      action: "query",
      titles: `File:${fileName}`,
      prop: "imageinfo",
      iiprop: "extmetadata"
    });
    const res = await fetch(`${COMMONS_API}?${params}`, {
      headers: { "User-Agent": UA }
    });
    if (!res.ok) return { license: null, attribution: null, artist: null };
    const data: any = await res.json();
    const pages = data?.query?.pages ?? {};
    const page: any = Object.values(pages)[0];
    const ext = page?.imageinfo?.[0]?.extmetadata ?? {};
    const strip = (s: any) =>
      s?.value ? String(s.value).replace(/<[^>]+>/g, "").trim() : null;
    const license =
      strip(ext.LicenseShortName) ||
      strip(ext.License) ||
      strip(ext.UsageTerms) ||
      null;
    return {
      license,
      attribution: strip(ext.Attribution) || strip(ext.Credit),
      artist: strip(ext.Artist)
    };
  } catch {
    return { license: null, attribution: null, artist: null };
  }
}

async function loadSharp(): Promise<any | null> {
  try {
    const mod: any = await import("sharp");
    return mod.default ?? mod;
  } catch {
    console.warn("sharp not installed — run `npm i -D sharp` to enable caching.");
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function download(url: string): Promise<Buffer | null> {
  // Retry/backoff: Commons throttles on-demand thumbnail rendering; a transient
  // 429/5xx is not fatal. Be patient — this is a one-time bulk operation.
  const backoffs = [0, 1500, 4000, 9000, 18000];
  for (const wait of backoffs) {
    if (wait) await sleep(wait);
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (!ct.startsWith("image/")) return null;
        return Buffer.from(await res.arrayBuffer());
      }
      if (![403, 429, 500, 502, 503, 504].includes(res.status)) return null;
    } catch {
      // network blip — fall through to retry
    }
  }
  return null;
}

/**
 * The URL to fetch for caching. We download a sized thumbnail (≤2400px) from
 * Commons rather than the full original — typically a few hundred KB instead
 * of tens of MB, which is both faster and far less likely to be throttled.
 */
function cacheSourceUrl(meta: ImageMeta): string | null {
  if (meta.commonsFileName && meta.commonsFilePage) {
    return commonsThumbUrl(meta.commonsFilePage, 2400);
  }
  if (meta.originalUrl && /commons\.wikimedia\.org|upload\.wikimedia\.org/.test(meta.originalUrl)) {
    return commonsThumbUrl(normalizeCommonsFilePath(meta.originalUrl), 2400);
  }
  return meta.originalUrl;
}

async function main(): Promise<void> {
  const sharp = await loadSharp();
  if (!sharp) {
    console.error("Aborting: sharp is required for image caching.");
    process.exit(1);
  }

  ensureDir(PUBLIC_IMAGES_DIR);
  const base = readInventory();
  const overrides = loadEnrichedImages();
  const rows: EnrichedRow[] = base.map((r) => {
    const o = overrides.get(r.slug);
    return o ? { ...r, image: { ...r.image, ...o } } : r;
  });

  const manifest: Record<string, unknown> = {};
  const updated = new Map<string, ImageMeta>();

  let cachedCount = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of rows) {
    const meta = r.image;
    if (!meta.originalUrl) continue;
    const src = cacheSourceUrl(meta);
    if (!src) continue;

    const cardPath = path.join(PUBLIC_IMAGES_DIR, `${r.slug}-1200.webp`);
    const detailPath = path.join(PUBLIC_IMAGES_DIR, `${r.slug}-2400.webp`);
    const localCard = `/images/collection/${r.slug}-1200.webp`;
    const localDetail = `/images/collection/${r.slug}-2400.webp`;

    // Resume support: if already cached, record it and skip the download so
    // re-runs accumulate (and never re-fetch) past Commons rate-limits.
    if (fs.existsSync(cardPath)) {
      updated.set(r.slug, {
        ...meta,
        localPath: localCard,
        license: meta.license,
        verifiedAt: meta.verifiedAt ?? nowIso()
      });
      manifest[r.slug] = {
        slug: r.slug,
        card: localCard,
        detail: fs.existsSync(detailPath) ? localDetail : localCard,
        originalUrl: meta.originalUrl,
        license: meta.license,
        attribution: meta.attribution,
        commonsFilePage: meta.commonsFilePage,
        cachedAt: meta.verifiedAt ?? nowIso()
      };
      skipped++;
      continue;
    }

    // Recover a missing license straight from Commons so public-domain
    // paintings (whose LicenseShortName was absent at resolve time) can be
    // cached. Rights that stay unclear are still skipped.
    let license = meta.license;
    let attribution = meta.attribution;
    let artistCredit = meta.artistCredit;
    if (!rightsAllowCaching(license) && meta.commonsFileName) {
      const looked = await lookupCommonsLicense(meta.commonsFileName);
      license = looked.license ?? license;
      attribution = looked.attribution ?? attribution;
      artistCredit = looked.artist ?? artistCredit;
      await sleep(120);
    }
    if (!rightsAllowCaching(license)) continue; // rights unclear → do not cache

    const buf = await download(src);
    if (!buf) {
      console.warn(`download failed (will retry on next run): ${r.slug}`);
      failed++;
      continue;
    }

    try {
      const img = sharp(buf, { failOn: "none" });
      const meta0 = await img.metadata();
      const srcWidth = meta0.width ?? 0;

      // Never upscale.
      const cardW = Math.min(1200, srcWidth || 1200);
      const detailW = Math.min(2400, srcWidth || 2400);

      await sharp(buf).resize({ width: cardW, withoutEnlargement: true }).webp({ quality: 82 }).toFile(cardPath);
      if (detailW > cardW) {
        await sharp(buf).resize({ width: detailW, withoutEnlargement: true }).webp({ quality: 85 }).toFile(detailPath);
      }

      updated.set(r.slug, {
        ...meta,
        localPath: localCard,
        license,
        attribution,
        artistCredit,
        width: meta0.width ?? meta.width,
        height: meta0.height ?? meta.height,
        verifiedAt: nowIso()
      });

      manifest[r.slug] = {
        slug: r.slug,
        card: localCard,
        detail: fs.existsSync(detailPath) ? localDetail : localCard,
        originalUrl: meta.originalUrl,
        license,
        attribution,
        commonsFilePage: meta.commonsFilePage,
        cachedAt: nowIso()
      };
      cachedCount++;
      console.log(`cached ${r.slug}`);
      // Be patient between renders so Commons does not throttle us.
      await sleep(900);
    } catch (e) {
      console.warn(`failed to process ${r.slug}: ${String(e)}`);
      failed++;
    }
  }

  const merged = rows.map((r) => {
    const u = updated.get(r.slug);
    return u ? { ...r, image: u } : r;
  });
  writeEnriched(merged);
  writeJson(path.join(DATA_DIR, "image-manifest.json"), {
    generated: nowIso(),
    count: Object.keys(manifest).length,
    images: manifest
  });

  console.log(
    `Done. newly cached=${cachedCount}, already cached (skipped)=${skipped}, failed=${failed}, total on disk=${Object.keys(manifest).length}.`
  );
  if (failed > 0) {
    console.log(
      `${failed} downloads were throttled — just run \`npm run images:cache\` again to pick them up (already-cached files are skipped).`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
