import type { Metadata } from "next";
import { SectionIntro } from "@/components/SectionIntro";
import { getCollectionStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Completion Roadmap",
  description:
    "An honest research roadmap for the Shchukin Collection Archive: the documented gaps for Sergei, Dmitri, Pyotr, Ivan and Nikolai, and the concrete path to close each one."
};

const ROADMAP = [
  {
    target: "Sergei",
    gap: "~218 of 259 objects lack an accession number; ~170 lack a Russian title.",
    path: "Scraper over NeWestMuseum /data/authors/ (mechanical), or the Baldassari 2016 catalogue."
  },
  {
    target: "Dmitri",
    gap: "No object list for the ~78 paintings.",
    path: "Pushkin 2019 catalogue checklist, or a provenance-string filter on pushkinmuseum.art / goskatalog.ru."
  },
  {
    target: "Pyotr / Ivan",
    gap: "No public complete object lists.",
    path: "State Historical Museum catalogue (Pyotr); 1908 Paris sale catalogues on gallica.bnf.fr (Ivan)."
  },
  {
    target: "Nikolai",
    gap: "No public object inventory for the avant-garde collection.",
    path: "Estate records — gallery database, the “In Other Worlds” checklist, executor-held acquisition files."
  },
  {
    target: "Lineage",
    gap: "Modern → historic descent unverified.",
    path: "Genealogical record; until then carried as Family-asserted."
  }
];

export default function RoadmapPage() {
  const stats = getCollectionStats();
  const accessionGap = stats.total - stats.withInventoryId;
  const ruGap = stats.total - stats.withRussianTitle;

  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Roadmap"
        title="Completion Roadmap"
        lede="The archive states its own boundaries. Every gap below is a place where a verifiable source has not yet been reached — not a weakness, but the next unit of work, with a concrete path to close it."
      />

      {/* Live figures from the dataset */}
      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { v: `${stats.withInventoryId}/${stats.total}`, l: "Sergei objects with accession ID" },
          { v: accessionGap, l: "Sergei objects awaiting accession ID" },
          { v: ruGap, l: "Sergei objects awaiting Russian title" }
        ].map((s) => (
          <div key={s.l} className="rounded-sm border border-line bg-paper p-4">
            <p className="font-serif text-2xl font-medium tabular-nums text-oxblood">
              {s.v}
            </p>
            <p className="label mt-1">{s.l}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="overflow-x-auto rounded-sm border border-line">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="bg-paper">
                {["Target", "Gap", "Path to close"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-ink/20 px-4 py-2.5 text-left font-sans text-[0.68rem] font-semibold uppercase tracking-wide text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROADMAP.map((r) => (
                <tr
                  key={r.target}
                  className="border-b border-line align-top last:border-0 odd:bg-paper/40"
                >
                  <td className="px-4 py-3 font-medium text-ink">{r.target}</td>
                  <td className="px-4 py-3 text-ink/80">{r.gap}</td>
                  <td className="px-4 py-3 text-ink/80">{r.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="prose-archive mt-10 max-w-prose text-sm">
        One rule is observed throughout: nothing — no inventory number, image
        URL, attribution, date, or relationship — is invented. Hand over any
        estate checklist or museum catalogue, and the relevant guide-level
        chapter can be raised to the object-complete standard already achieved
        for Sergei.
      </p>
    </div>
  );
}
