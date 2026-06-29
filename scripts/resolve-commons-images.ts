/**
 * Resolve Wikimedia Commons images for inventory works that lack a verified
 * direct image. Uses the Commons MediaWiki API (not blind HTML scraping) and
 * accepts a candidate only under conservative matching rules.
 *
 * Network required (egress to commons.wikimedia.org). Outputs:
 *   data/resolved-images.json   — accepted, high/medium confidence matches
 *   data/image-candidates.json  — weak matches kept for manual review only
 *   data/image-errors.json      — query/API errors
 * and merges accepted matches into data/artworks.enriched.json.
 *
 * CRITICAL: accuracy beats completeness. If a match is uncertain it is stored
 * as a candidate, never attached as the artwork image.
 */
import {
  readInventory,
  writeEnriched,
  writeJson,
  loadEnrichedImages,
  DATA_DIR,
  nowIso,
  type EnrichedRow
} from "./shared";
import path from "node:path";
import {
  commonsFilePageUrl,
  commonsThumbUrl,
  normalizeCommonsFilePath,
  type ImageMeta
} from "../lib/image";

const API = "https://commons.wikimedia.org/w/api.php";
const UA =
  "ShchukinCollectionArchive/1.0 (image resolver; contact archive@shchukin-foundation.org)";

interface CommonsCandidate {
  title: string; // "File:Name.jpg"
  fileName: string; // "Name.jpg"
  url: string | null;
  thumbUrl: string | null;
  filePage: string;
  width: number | null;
  height: number | null;
  mime: string | null;
  license: string | null;
  artist: string | null;
  attribution: string | null;
  categories: string[];
}

