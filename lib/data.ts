import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parseCsvObjects } from "./csv";
import { artworkSlugBase, uniqueSlugs } from "./slug";
import type { Artwork, CollectionStatsData, Entity } from "./types";

/**
 * Build-time data pipeline.
 *
 * All site content that constitutes a factual claim is read here from the
 * supplied source files in /data — nothing is hardcoded. The functions are
 * memoised so files are read once per build.
 */

const DATA_DIR = path.join(process.cwd(), "data");

function readFile(name: string): string {
  return fs.readFileSync(path.join(DATA_DIR, name), "utf8");
}

// ---------------------------------------------------------------------------
// Artworks (Sergei Shchukin inventory — 259 objects)
// ---------------------------------------------------------------------------

let _artworks: Artwork[] | null = null;

export function getAllArtworks(): Artwork[] {
  if (_artworks) return _artworks;

  const raw = parseCsvObjects(readFile("shchukin_full_inventory.csv"));

  const base = raw.map((r) => ({
    artist: r["Artist"] ?? "",
    titleEN: r["Title (EN)"] ?? "",
    titleRU: r["Title (RU)"] ?? "",
    date: r["Date"] ?? "",
    medium: r["Medium"] ?? "",
    dimensionsCm: r["Dimensions(cm)"] ?? "",
    museum: r["Museum"] ?? "",
    inventoryId: r["Inventory ID"] ?? "",
    imageDirectHiRes: r["Image (direct hi-res)"] ?? "",
    imageCommonsLookup: r["Image (Commons lookup)"] ?? "",
    imagePage: r["Image page"] ?? "",
    category: r["Category"] ?? ""
  }));

  const slugs = uniqueSlugs(base, (r) =>
    artworkSlugBase(r.artist, r.titleEN, r.date)
  );

  _artworks = base.map((r, i) => ({ slug: slugs[i], ...r }));
  return _artworks;
}

export function getArtworkBySlug(slug: string): Artwork | undefined {
  return getAllArtworks().find((a) => a.slug === slug);
}

/** Works that carry an image link of any kind, direct first. */
export function getArtworksWithImages(): Artwork[] {
  return getAllArtworks().filter(
    (a) => a.imageDirectHiRes || a.imageCommonsLookup || a.imagePage
  );
}

/** Featured works: those with a direct hi-res URL embedded in the dataset. */
export function getFeaturedArtworks(limit?: number): Artwork[] {
  const featured = getAllArtworks().filter((a) => a.imageDirectHiRes.trim());
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export function getArtists(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of getAllArtworks()) {
    if (!a.artist) continue;
    counts.set(a.artist, (counts.get(a.artist) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getMuseums(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of getAllArtworks()) {
    if (!a.museum) continue;
    counts.set(a.museum, (counts.get(a.museum) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getCategories(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of getAllArtworks()) {
    if (!a.category) continue;
    counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getCollectionStats(): CollectionStatsData {
  const all = getAllArtworks();
  return {
    total: all.length,
    byMuseum: getMuseums(),
    byCategory: getCategories(),
    topArtists: getArtists().slice(0, 12),
    artistCount: getArtists().length,
    withDirectImage: all.filter((a) => a.imageDirectHiRes).length,
    withCommonsLookup: all.filter((a) => a.imageCommonsLookup).length,
    withInventoryId: all.filter((a) => a.inventoryId).length,
    withRussianTitle: all.filter((a) => a.titleRU).length
  };
}

// ---------------------------------------------------------------------------
// Entities (ten-entity master register)
// ---------------------------------------------------------------------------

let _entities: Entity[] | null = null;

export function getEntities(): Entity[] {
  if (_entities) return _entities;
  const json = JSON.parse(readFile("shchukin_entities.json")) as {
    entities: Entity[];
  };
  _entities = json.entities;
  return _entities;
}

export function getEntityById(id: string): Entity | undefined {
  return getEntities().find((e) => e.id === id);
}

/** Entities grouped by their archive chapter, in canonical layer order. */
export function getEntitiesByChapter(): { chapter: string; entities: Entity[] }[] {
  const order = [
    "0 · Origins",
    "A · Historic brothers",
    "B · Modern chapter (V)",
    "C · Contemporary"
  ];
  const groups = new Map<string, Entity[]>();
  for (const e of getEntities()) {
    const arr = groups.get(e.chapter) ?? [];
    arr.push(e);
    groups.set(e.chapter, arr);
  }
  const known = order
    .filter((c) => groups.has(c))
    .map((chapter) => ({ chapter, entities: groups.get(chapter)! }));
  const extra = [...groups.keys()]
    .filter((c) => !order.includes(c))
    .map((chapter) => ({ chapter, entities: groups.get(chapter)! }));
  return [...known, ...extra];
}

// Evidence-tier helpers live in lib/evidence.ts so client components can use
// them too; re-exported here for convenience in server code.
export { getEvidenceBadge, EVIDENCE_TIERS } from "./evidence";
export type { EvidenceBadgeMeta } from "./evidence";

// ---------------------------------------------------------------------------
// Source markdown documents (rendered on /archive, /family etc.)
// ---------------------------------------------------------------------------

export function getSourceMarkdown(name: string): string {
  return readFile(path.join("sources", name));
}
