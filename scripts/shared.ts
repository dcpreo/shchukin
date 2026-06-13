/**
 * Shared helpers for the image-pipeline scripts. Kept free of `server-only`
 * (so it runs under tsx/node) and free of network I/O.
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsvObjects } from "../lib/csv";
import { artworkSlugBase, uniqueSlugs } from "../lib/slug";
import { classifyArtworkImage, type ImageMeta } from "../lib/image";
import type { Artwork } from "../lib/types";

export const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data");
export const REPORTS_DIR = path.join(ROOT, "reports");
export const PUBLIC_IMAGES_DIR = path.join(ROOT, "public", "images", "collection");

export interface EnrichedRow extends Artwork {
  image: ImageMeta;
}

/** Read the canonical inventory CSV, assign slugs and classify each image. */
export function readInventory(): EnrichedRow[] {
  const csv = fs.readFileSync(
    path.join(DATA_DIR, "shchukin_full_inventory.csv"),
    "utf8"
  );
  const raw = parseCsvObjects(csv);
  const base: Artwork[] = raw.map((r) => ({
    slug: "",
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
  return base.map((r, i) => ({
    ...r,
    slug: slugs[i],
    image: classifyArtworkImage(r)
  }));
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeJson(file: string, data: unknown): void {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Load the enriched file's per-slug image overrides, if it exists. */
export function loadEnrichedImages(): Map<string, ImageMeta> {
  const map = new Map<string, ImageMeta>();
  const file = path.join(DATA_DIR, "artworks.enriched.json");
  const json = readJson<{ artworks?: { slug: string; image?: ImageMeta }[] }>(
    file,
    {}
  );
  for (const a of json.artworks ?? []) {
    if (a.slug && a.image) map.set(a.slug, a.image);
  }
  return map;
}

/**
 * Write data/artworks.enriched.json from the rows. Existing per-slug image
 * metadata is merged so resolver/validator runs accumulate rather than reset.
 */
export function writeEnriched(rows: EnrichedRow[]): void {
  writeJson(path.join(DATA_DIR, "artworks.enriched.json"), {
    generated: new Date().toISOString(),
    count: rows.length,
    artworks: rows.map((r) => ({
      slug: r.slug,
      artist: r.artist,
      titleEN: r.titleEN,
      titleRU: r.titleRU,
      date: r.date,
      medium: r.medium,
      dimensionsCm: r.dimensionsCm,
      museum: r.museum,
      inventoryId: r.inventoryId,
      category: r.category,
      image: r.image
    }))
  });
}

export const nowIso = (): string => new Date().toISOString();
