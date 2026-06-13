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
import type { ImageMeta } from "../lib/image";

const UA = "ShchukinCollectionArchive/1.0 (image cache)";

// Licenses we treat as safe to cache locally. Anything else → skip.
const ALLOW = /public domain|pd-|cc0|cc-by(?!-nc)|cc by(?!-nc)|no known copyright|open access/i;

function rightsAllowCaching(meta: ImageMeta): boolean {
  if (!meta.license) return false;
  return ALLOW.test(meta.license);
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

async function download(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
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

  for (const r of rows) {
    const meta = r.image;
    const src = meta.originalUrl;
    if (!src) continue;
    if (!rightsAllowCaching(meta)) continue; // rights unclear → do not cache

    const buf = await download(src);
    if (!buf) continue;

    try {
      const img = sharp(buf, { failOn: "none" });
      const meta0 = await img.metadata();
      const srcWidth = meta0.width ?? 0;

      const cardPath = path.join(PUBLIC_IMAGES_DIR, `${r.slug}-1200.webp`);
      const detailPath = path.join(PUBLIC_IMAGES_DIR, `${r.slug}-2400.webp`);

      // Never upscale.
      const cardW = Math.min(1200, srcWidth || 1200);
      const detailW = Math.min(2400, srcWidth || 2400);

      await sharp(buf).resize({ width: cardW, withoutEnlargement: true }).webp({ quality: 82 }).toFile(cardPath);
      if (detailW > cardW) {
        await sharp(buf).resize({ width: detailW, withoutEnlargement: true }).webp({ quality: 85 }).toFile(detailPath);
      }

      const localCard = `/images/collection/${r.slug}-1200.webp`;
      const localDetail = fs.existsSync(detailPath)
        ? `/images/collection/${r.slug}-2400.webp`
        : localCard;

      updated.set(r.slug, {
        ...meta,
        localPath: localCard,
        width: meta0.width ?? meta.width,
        height: meta0.height ?? meta.height,
        verifiedAt: nowIso()
      });

      manifest[r.slug] = {
        slug: r.slug,
        card: localCard,
        detail: localDetail,
        originalUrl: src,
        license: meta.license,
        attribution: meta.attribution,
        commonsFilePage: meta.commonsFilePage,
        cachedAt: nowIso()
      };
      console.log(`cached ${r.slug}`);
    } catch (e) {
      console.warn(`failed to process ${r.slug}: ${String(e)}`);
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

  console.log(`Cached ${Object.keys(manifest).length} rights-cleared images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
