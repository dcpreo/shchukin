import type { Artwork } from "./types";

/**
 * Normalised image metadata for a single artwork.
 *
 * This is the single source of truth for how an image is displayed and
 * credited. It is produced deterministically from the dataset by
 * `classifyArtworkImage()` (no network required) and may be enriched with
 * Commons metadata (license, dimensions, local cache path) by the scripts in
 * /scripts when run in an environment with network egress to Wikimedia.
 */
export type ImageStatus =
  | "verified" // a direct, loadable image file (e.g. Commons original) is known
  | "commons_resolved" // resolved from a Commons API search and accepted
  | "lookup_only" // only a Commons search / museum page is available
  | "missing" // no image reference at all
  | "failed"; // a claimed image link is not a usable image file — needs review

export type ImageSource =
  | "dataset"
  | "wikimedia_commons"
  | "museum"
  | "manual";

export type ImageConfidence = "high" | "medium" | "low";

export interface ImageMeta {
  status: ImageStatus;
  source: ImageSource;
  originalUrl: string | null;
  thumbnailUrl: string | null;
  localPath: string | null;
  sourcePageUrl: string | null;
  commonsFilePage: string | null;
  commonsFileName: string | null;
  /** Commons MediaSearch URL (the "Find image on Commons" lookup). */
  commonsSearchUrl: string | null;
  license: string | null;
  artistCredit: string | null;
  attribution: string | null;
  width: number | null;
  height: number | null;
  /** ISO timestamp of last successful validation, or null if unvalidated. */
  verifiedAt: string | null;
  confidence: ImageConfidence;
  notes: string | null;
}

/** An artwork with its resolved image metadata attached. */
export type EnrichedArtwork = Artwork & { image: ImageMeta };

const COMMONS_FILEPATH = "Special:FilePath/";

// ---------------------------------------------------------------------------
// URL sanitisation utilities
// ---------------------------------------------------------------------------

/** Force https and strip common tracking parameters. */
export function forceHttps(url: string): string {
  let u = url.trim();
  if (u.startsWith("http://")) u = "https://" + u.slice("http://".length);
  return stripTrackingParams(u);
}

export function stripTrackingParams(url: string): string {
  try {
    const u = new URL(url);
    const drop = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid"
    ];
    drop.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return url;
  }
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * Encode a Commons filename for use in a URL path. Spaces become underscores
 * (Commons convention); apostrophes and parentheses are preserved;
 * accented/Unicode characters are percent-encoded exactly once.
 */
export function encodeCommonsFilename(filename: string): string {
  const underscored = filename.trim().replace(/ /g, "_");
  // encodeURIComponent leaves ! ' ( ) * - . _ ~ unescaped, which Commons
  // accepts, and percent-encodes Unicode safely. We keep "/" out of names.
  return encodeURIComponent(underscored).replace(/%2F/gi, "/");
}

