import type { Metadata } from "next";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ImageRightsNotice } from "@/components/ImageRightsNotice";
import { getAllArtworks, getFeaturedArtworks } from "@/lib/data";

export const metadata: Metadata = {
  title: "Image Archive",
  description:
    "A gateway to the Shchukin collection imagery: works with verified hi-res originals first, then Wikimedia Commons lookups, then works whose images are not yet verified. Images are referenced, never re-hosted."
};

export default function ImagesPage() {
  const all = getAllArtworks();
  const direct = getFeaturedArtworks();
  const commonsOnly = all.filter(
    (a) => !a.imageDirectHiRes && a.imageCommonsLookup
  );
  const noImage = all.filter(
    (a) => !a.imageDirectHiRes && !a.imageCommonsLookup
  );

  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Image archive"
        title="Imagery Gateway"
        lede="The archive does not host images. It points to them — preferring verified high-resolution Wikimedia Commons originals, and otherwise providing a Commons lookup so the correct file can be found at its holding institution."
      />

      <div className="mt-8">
        <ImageRightsNotice />
      </div>

      {/* Tier 1: direct hi-res */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="label-accent">
            1 · Verified hi-res originals ({direct.length})
          </h2>
        </div>
        <p className="prose-archive mb-5 mt-1 max-w-prose text-sm">
          These works carry a direct full-resolution image link in the dataset.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {direct.map((a) => (
            <ArtworkCard key={a.slug} artwork={a} />
          ))}
        </div>
      </section>

      {/* Tier 2: commons lookup */}
      <section className="mt-14">
        <h2 className="label-accent">
          2 · Wikimedia Commons lookups ({commonsOnly.length})
        </h2>
        <p className="prose-archive mb-5 mt-1 max-w-prose text-sm">
          For every remaining object, a Commons MediaSearch link locates the
          correct file. Open the object page for full provenance, or jump
          straight to Commons.
        </p>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {commonsOnly.map((a) => (
            <li
              key={a.slug}
              className="flex items-baseline justify-between gap-3 border-b border-line py-1.5"
            >
              <Link
                href={`/collection/${a.slug}`}
                className="link-underline text-sm text-ink"
              >
                <span className="text-muted">{a.artist}</span>,{" "}
                {a.titleEN || "Untitled"}
              </Link>
              <a
                href={a.imageCommonsLookup}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-sans text-xs text-oxblood hover:underline"
              >
                Commons ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Tier 3: no image */}
      {noImage.length > 0 && (
        <section className="mt-14">
          <h2 className="label-accent">
            3 · Image not yet verified ({noImage.length})
          </h2>
          <p className="prose-archive mb-5 mt-1 max-w-prose text-sm">
            No image link has yet been verified for these objects. The blank is
            deliberate — see the completion roadmap.
          </p>
          <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {noImage.map((a) => (
              <li key={a.slug} className="py-1 text-sm text-ink/80">
                <Link href={`/collection/${a.slug}`} className="link-underline">
                  {a.artist}, {a.titleEN || "Untitled"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
