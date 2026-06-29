/**
 * Stable slug generation for inventory objects.
 *
 * Slugs are built from artist + titleEN + date so that repeated titles
 * (e.g. several "Still Life" works) remain distinct. Accents, punctuation
 * and whitespace are normalised. A short numeric suffix is appended only if
 * two rows still collide after normalisation, keeping URLs deterministic.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[‐-―]/g, "-") // various dashes → hyphen
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, "") // trim hyphens
    .replace(/-{2,}/g, "-"); // collapse repeats
}

/** Base slug for an artwork, before collision de-duplication. */
export function artworkSlugBase(artist: string, titleEN: string, date: string): string {
  const parts = [artist, titleEN, date].filter((p) => p && p.trim().length > 0);
  const base = slugify(parts.join(" "));
  return base || "untitled-work";
}

/**
 * Assigns unique slugs across a list of rows, appending -2, -3, … to any
 * collisions in a stable order so generated routes never clash.
 */
export function uniqueSlugs<T>(
  items: T[],
  baseOf: (item: T) => string
): string[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = baseOf(item);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  });
}
