import type { Metadata } from "next";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { MarkdownContent } from "@/components/MarkdownContent";
import { getEntityById, getSourceMarkdown } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Four Historic Brothers",
  description:
    "Pyotr, Sergei, Dmitri and Ivan Shchukin — four brothers, four collections, and where each is held today: the State Historical Museum, the Hermitage and the Pushkin."
};

// Image-sourcing and catalogue notes are drawn from the Family Collections
// Guide; collection facts come from the entity register so nothing is hardcoded
// beyond what the sources state.
const BROTHERS: {
  id: string;
  field: string;
  imageNotes: string;
  catalogueStatus: string;
}[] = [
  {
    id: "PYO",
    field: "Russian antiquities, textiles, Eastern & applied art; some Impressionists",
    imageNotes:
      "State Historical Museum catalogue (catalog.shm.ru); Russian State Catalogue (goskatalog.ru, search «Щукин Петр»); Wikimedia Commons: Category:State Historical Museum, Category:Shchukin Museum.",
    catalogueStatus: "Guide-level — identity, scope and key works documented; no consolidated public object list."
  },
  {
    id: "SER",
    field: "French Impressionism → Post-Impressionism → Fauvism → Cubism",
    imageNotes:
      "259-work CSV with per-painting links: direct hi-res where available, plus a Commons lookup for every work. NeWestMuseum full-image viewer for works with a known inventory id.",
    catalogueStatus: "Object-complete — see the Sergei collection and the searchable catalogue."
  },
  {
    id: "DMI",
    field: "Old Masters; 17th-century Dutch above all",
    imageNotes:
      "Pushkin official site (pushkinmuseum.art); Commons: Category:Dutch paintings in the Pushkin Museum, Category:Flemish paintings in the Pushkin Museum; Google Arts & Culture Pushkin partner page; CODART for provenance.",
    catalogueStatus: "Deep-dive guide — ~78 paintings; full object list requires the 2019 Pushkin catalogue / provenance records."
  },
  {
    id: "IVN",
    field: "Impressionist paintings; Spanish Old Masters (El Greco, Goya circle)",
    imageNotes:
      "Dispersed at the 1908 Paris sales: artsandculture.google.com and current-holder museum sites; 1908 sale catalogues on gallica.bnf.fr; Frick Photoarchive and RKD for Spanish-school provenance.",
    catalogueStatus: "Guide-level — dispersed; some works (e.g. Monet's Lilac in the Sun) reached the Pushkin."
  }
];

export default function FamilyPage() {
  const guide = getSourceMarkdown("Shchukin_Family_Collections_Guide.md");

  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Layer A · Historic brothers"
        title="The Four Historic Brothers"
        lede="Sons of the Moscow textile magnate Ivan Vasilyevich Shchukin (1818–1890) and Ekaterina Botkina. Of ten children, four became collectors of the first rank — touching almost every department of art history, from Scythian gold to Cubism. Three of the four collections now anchor major Russian state museums."
      />

      <div className="mt-12 space-y-8">
        {BROTHERS.map((b, i) => {
          const e = getEntityById(b.id);
          if (!e) return null;
          return (
            <article
              key={b.id}
              id={b.id.toLowerCase()}
              className="scroll-mt-24 rounded-sm border border-line bg-paper p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="cat-no">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-serif text-2xl font-medium text-ink">
                    {e.name}
                  </h2>
                  <p className="label mt-1">{e.dates}</p>
                </div>
                <EvidenceBadge value={e.evidence} />
              </div>

              <dl className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="label mb-1">Field of collecting</dt>
                  <dd className="text-sm text-ink/90">{b.field}</dd>
                </div>
                <div>
                  <dt className="label mb-1">Current location of collection</dt>
                  <dd className="text-sm text-ink/90">{e.location}</dd>
                </div>
                <div>
                  <dt className="label mb-1">Catalogue status</dt>
                  <dd className="text-sm text-ink/90">{b.catalogueStatus}</dd>
                </div>
                <div>
                  <dt className="label mb-1">Image-sourcing notes</dt>
                  <dd className="text-sm text-ink/90">{b.imageNotes}</dd>
                </div>
              </dl>

              <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink/80">
                {e.note}
              </p>
              <p className="source-note mt-3">
                <span className="label-accent mr-1">Sources</span>
                {e.sources}
              </p>

              {b.id === "SER" && (
                <Link
                  href="/sergei"
                  className="mt-4 inline-block font-sans text-sm text-oxblood hover:underline"
                >
                  View the object-complete Sergei collection →
                </Link>
              )}
            </article>
          );
        })}
      </div>

      <section className="mt-16 border-t border-line pt-10">
        <h2 className="label-accent mb-5">
          Source document · Family Collections Guide (verbatim)
        </h2>
        <MarkdownContent markdown={guide} />
      </section>
    </div>
  );
}
