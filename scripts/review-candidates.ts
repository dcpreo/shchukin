/**
 * Review and (optionally) promote resolver candidates.
 *
 * `images:resolve` parks uncertain Commons matches in data/image-candidates.json
 * rather than attaching them. Many are actually correct but were held back by
 * the strict auto-accept rule (e.g. a file named "Renoir_-_Femme_en_noir..."
 * fails a full "Pierre Auguste Renoir" token match). This script re-scores each
 * candidate with a surname-based artist check and ranks them so promotion is a
 * quick, safe decision.
 *
 *   npm run images:review            → print a ranked report (read-only)
 *   npm run images:review -- --apply → promote STRONG matches into the CSV
 *
 * A promotion only ever fills an EMPTY "Image (direct hi-res)" cell with a
 * verified Commons Special:FilePath URL; it never overwrites an existing link
 * and never touches any other row. Accuracy beats completeness — anything below
 * the STRONG bar is left for a human eye.
 */
import fs from "node:fs";
import path from "node:path";
import { readInventory, DATA_DIR, type EnrichedRow } from "./shared";
import { encodeCommonsFilename } from "../lib/image";

interface Score {
  artistMatch: boolean;
  titleMatch: boolean;
  museumMatch: boolean;
  shchukinMention: boolean;
  inventoryMatch: boolean;
  categoryMatch: boolean;
  count: number;
}
interface Candidate {
  slug: string;
  artist: string;
  titleEN: string;
  fileName?: string;
  filePage?: string;
  url?: string | null;
  score?: Score;
  reason?: string;
}

type Tier = "STRONG" | "MAYBE" | "WEAK";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
}

/** Last meaningful token of the artist name (the surname). */
function surname(artist: string): string {
  const parts = norm(artist)
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
  return parts[parts.length - 1] ?? "";
}

function tierFor(c: Candidate): Tier {
  if (!c.fileName || !c.score) return "WEAK";
  const sn = surname(c.artist);
  const surnameMatch = sn.length > 2 && norm(c.fileName).includes(sn);
  const corroborated =
    c.score.titleMatch || c.score.inventoryMatch || c.score.categoryMatch;
  if (surnameMatch && corroborated) return "STRONG";
  if (surnameMatch || corroborated || c.score.count >= 2) return "MAYBE";
  return "WEAK";
}

function directUrl(fileName: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeCommonsFilename(
    fileName
  )}`;
}

function signals(c: Candidate): string {
  if (!c.score) return c.reason ?? "no candidate file";
  const s = c.score;
  return [
    s.titleMatch && "title",
    s.inventoryMatch && "inventory",
    s.museumMatch && "museum",
    s.categoryMatch && "category",
    s.shchukinMention && "shchukin"
  ]
    .filter(Boolean)
    .join(", ") || "artist only";
}

function main(): void {
  const apply = process.argv.includes("--apply");
  const candFile = path.join(DATA_DIR, "image-candidates.json");
  if (!fs.existsSync(candFile)) {
    console.error(
      "data/image-candidates.json not found. Run `npm run images:resolve` first (needs network to Commons)."
    );
    process.exit(1);
  }

  const json = JSON.parse(fs.readFileSync(candFile, "utf8")) as {
    candidates?: Record<string, Candidate>;
  };
  const rows = readInventory();
  const bySlug = new Map<string, EnrichedRow>(rows.map((r) => [r.slug, r]));

  const cands = Object.values(json.candidates ?? {}).filter((c) => c.fileName);
  const ranked = cands
    .map((c) => ({ c, tier: tierFor(c) }))
    .sort((a, b) => {
      const order = { STRONG: 0, MAYBE: 1, WEAK: 2 };
      if (order[a.tier] !== order[b.tier]) return order[a.tier] - order[b.tier];
      return (b.c.score?.count ?? 0) - (a.c.score?.count ?? 0);
    });

  console.log(`\n${ranked.length} candidates with a Commons file:\n`);
  for (const { c, tier } of ranked) {
    const row = bySlug.get(c.slug);
    const occupied = row && row.image.status === "verified" ? " [already has direct image]" : "";
    console.log(
      `  [${tier}] ${c.artist} — ${c.titleEN}\n` +
        `        file: ${c.fileName}\n` +
        `        signals: ${signals(c)}${occupied}\n` +
        `        ${c.filePage ?? ""}`
    );
  }

  const strong = ranked.filter((r) => r.tier === "STRONG");
  console.log(
    `\nSummary: ${strong.length} STRONG · ${
      ranked.filter((r) => r.tier === "MAYBE").length
    } MAYBE · ${ranked.filter((r) => r.tier === "WEAK").length} WEAK\n`
  );

  if (!apply) {
    console.log(
      "Read-only. Re-run with `-- --apply` to promote STRONG matches into data/shchukin_full_inventory.csv."
    );
    return;
  }

  // --- apply: minimal, targeted CSV edits for STRONG matches only ---
  const csvPath = path.join(DATA_DIR, "shchukin_full_inventory.csv");
  let csv = fs.readFileSync(csvPath, "utf8");
  const promoted: string[] = [];
  const skipped: string[] = [];

  for (const { c } of strong) {
    const row = bySlug.get(c.slug);
    if (!row || !c.fileName) continue;
    const lookup = row.imageCommonsLookup.trim();
    // Only auto-fill when the direct cell is empty and we can anchor the edit
    // on the row's unique Commons-lookup URL: replace ",,<lookup>" (empty
    // inventory?/direct) with ",<direct>,<lookup>". Never overwrite.
    if (row.imageDirectHiRes.trim()) {
      skipped.push(`${c.artist} — ${c.titleEN} (already has a direct link)`);
      continue;
    }
    const anchor = `,,${lookup},`;
    const replacement = `,${directUrl(c.fileName)},${lookup},`;
    if (lookup && csv.includes(anchor)) {
      csv = csv.replace(anchor, replacement);
      promoted.push(`${c.artist} — ${c.titleEN} → ${c.fileName}`);
    } else {
      skipped.push(`${c.artist} — ${c.titleEN} (could not anchor edit; do it by hand)`);
    }
  }

  if (promoted.length) fs.writeFileSync(csvPath, csv, "utf8");

  console.log(`Promoted ${promoted.length} STRONG match(es) into the CSV:`);
  promoted.forEach((p) => console.log(`  ✓ ${p}`));
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length} (needs manual edit):`);
    skipped.forEach((p) => console.log(`  – ${p}`));
  }
  console.log(
    "\nNext: `npm run images:cache && npm run images:validate && npm run build`, then review /images and commit."
  );
}

main();