const STOPWORDS = new Set([
  "the","a","an","of","and","in","at","on","de","la","le","les","du","des",
  "with","near","to","для","в","на","и","с"
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9Ѐ-ӿ ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

async function fetchJson(params: Record<string, string>): Promise<any> {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function searchFiles(query: string, limit = 8): Promise<CommonsCandidate[]> {
  const data = await fetchJson({
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: String(limit),
    prop: "imageinfo|categories",
    iiprop: "url|size|mime|extmetadata",
    cllimit: "max"
  });
  const pages = data?.query?.pages;
  if (!pages) return [];
  const out: CommonsCandidate[] = [];
  for (const key of Object.keys(pages)) {
    const p = pages[key];
    const ii = p.imageinfo?.[0];
    const ext = ii?.extmetadata ?? {};
    const fileName = String(p.title || "").replace(/^File:/i, "");
    out.push({
      title: p.title,
      fileName,
      url: ii?.url ?? null,
      thumbUrl: ii?.url ? commonsThumbUrl(commonsFilePageUrl(fileName), 1000) : null,
      filePage: commonsFilePageUrl(fileName),
      width: ii?.width ?? null,
      height: ii?.height ?? null,
      mime: ii?.mime ?? null,
      license: ext.LicenseShortName?.value ?? null,
      artist: stripHtml(ext.Artist?.value ?? null),
      attribution: stripHtml(ext.Attribution?.value ?? ext.Credit?.value ?? null),
      categories: (p.categories ?? []).map((c: any) =>
        String(c.title || "").replace(/^Category:/i, "")
      )
    });
  }
  return out;
}

function stripHtml(s: string | null): string | null {
  if (!s) return null;
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() || null;
}

interface Score {
  artistMatch: boolean;
  titleMatch: boolean;
  museumMatch: boolean;
  shchukinMention: boolean;
  inventoryMatch: boolean;
  categoryMatch: boolean;
  count: number;
}

function scoreCandidate(row: EnrichedRow, c: CommonsCandidate): Score {
  const hay = [
    c.fileName,
    c.artist ?? "",
    c.attribution ?? "",
    c.categories.join(" ")
  ]
    .join(" ")
    .toLowerCase();
  const hayTokens = new Set(tokens(hay));

  const artistTokens = tokens(row.artist).filter((t) => t.length > 3);
  const artistMatch =
    artistTokens.length > 0 && artistTokens.every((t) => hay.includes(t));

  const titleTokens = tokens(row.titleEN);
  const titleHits = titleTokens.filter((t) => hayTokens.has(t)).length;
  const titleMatch =
    titleTokens.length > 0 && titleHits / titleTokens.length >= 0.6;

  const museum = row.museum.toLowerCase();
  const museumMatch =
    (museum.includes("pushkin") && hay.includes("pushkin")) ||
    (museum.includes("hermitage") && hay.includes("hermitage"));

  const shchukinMention = /sh?chukin|schukin/.test(hay);

  const invDigits = (row.inventoryId.match(/\d{3,}/) || [])[0];
  const inventoryMatch = Boolean(invDigits && hay.includes(invDigits));

  const categoryMatch = c.categories.some((cat) =>
    /schukin|shchukin|pushkin museum|hermitage|google art project/i.test(cat)
  );

  const flags = [
    artistMatch,
    titleMatch,
    museumMatch,
    shchukinMention,
    inventoryMatch,
    categoryMatch
  ];
  return {
    artistMatch,
    titleMatch,
    museumMatch,
    shchukinMention,
    inventoryMatch,
    categoryMatch,
    count: flags.filter(Boolean).length
  };
}

/** Conservative acceptance: require correct artist plus a corroborating signal. */
function decide(score: Score): "accept-high" | "accept-medium" | "candidate" {
  if (!score.artistMatch) return "candidate"; // never attach a wrong-artist file
  const corroboration =
    score.titleMatch ||
    score.inventoryMatch ||
    (score.museumMatch && score.shchukinMention) ||
    score.categoryMatch;
  if (!corroboration) return "candidate";
  if (score.count >= 3) return "accept-high";
  if (score.count >= 2) return "accept-medium";
  return "candidate";
}

function isImage(c: CommonsCandidate): boolean {
  return Boolean(c.url && c.mime && c.mime.startsWith("image/"));
}

async function main(): Promise<void> {
  const rows = readInventory();
  const targets = rows.filter(
    (r) =>
      r.image.status === "failed" ||
      r.image.status === "lookup_only" ||
      r.image.status === "missing"
  );

  const resolved: Record<string, unknown> = {};
  const candidates: Record<string, unknown> = {};
  const errors: Record<string, unknown> = {};
  const accepted = new Map<string, ImageMeta>();

  console.log(`Resolving ${targets.length} works via Commons…`);

  for (const row of targets) {
    const queries = [
      `${row.artist} ${row.titleEN}`,
      `${row.artist} ${row.titleEN} Shchukin`,
      `${row.artist} ${row.titleEN} ${row.museum}`
    ].filter((q) => q.trim());

    try {
      let best: { c: CommonsCandidate; score: Score } | null = null;
      const seen = new Set<string>();
      for (const q of queries) {
        const results = await searchFiles(q);
        for (const c of results) {
          if (!isImage(c) || seen.has(c.fileName)) continue;
          seen.add(c.fileName);
          const score = scoreCandidate(row, c);
          if (!best || score.count > best.score.count) best = { c, score };
        }
        await new Promise((r) => setTimeout(r, 200)); // be polite
      }

      if (!best) {
        candidates[row.slug] = { reason: "no image results", queries };
        continue;
      }

      const verdict = decide(best.score);
      const record = {
        slug: row.slug,
        artist: row.artist,
        titleEN: row.titleEN,
        fileName: best.c.fileName,
        filePage: best.c.filePage,
        url: best.c.url,
        score: best.score,
        verdict
      };

      if (verdict === "candidate") {
        candidates[row.slug] = record;
        continue;
      }

      resolved[row.slug] = record;
      accepted.set(row.slug, {
        status: "commons_resolved",
        source: "wikimedia_commons",
        originalUrl: best.c.url ? normalizeCommonsFilePath(best.c.filePage) : null,
        thumbnailUrl: best.c.thumbUrl,
        localPath: null,
        sourcePageUrl: row.image.sourcePageUrl,
        commonsFilePage: best.c.filePage,
        commonsFileName: best.c.fileName,
        commonsSearchUrl: row.image.commonsSearchUrl,
        license: best.c.license,
        artistCredit: best.c.artist,
        attribution: best.c.attribution,
        width: best.c.width,
        height: best.c.height,
        verifiedAt: nowIso(),
        confidence: verdict === "accept-high" ? "high" : "medium",
        notes: `Resolved from Commons (${best.score.count} matching signals).`
      });
    } catch (err) {
      errors[row.slug] = { message: String(err) };
    }
  }

  // Merge accepted into the enriched dataset (preserve already-verified rows).
  const existing = loadEnrichedImages();
  const merged = rows.map((r) => {
    const acc = accepted.get(r.slug);
    const prior = existing.get(r.slug);
    if (acc) return { ...r, image: acc };
    if (prior) return { ...r, image: { ...r.image, ...prior } };
    return r;
  });
  writeEnriched(merged);

  writeJson(path.join(DATA_DIR, "resolved-images.json"), {
    generated: nowIso(),
    count: Object.keys(resolved).length,
    resolved
  });
  writeJson(path.join(DATA_DIR, "image-candidates.json"), {
    generated: nowIso(),
    count: Object.keys(candidates).length,
    candidates
  });
  writeJson(path.join(DATA_DIR, "image-errors.json"), {
    generated: nowIso(),
    count: Object.keys(errors).length,
    errors
  });

  console.log(
    `Done. accepted=${accepted.size} candidates=${
      Object.keys(candidates).length
    } errors=${Object.keys(errors).length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
