/**
 * Validate every artwork image reference and write a report.
 *
 * For each displayable image: HEAD the URL, falling back to a ranged GET if
 * HEAD is unsupported; require status 200 and an `image/*` content-type. Local
 * cache paths are checked on disk. Network required for remote URLs.
 *
 * Outputs:
 *   reports/image-validation-report.json
 *   reports/image-validation-report.md
 */
import fs from "node:fs";
import path from "node:path";
import {
  readInventory,
  loadEnrichedImages,
  writeJson,
  REPORTS_DIR,
  ROOT,
  ensureDir,
  nowIso,
  type EnrichedRow
} from "./shared";

const UA = "ShchukinCollectionArchive/1.0 (image validator)";

interface CheckResult {
  slug: string;
  artist: string;
  titleEN: string;
  status: string;
  url: string | null;
  ok: boolean;
  httpStatus: number | null;
  contentType: string | null;
  reason: string | null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function head(url: string): Promise<Response | null> {
  try {
    return await fetch(url, { method: "HEAD", headers: { "User-Agent": UA } });
  } catch {
    return null;
  }
}

async function getRange(url: string): Promise<Response | null> {
  try {
    return await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA, Range: "bytes=0-2048" }
    });
  } catch {
    return null;
  }
}

function classify(res: Response, url: string) {
  const ct = res.headers.get("content-type");
  const ok =
    res.status >= 200 && res.status < 400 && Boolean(ct && ct.startsWith("image/"));
  return {
    url,
    ok,
    httpStatus: res.status,
    contentType: ct,
    reason: ok ? null : `status ${res.status}, content-type ${ct ?? "unknown"}`
  };
}

/**
 * Validate a single URL with retry/backoff. HEAD first, then a ranged GET;
 * 429/403/5xx are retried with exponential backoff so a momentary Commons
 * rate-limit is not mistaken for a broken image.
 */
async function validateUrl(
  url: string
): Promise<Omit<CheckResult, "slug" | "artist" | "titleEN" | "status">> {
  const backoffs = [0, 600, 1500, 3500];
  let last: Omit<CheckResult, "slug" | "artist" | "titleEN" | "status"> | null = null;
  for (const wait of backoffs) {
    if (wait) await sleep(wait);
    let res = await head(url);
    if (!res || res.status === 405 || res.status >= 400) res = await getRange(url);
    if (!res) {
      last = { url, ok: false, httpStatus: null, contentType: null, reason: "network error / unreachable" };
      continue;
    }
    const result = classify(res, url);
    if (result.ok) return result;
    last = result;
    // Only worth retrying on throttling / transient server errors.
    if (![403, 429, 500, 502, 503, 504].includes(res.status)) break;
  }
  return last ?? { url, ok: false, httpStatus: null, contentType: null, reason: "unknown" };
}

function rows(): EnrichedRow[] {
  const base = readInventory();
  const overrides = loadEnrichedImages();
  return base.map((r) => {
    const o = overrides.get(r.slug);
    return o ? { ...r, image: { ...r.image, ...o } } : r;
  });
}

async function main(): Promise<void> {
  const all = rows();
  const results: CheckResult[] = [];

  for (const r of all) {
    const { image } = r;
    const meta = { slug: r.slug, artist: r.artist, titleEN: r.titleEN, status: image.status };

    if (image.localPath) {
      const onDisk = fs.existsSync(path.join(ROOT, "public", image.localPath.replace(/^\//, "")));
      results.push({ ...meta, url: image.localPath, ok: onDisk, httpStatus: null, contentType: null, reason: onDisk ? null : "local file missing" });
      continue;
    }
    const url = image.thumbnailUrl || image.originalUrl;
    if (!url) {
      results.push({ ...meta, url: null, ok: false, httpStatus: null, contentType: null, reason: "no image url" });
      continue;
    }
    const v = await validateUrl(url);
    results.push({ ...meta, ...v });
    await sleep(250);
  }

  const total = all.length;
  const cachedLocal = results.filter((r) => r.url && r.url.startsWith("/")).length;
  const remoteValid = results.filter((r) => r.ok && r.url && r.url.startsWith("http")).length;
  const failed = results.filter((r) => !r.ok && r.url).length;
  const commonsCandidates = all.filter((r) => r.image.status === "commons_resolved").length;
  const unresolved = all.filter((r) => r.image.status === "lookup_only" || r.image.status === "missing").length;
  const broken = results.filter((r) => !r.ok && r.url && r.url.startsWith("http"));

  const summary = {
    generated: nowIso(),
    totals: {
      totalArtworks: total,
      imagesValid: results.filter((r) => r.ok).length,
      cachedLocal,
      remoteValid,
      failed,
      commonsResolved: commonsCandidates,
      unresolved
    },
    brokenUrls: broken.map((b) => ({ slug: b.slug, artist: b.artist, titleEN: b.titleEN, url: b.url, reason: b.reason })),
    results
  };

  writeJson(path.join(REPORTS_DIR, "image-validation-report.json"), summary);

  const md = `# Image validation report

_Generated ${summary.generated}_

| Metric | Count |
|---|---|
| Total artworks | ${total} |
| Images valid | ${summary.totals.imagesValid} |
| Cached locally | ${cachedLocal} |
| Remote valid | ${remoteValid} |
| Failed | ${failed} |
| Commons-resolved | ${commonsCandidates} |
| Unresolved (lookup/missing) | ${unresolved} |

## Broken / unusable URLs (${broken.length})

${broken.length === 0 ? "_None._" : broken.map((b) => `- **${b.artist} — ${b.titleEN}** \`${b.url}\` → ${b.reason}`).join("\n")}
`;

  ensureDir(REPORTS_DIR);
  fs.writeFileSync(path.join(REPORTS_DIR, "image-validation-report.md"), md, "utf8");

  console.log("Validation complete:", summary.totals);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
