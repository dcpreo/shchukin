"use client";

import { useState } from "react";
import type { Artwork } from "@/lib/types";
import {
  classifyArtworkImage,
  getBestArtworkImage,
  isDisplayableImage,
  type EnrichedArtwork,
  type ImageMeta
} from "@/lib/image";

/**
 * Renders an artwork's visual slot — robustly.
 *
 * - A displayable image (local cache, verified remote, or resolved Commons
 *   file) is shown with `object-contain` so artwork is never cropped.
 * - A runtime load failure (`onError`) flips to the refined placeholder and,
 *   crucially, removes the HI-RES badge: a card can never show a "verified"
 *   badge over a blank box.
 * - Works with no usable image show "Image not yet verified" from the start.
 *
 * A plain <img> is used deliberately: remote Commons files are not under our
 * control, so we want graceful client-side error handling rather than the
 * Next image optimizer failing the request.
 */
export function ArtworkImage({
  artwork,
  className = "",
  sizes,
  showBadge = false,
  fit = "contain"
}: {
  artwork: Artwork | EnrichedArtwork;
  className?: string;
  sizes?: string;
  showBadge?: boolean;
  fit?: "contain" | "cover";
}) {
  const meta: ImageMeta =
    "image" in artwork && artwork.image
      ? artwork.image
      : classifyArtworkImage(artwork);
  const src = getBestArtworkImage(meta);
  const [errored, setErrored] = useState(false);

  const usable = src !== null && isDisplayableImage(meta) && !errored;

  if (!usable) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-line/30 text-center ${className}`}
        role="img"
        aria-label="Image not yet verified"
      >
        <span className="label-accent">Image</span>
        <span className="mt-1 font-sans text-xs text-muted">
          not yet verified
        </span>
      </div>
    );
  }

  return (
    <div className={`relative bg-line/20 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${artwork.artist} — ${artwork.titleEN}${
          artwork.date ? `, ${artwork.date}` : ""
        }`}
        loading="lazy"
        sizes={sizes}
        onError={() => setErrored(true)}
        className={`h-full w-full ${
          fit === "cover" ? "object-cover" : "object-contain"
        }`}
      />
      {showBadge && (meta.localPath ? true : meta.status === "verified") && (
        <span className="absolute left-2 top-2 z-10 rounded-sm bg-ivory/90 px-1.5 py-0.5 font-sans text-[0.6rem] uppercase tracking-wide text-oxblood">
          {meta.localPath ? "Cached" : "Hi-res"}
        </span>
      )}
    </div>
  );
}
