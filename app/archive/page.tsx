import type { Metadata } from "next";
import { SectionIntro } from "@/components/SectionIntro";
import { ArchiveLayerCard } from "@/components/ArchiveLayerCard";
import { Timeline } from "@/components/Timeline";
import { ProvenanceSpine } from "@/components/ProvenanceSpine";
import { MarkdownContent } from "@/components/MarkdownContent";
import { getCollectionStats, getSourceMarkdown } from "@/lib/data";

export const metadata: Metadata = {
  title: "Master Index & System of Findings",
  description:
    "The layered architecture of the Shchukin Collection Archive: Origins, the four historic brothers, the modern chapter, and contemporary custodianship — with master timeline and provenance spine."
};

const LAYERS = [
  {
    layer: "0 · Origins",
    scope:
      "Ivan Vasilyevich Shchukin (1818–1890) & the Botkin marriage — the textile fortune that funded everything.",
    status: "Context",
    href: "/entities"
  },
  {
    layer: "A · Historic brothers",
    scope:
      "Pyotr, Sergei, Dmitri, Ivan — the canonical Shchukin collections, now in Russian state museums.",
    status: "Sergei object-complete; others guide-level",
    href: "/family"
  },
  {
    layer: "B · Modern chapter",
    scope:
      "Nikolai Shchukin (1953–2024) & Gallery SHCHUKIN — the 20th–21st-century revival.",
    status: "Chapter-level",
    href: "/modern"
  },
  {
    layer: "C · Contemporary",
    scope:
      "Dmitry Shchukin, the present brand, fairs and forward activity.",
    status: "Institutional",
    href: "/entities"
  }
];

export default function ArchivePage() {
  const stats = getCollectionStats();
  const masterIndex = getSourceMarkdown("Shchukin_Archive_MASTER_INDEX.md");

  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Master Index"
        title="The Shchukin Collection Archive — System of Findings"
        lede="A dynasty of collectors across six generations of activity (1818–present), four historic collections, one modern collection, and the institutions that carry the name today — each documented to the depth the sources allow, and each tagged by evidence tier."
      />

      {/* Layered architecture */}
      <section className="mt-12">
        <h2 className="label mb-4">The layered architecture</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {LAYERS.map((l) => (
            <ArchiveLayerCard
              key={l.layer}
              layer={l.layer}
              scope={l.scope}
              status={l.status}
              href={l.href}
            />
          ))}
        </div>
      </section>

      {/* Collections at a glance */}
      <section className="mt-14">
        <h2 className="label mb-4">The collections at a glance</h2>
        <div className="overflow-x-auto rounded-sm border border-line">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="bg-paper">
                {["Collector", "Field", "Scale", "Now in", "Catalogue here"].map(
                  (h) => (
                    <th
                      key={h}
                      className="border-b border-ink/20 px-3 py-2 text-left font-sans text-[0.68rem] font-semibold uppercase tracking-wide text-muted"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {[
                ["Pyotr", "Russian antiquities", "tens of thousands", "State Historical Museum", "Guide"],
                ["Sergei", "French modernism", `${stats.total} works`, "Hermitage + Pushkin", "Object-complete"],
                ["Dmitri", "Dutch Old Masters", "~78", "Pushkin", "Deep-dive guide"],
                ["Ivan", "Impressionist + Spanish OM", "dispersed", "scattered; some Pushkin", "Guide"],
                ["Nikolai", "Russian avant-garde + contemporary", "no public inventory", "family / exhibited", "Chapter"]
              ].map((row) => (
                <tr key={row[0]} className="border-b border-line last:border-0 odd:bg-paper/40">
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-3 py-2 ${i === 0 ? "font-medium text-ink" : "text-ink/80"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="source-note mt-3">
          Sergei breakdown (catalogued core): Picasso 50 · Matisse 41 · Gauguin
          17 · Derain 16 · Monet 13 · Cézanne 8 · Van Gogh 4 + long tail. 229
          paintings, 22 works on paper, 6 studies, 2 sculpture/object lines.
          Hermitage 146 / Pushkin 113.
        </p>
      </section>

      {/* Timeline + provenance */}
      <section className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="label mb-4">Master timeline</h2>
          <Timeline />
        </div>
        <div>
          <h2 className="label mb-4">Provenance spine (Sergei — the model)</h2>
          <ProvenanceSpine />
          <p className="prose-archive mt-4 text-sm">
            Flagships are gold-verified with dual numbering — current accession +
            historical ГМНЗИ number (e.g. <em>Dance</em> ГЭ-9673 / ГМНЗИ-98;{" "}
            <em>Music</em> ГЭ-9674 / ГМНЗИ-97). The ГМНЗИ number is the
            provenance fingerprint linking any object to the 1923–48 museum.
          </p>
        </div>
      </section>

      {/* Full source document */}
      <section className="mt-16 border-t border-line pt-10">
        <h2 className="label-accent mb-5">Source document · Master Index (verbatim)</h2>
        <MarkdownContent markdown={masterIndex} />
      </section>
    </div>
  );
}
