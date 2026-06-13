import type { Artwork } from "@/lib/types";

/**
 * Renders an artwork's visual slot.
 * - Direct hi-res URL present → show the remote Commons original.
 * - Otherwise → a refined "Image not yet verified" placeholder.
 *
 * We never hotlink images discovered outside the dataset, and we never
 * fabricate thumbnails. A plain <img> is used deliberately so unverified or
 * missing remote files degrade gracefully rather than breaking the build.
 */
export function ArtworkImage({
  artwork,
  className = "",
  sizes
}: {
  artwork: Artwork;
  className?: string;
  sizes?: string;
}) {
  if (artwork.imageDirectHiRes) {
    return (
      <img
        src={artwork.imageDirectHiRes}
        alt={`${artwork.artist} — ${artwork.titleEN}${
          artwork.date ? `, ${artwork.date}` : ""
        }`}
        loading="lazy"
        sizes={sizes}
        className={`bg-line/40 object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center bg-line/30 text-center ${className}`}
      role="img"
      aria-label="Image not yet verified"
    >
      <span className="label-accent">Image</span>
      <span className="mt-1 font-sans text-xs text-muted">not yet verified</span>
    </div>
  );
}
