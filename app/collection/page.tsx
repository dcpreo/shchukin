import type { Metadata } from "next";
import { SectionIntro } from "@/components/SectionIntro";
import { CollectionExplorer } from "@/components/CollectionExplorer";
import { ImageRightsNotice } from "@/components/ImageRightsNotice";
import {
  getAllArtworks,
  getArtists,
  getCategories,
  getCollectionStats,
  getMuseums
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Collection Search — Full Object Catalogue",
  description:
    "The complete searchable, filterable catalogue of Sergei Shchukin's 259 reconstructed objects: filter by artist, museum, category, date, image availability and inventory ID. Each object has its own provenance-tracked page."
};

export default function CollectionPage() {
  const artworks = getAllArtworks();
  const stats = getCollectionStats();
  const artists = getArtists().map((a) => a.name);
  const museums = getMuseums().map((m) => m.name);
  const categories = getCategories().map((c) => c.name);

  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Searchable index"
        title="The Collection Catalogue"
        lede={`Every one of the ${stats.total} reconstructed objects in Sergei Shchukin's collection, in a single searchable table. Filter by artist, museum, category, date, image availability and inventory ID; open any title for its full provenance-tracked record.`}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { v: stats.total, l: "Objects" },
          { v: stats.artistCount, l: "Artists" },
          { v: stats.withInventoryId, l: "With accession ID" },
          { v: stats.withDirectImage, l: "With hi-res image" }
        ].map((s) => (
          <div key={s.l} className="rounded-sm border border-line bg-paper p-3">
            <p className="font-serif text-2xl font-medium tabular-nums text-oxblood">
              {s.v}
            </p>
            <p className="label mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <CollectionExplorer
          artworks={artworks}
          artists={artists}
          museums={museums}
          categories={categories}
        />
      </div>

      <div className="mt-10">
        <ImageRightsNotice />
      </div>
    </div>
  );
}