/** Extract the bare filename from a Commons Special:FilePath or File: URL. */
export function commonsFileNameFromUrl(url: string): string | null {
  const fp = url.indexOf(COMMONS_FILEPATH);
  if (fp >= 0) {
    const raw = url.slice(fp + COMMONS_FILEPATH.length).split(/[?#]/)[0];
    return safeDecode(raw);
  }
  const m = url.match(/\/(?:wiki\/)?(?:File|Image):([^?#]+)/i);
  if (m) return safeDecode(m[1]);
  return null;
}

/**
 * Normalise a Commons Special:FilePath URL: https, single-encoded filename,
 * no stray query string. Returns the input (https-forced) if it is not a
 * recognisable FilePath URL.
 */
export function normalizeCommonsFilePath(url: string): string {
  const name = commonsFileNameFromUrl(url);
  if (!name) return forceHttps(url);
  return `https://commons.wikimedia.org/wiki/${COMMONS_FILEPATH}${encodeCommonsFilename(
    name
  )}`;
}

/** A Commons Special:FilePath thumbnail of a given pixel width. */
export function commonsThumbUrl(filePathUrl: string, width: number): string {
  const base = normalizeCommonsFilePath(filePathUrl);
  return `${base}?width=${Math.round(width)}`;
}

export function commonsFilePageUrl(filename: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeCommonsFilename(
    filename
  )}`;
}

export function commonsSearchUrl(query: string): string {
  return `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(
    query
  )}&title=Special:MediaSearch&type=image`;
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|tiff?|svg)$/i;

export function isCommonsFilePathUrl(url: string): boolean {
  return /commons\.wikimedia\.org\/wiki\/Special:FilePath\//i.test(url);
}

export function isUploadWikimediaUrl(url: string): boolean {
  return /^https?:\/\/upload\.wikimedia\.org\//i.test(url);
}

export function isNeWestMuseumViewer(url: string): boolean {
  // The NeWestMuseum "full image viewer" is an HTML page, not an image file.
  return /newestmuseum\.ru\/.*index\.php\?/i.test(url);
}

/** Cheap, synchronous structural check — does this look like an image URL? */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.trim();
  if (!u) return false;
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  if (isNeWestMuseumViewer(u)) return false; // HTML viewer, never an image
  if (isCommonsFilePathUrl(u) || isUploadWikimediaUrl(u)) return true;
  return IMAGE_EXT.test(parsed.pathname);
}

// ---------------------------------------------------------------------------
// Classification (deterministic, no network)
// ---------------------------------------------------------------------------

function emptyMeta(): ImageMeta {
  return {
    status: "missing",
    source: "dataset",
    originalUrl: null,
    thumbnailUrl: null,
    localPath: null,
    sourcePageUrl: null,
    commonsFilePage: null,
    commonsFileName: null,
    commonsSearchUrl: null,
    license: null,
    artistCredit: null,
    attribution: null,
    width: null,
    height: null,
    verifiedAt: null,
    confidence: "low",
    notes: null
  };
}

/**
 * Classify an artwork's image purely from the dataset fields. This runs at
 * build and on the client; it never performs network I/O. The frontend treats
 * the result conservatively: a HI-RES badge is shown only for a `verified`
 * (or locally cached) image.
 */
export function classifyArtworkImage(a: Artwork): ImageMeta {
  const meta = emptyMeta();
  const direct = (a.imageDirectHiRes || "").trim();
  const lookup = (a.imageCommonsLookup || "").trim();
  const page = (a.imagePage || "").trim();

  if (lookup) meta.commonsSearchUrl = forceHttps(lookup);
  if (page) meta.sourcePageUrl = forceHttps(page);

  if (direct) {
    if (isCommonsFilePathUrl(direct) || isUploadWikimediaUrl(direct)) {
      const name = commonsFileNameFromUrl(direct);
      meta.status = "verified";
      meta.source = "wikimedia_commons";
      meta.originalUrl = normalizeCommonsFilePath(direct);
      meta.thumbnailUrl = commonsThumbUrl(direct, 1000);
      meta.commonsFileName = name;
      meta.commonsFilePage = name ? commonsFilePageUrl(name) : null;
      meta.confidence = "high";
      meta.notes = "Direct Wikimedia Commons original (Special:FilePath).";
      return meta;
    }

    if (isNeWestMuseumViewer(direct)) {
      // Dataset mislabelled an HTML viewer page as a direct image.
      meta.status = "failed";
      meta.source = "museum";
      meta.sourcePageUrl = forceHttps(direct);
      meta.confidence = "low";
      meta.notes =
        "Dataset 'direct hi-res' link is a NeWestMuseum viewer page (text/html), not a usable image file. Resolve a Commons or museum image, or treat as source page only.";
      // It still carries a Commons lookup we can offer.
      return meta;
    }

    if (isValidImageUrl(direct)) {
      meta.status = "verified";
      meta.source = "dataset";
      meta.originalUrl = forceHttps(direct);
      meta.thumbnailUrl = forceHttps(direct);
      meta.confidence = "medium";
      meta.notes = "Direct image URL from dataset (non-Commons host).";
      return meta;
    }

    // A non-empty direct link that is neither a known image nor a viewer.
    meta.status = "failed";
    meta.source = "dataset";
    meta.sourcePageUrl = forceHttps(direct);
    meta.confidence = "low";
    meta.notes = "Dataset 'direct hi-res' link is not a recognisable image URL.";
    return meta;
  }

  if (lookup) {
    meta.status = "lookup_only";
    meta.source = "wikimedia_commons";
    meta.confidence = "low";
    meta.notes = "No direct image; a Commons lookup is available.";
    return meta;
  }

  if (page) {
    meta.status = "lookup_only";
    meta.source = "museum";
    meta.confidence = "low";
    meta.notes = "No direct image; a source page is available.";
    return meta;
  }

  meta.status = "missing";
  meta.notes = "No image reference in the dataset.";
  return meta;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** True when a HI-RES / verified badge may be shown for this image. */
export function isDisplayableImage(meta: ImageMeta): boolean {
  return (
    (meta.status === "verified" ||
      meta.status === "commons_resolved" ||
      Boolean(meta.localPath)) &&
    Boolean(meta.localPath || meta.thumbnailUrl || meta.originalUrl)
  );
}

/** The best URL to place in an <img> tag, preferring local cache. */
export function getBestArtworkImage(
  artworkOrMeta: Artwork | ImageMeta
): string | null {
  const meta =
    "status" in artworkOrMeta
      ? (artworkOrMeta as ImageMeta)
      : classifyArtworkImage(artworkOrMeta as Artwork);
  if (!isDisplayableImage(meta)) return null;
  return meta.localPath || meta.thumbnailUrl || meta.originalUrl;
}

const STATUS_LABELS: Record<ImageStatus, string> = {
  verified: "Verified hi-res",
  commons_resolved: "Commons-resolved",
  lookup_only: "Commons lookup",
  missing: "Image not yet verified",
  failed: "Needs review"
};

export function getImageStatusLabel(meta: ImageMeta): string {
  if (meta.localPath) return "Cached locally";
  return STATUS_LABELS[meta.status];
}
