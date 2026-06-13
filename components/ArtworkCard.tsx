import Link from "next/link";
import type { Artwork } from "@/lib/types";
import { ArtworkImage } from "./ArtworkImage";

/** Gallery-grid card for a single object. Links to its catalogue page. */
export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <Link
      href={`/collection/${artwork.slug}`}
      className="group flex flex-col rounded-sm border border-line bg-paper transition-colors hover:border-oxblood/40"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-sm">
        <ArtworkImage
          artwork={artwork}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {artwork.imageDirectHiRes && (
          <span className="absolute left-2 top-2 rounded-sm bg-ivory/90 px-1.5 py-0.5 font-sans text-[0.6rem] uppercase tracking-wide text-oxblood">
            Hi-res
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-sans text-xs text-muted">{artwork.artist}</p>
        <h3 className="mt-0.5 font-serif text-[0.95rem] font-medium leading-snug text-ink">
          {artwork.titleEN || "Untitled"}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="source-note">{artwork.date || "—"}</span>
          <span className="label">{artwork.museum}</span>
        </div>
      </div>
    </Link>
  );
}
