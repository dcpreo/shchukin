import type { Metadata } from "next";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { CollectionStats } from "@/components/CollectionStats";
import { ProvenanceSpine } from "@/components/ProvenanceSpine";
import { ArtworkCard } from "@/components/ArtworkCard";
import { CollectionExplorer } from "@/components/CollectionExplorer";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import {
  getAllArtworks,
  getArtists,
  getCategories,
  getCollectionStats,
  getEntityById,
  getFeaturedArtworks,
  getMuseums
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Sergei Shchukin — French Modernism Collection",
  description:
    "Sergei Ivanovich Shchukin's reconstructed collection of 259 works of French modernism — 50 Picasso, 41 Matisse, 17 Gauguin and more — split in 1948 between the Hermitage and the Pushkin. Searchable, filterable, provenance-tracked."
};

export default function SergeiPage() {
  const stats = getCollectionStats();
  const artworks = getAllArtworks();
  const artists = getArtists().map((a) => a.name);
  const museums = getMuseums().map((m) => m.name);
  const categories = getCategories().map((c) => c.name);
  const featured = getFeaturedArtworks(8);
  const entity = getEntityById("SER");

  return (
    <div className="container-archive py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionIntro
          eyebrow="Layer A · The modernist"
          title="Sergei Ivanovich Shchukin"
          lede="Impressionism to Cubism, assembled in Moscow between 1898 and 1914: the single most important collection of new French painting of its era. Nationalised in 1918, it is today the object-complete core of this archive."
        />
        {entity && <EvidenceBadge value={entity.evidence} />}
      </div>

      {entity && (
        <p className="prose-archive mt-6 max-w-prose">{entity.note}</p>
      )}

      {/* Summary statistics */}
      <section className="mt-12">
        <h2 className="label mb-5">Collection summary</h2>
        <CollectionStats stats={stats} />
      </section>

      {/* Provenance */}
      <section className="mt-14">
        <h2 className="label-accent mb-2">Provenance spine</h2>
        <p className="max-w-prose font-serif text-xl font-medium">
          One chain carries every object.
        </p>
        <p className="prose-archive mb-6 mt-2 text-sm">
          S. Shchukin → nationalisation 5 Nov 1918 → First Museum of New Western
          Painting → GMNZI (1923) → 1948 dissolution → Hermitage or Pushkin.
        </p>
        <ProvenanceSpine />
      </section>

      {/* Featured gallery */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="label mb-1">
            Works with verified hi-res images ({stats.withDirectImage})
          </h2>
          <Link href="/images" className="font-sans text-sm text-oxblood hover:underline">
            Full image archive →
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((a) => (
            <ArtworkCard key={a.slug} artwork={a} />
          ))}
        </div>
      </section>

      {/* Searchable table */}
      <section className="mt-16 border-t border-line pt-10">
        <h2 className="label-accent mb-2">The object catalogue</h2>
        <p className="prose-archive mb-6 max-w-prose text-sm">
          All {stats.total} reconstructed objects, searchable and filterable.
          Blanks indicate values not yet verified — never invented. For the
          standalone catalogue with object pages, see{" "}
          <Link href="/collection" className="link-underline text-oxblood">
            the full collection index
          </Link>
          .
        </p>
        <CollectionExplorer
          artworks={artworks}
          artists={artists}
          museums={museums}
          categories={categories}
        />
      </section>
    </div>
  );
}
