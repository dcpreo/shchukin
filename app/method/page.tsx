import type { Metadata } from "next";
import { SectionIntro } from "@/components/SectionIntro";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { ProvenanceSpine } from "@/components/ProvenanceSpine";
import { ImageRightsNotice } from "@/components/ImageRightsNotice";

export const metadata: Metadata = {
  title: "Evidence & Provenance Method",
  description:
    "The methodology of the Shchukin Collection Archive: the Public / Family-asserted / Estate evidence-tier system, why the distinction matters, conservative treatment of attribution and ownership, image-rights policy and citation logic."
};

const TIERS = [
  {
    tier: "Public",
    body: "Independently documented in scholarship, museum records, press, or institutional publication. The Sergei provenance, the museum holdings, the existence of Gallery SHCHUKIN — all Public."
  },
  {
    tier: "Family-asserted",
    body: "Stated publicly by the family or gallery and repeated in press, but not independently corroborated. The clearest case is the modern family's descent from the historic Shchukins — carried as Family-asserted until a genealogical record is produced."
  },
  {
    tier: "Estate",
    body: "Held in family / estate records — true to first-hand knowledge but not on the open web. Nikolai's dates, the NACFUND 1997 founding year, and any object detail awaiting executor-held files sit here."
  }
];

export default function MethodPage() {
  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Method"
        title="Evidence & Provenance"
        lede="One discipline runs through every chapter: state what is documented, flag what is asserted, and never let the second masquerade as the first. It is what makes the archive usable if a scholar, buyer, or court ever tests it."
      />

      {/* Tiers */}
      <section className="mt-12">
        <h2 className="label mb-5">The three evidence tiers</h2>
        <div className="space-y-4">
          {TIERS.map((t) => (
            <div
              key={t.tier}
              className="rounded-sm border border-line bg-paper p-5"
            >
              <EvidenceBadge value={t.tier} />
              <p className="prose-archive mt-3 text-sm">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why it matters */}
      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="label-accent mb-3">Why the distinction matters</h2>
          <div className="prose-archive text-sm">
            <p>
              The archive is built to be defensible in scholarly or legal use.
              A collection record that blends documented fact with family memory
              is worthless the moment it is challenged. By tiering every claim,
              the archive lets a reader trust the Public record absolutely,
              weigh the Family-asserted material as testimony, and treat Estate
              material as private knowledge pending disclosure.
            </p>
            <p>
              The same logic that governs an object's provenance governs every
              statement on this site: an attribution, a date, a relationship, an
              ownership claim. Where a verifiable source has not been reached,
              the field is left blank — deliberately. A blank is never an
              invitation to invent.
            </p>
          </div>
        </div>
        <div>
          <h2 className="label-accent mb-3">
            Conservative treatment of attribution &amp; ownership
          </h2>
          <ul className="prose-archive space-y-3 text-sm">
            <li>
              The modern branch is <strong>not</strong> presented as
              genealogically proven; descent is Family-asserted.
            </li>
            <li>
              Avant-garde works are <strong>not</strong> described as
              authenticated unless a formal authentication is on record.
            </li>
            <li>
              Nikolai's collection is <strong>not</strong> presented as having a
              complete public inventory — because none exists.
            </li>
            <li>
              Sergei's historic collection is <strong>never</strong> merged with
              modern Foundation holdings, and the Foundation is never implied to
              own the museum-held Sergei works.
            </li>
            <li>
              The archive distinguishes throughout: historic collection · former
              collection · public museum holding · Gallery SHCHUKIN exhibition ·
              estate-held archive · contemporary foundation activity.
            </li>
          </ul>
        </div>
      </section>

      {/* Provenance model */}
      <section className="mt-14">
        <h2 className="label-accent mb-3">
          The provenance model (Sergei — the standard)
        </h2>
        <p className="prose-archive mb-5 max-w-prose text-sm">
          Every Sergei object carries one chain. Flagships are gold-verified with
          dual numbering — current accession plus the historical ГМНЗИ number,
          the provenance fingerprint that links any object to the 1923–48
          museum.
        </p>
        <ProvenanceSpine />
      </section>

      {/* Image & citation policy */}
      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="label-accent mb-3">Image-rights policy</h2>
          <ImageRightsNotice />
        </div>
        <div>
          <h2 className="label-accent mb-3">Citation &amp; source logic</h2>
          <div className="prose-archive text-sm">
            <p>
              Every entity and object record names its sources. The anchor for
              the family as a whole is the Pushkin Museum's 2019 exhibition
              “Shchukin. Biography of a Collection,” which reconstructed all four
              brothers' holdings. Sergei's objects are sourced to the
              NeWestMuseum/GMNZI reconstruction, the Hermitage and the Pushkin,
              with Baldassari 2016 for the catalogue.
            </p>
            <p>
              No inventory number, image URL, attribution, date, or relationship
              is invented. Every blank marks where a verifiable source has not
              yet been reached — and the roadmap records exactly how each gap is
              to be closed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
