import type { Metadata } from "next";
import { SectionIntro } from "@/components/SectionIntro";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { EntityCard } from "@/components/EntityCard";
import { getEntityById } from "@/lib/data";

export const metadata: Metadata = {
  title: "Modern Chapter — Nikolai Shchukin & Gallery SHCHUKIN",
  description:
    "The 20th–21st-century Shchukin chapter: Nikolai Vasilyevich Shchukin (1953–2024), Gallery SHCHUKIN (founded 1987) and the National Art Collections Foundation — documented with forensic caution and clear evidence tiers."
};

// Each caution is tied to its evidence tier, mirroring the master index and the
// entity register. Nothing here is asserted beyond what the sources state.
const CAUTIONS: { tier: string; text: string }[] = [
  {
    tier: "Public",
    text: "Gallery SHCHUKIN, founded 1987, is a publicly documented institution (Moscow, Paris on Avenue Matignon from 2013, New York)."
  },
  {
    tier: "Public",
    text: "The National Art Collections Foundation (NACFUND) exists as a public entity — the non-profit component of Gallery SHCHUKIN per the gallery's own statement."
  },
  {
    tier: "Estate",
    text: "NACFUND's 1997 founding year is estate-sourced, not independently documented on the open web."
  },
  {
    tier: "Family-asserted",
    text: "The modern family's descent from the historic Sergei-era Shchukins is family-asserted and not independently genealogically corroborated."
  },
  {
    tier: "Public",
    text: "The collection of Marina and Nikolai Shchukin is publicly documented through the 2014 “In Other Worlds” exhibition (Matthew Drutt) in New York."
  },
  {
    tier: "Public",
    text: "No object-level inventory for Nikolai's collection is publicly established."
  },
  {
    tier: "Family-asserted",
    text: "Avant-garde attributions (Malevich, Kandinsky, Goncharova, Larionov, Popova, Suetin, Rozanova, Exter, Chagall) must not be presented as authenticated unless formal authentication exists."
  },
  {
    tier: "Estate",
    text: "Nikolai's dates (1953–2024), patronymic, and related particulars derive from estate records."
  }
];

export default function ModernPage() {
  const nik = getEntityById("NIK");
  const gal = getEntityById("GAL");
  const nac = getEntityById("NAC");
  const mar = getEntityById("MAR");
  const dms = getEntityById("DMS");
  const entities = [nik, gal, nac, mar, dms].filter(Boolean);

  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Layer B · Modern chapter"
        title="Nikolai Shchukin & Gallery SHCHUKIN"
        lede="A 20th–21st-century revival of the collecting name: Nikolai Vasilyevich Shchukin (1953–2024), former psychoanalyst, founder of Gallery SHCHUKIN in 1987, and a collection of Russian avant-garde and contemporary art associated jointly with Marina and Nikolai Shchukin. This chapter is documented with deliberate forensic caution."
      />

      {/* Forensic caution */}
      <section className="mt-10 rounded-sm border-2 border-oxblood/30 bg-oxblood/[0.03] p-6">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-label text-oxblood">
          Forensic caution
        </h2>
        <p className="prose-archive mt-2 text-sm">
          The modern chapter must not be merged with Sergei's historic
          collection, and its claims are tiered exactly as the sources permit.
          This is what keeps the archive defensible.
        </p>
        <ul className="mt-5 space-y-3">
          {CAUTIONS.map((c) => (
            <li key={c.text} className="flex flex-wrap items-start gap-3">
              <EvidenceBadge value={c.tier} />
              <span className="flex-1 text-sm leading-relaxed text-ink/90">
                {c.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Narrative */}
      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="label-accent mb-3">Gallery SHCHUKIN</h2>
          <p className="prose-archive text-sm">
            Founded in 1987, Gallery SHCHUKIN represents modern and contemporary
            artists across a Moscow representative office, a Paris gallery on
            Avenue Matignon (October 2013), and a New York presence
            (Chelsea, later Murray Hill). It has collaborated with the Tretyakov
            Gallery and the Museum of the East, and shown artists including
            Datuna, Semenov, Garunov, Migachev, Zaloznaya and Tishin.
          </p>
        </div>
        <div>
          <h2 className="label-accent mb-3">
            Collection &amp; the NACFUND
          </h2>
          <p className="prose-archive text-sm">
            The avant-garde holdings are associated jointly with “Marina and
            Nikolay Shchukin” in the 2014 Drutt exhibition record. The National
            Art Collections Foundation is described by the gallery as its
            non-profit component; its 1997 founding year rests on estate
            records. No public, object-level inventory of the collection has
            been established — the path to one runs through estate material:
            gallery database, the “In Other Worlds” checklist, and
            executor-held acquisition files.
          </p>
        </div>
      </section>

      {/* Entity cards */}
      <section className="mt-14">
        <h2 className="label mb-5">Entities in the modern chapter</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {entities.map((e) => (
            <EntityCard key={e!.id} entity={e!} />
          ))}
        </div>
      </section>

      <p className="source-note mt-10 border-t border-line pt-6">
        Note: this chapter is reconstructed from the entity register and the
        master index. A dedicated chapter source (Chapter5_Nikolai_Shchukin.md)
        forms part of the wider archive; where its detail exceeds the register
        it is carried at chapter level and tiered accordingly. Lineage to the
        historic Shchukins is carried as Family-asserted until a genealogical
        record is produced.
      </p>
    </div>
  );
}
