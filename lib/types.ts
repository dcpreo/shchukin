// Canonical, typed shapes for the Shchukin Collection Archive.
// These mirror the supplied source files exactly; no fields are invented.

/** Evidence tier as defined in the archive's method. */
export type EvidenceTier = "Public" | "Family-asserted" | "Estate" | "Mixed";

/**
 * An entity in the master register (`shchukin_entities.json` / `.csv`).
 * Ten entities span Origins, Historic brothers, the Modern chapter, and the
 * Contemporary brand.
 */
export interface Entity {
  id: string;
  name: string;
  role: string;
  dates: string;
  chapter: string;
  collected: string;
  scale: string;
  location: string;
  evidence: string;
  catalogue: string;
  note: string;
  sources: string;
}

/**
 * A single object from Sergei Shchukin's reconstructed inventory
 * (`shchukin_full_inventory.csv`, 259 works). Blank fields are deliberate:
 * they mark values not yet verified, never invented placeholders.
 */
export interface Artwork {
  slug: string;
  artist: string;
  titleEN: string;
  titleRU: string;
  date: string;
  medium: string;
  dimensionsCm: string;
  museum: string;
  inventoryId: string;
  imageDirectHiRes: string;
  imageCommonsLookup: string;
  imagePage: string;
  category: string;
}

/** Aggregate statistics derived from the inventory at build time. */
export interface CollectionStatsData {
  total: number;
  byMuseum: { name: string; count: number }[];
  byCategory: { name: string; count: number }[];
  topArtists: { name: string; count: number }[];
  artistCount: number;
  withDirectImage: number;
  withCommonsLookup: number;
  withInventoryId: number;
  withRussianTitle: number;
}
