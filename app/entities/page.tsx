import type { Metadata } from "next";
import { SectionIntro } from "@/components/SectionIntro";
import { EntitiesExplorer } from "@/components/EntitiesExplorer";
import { getEntities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Entity Register",
  description:
    "The ten-entity master register of the Shchukin Collection Archive — from the patriarch Ivan Vasilyevich Shchukin to Gallery SHCHUKIN and the present brand — with role, dates, scale, location, evidence tier and catalogue status."
};

export default function EntitiesPage() {
  const entities = getEntities();

  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Master register"
        title="Entity Register"
        lede={`All ${entities.length} entities of the archive in one machine-readable register, spanning Origins, the four historic brothers, the modern chapter and contemporary custodianship. Filter by chapter, evidence tier and catalogue status.`}
      />

      <div className="mt-10">
        <EntitiesExplorer entities={entities} />
      </div>

      <p className="source-note mt-8 border-t border-line pt-6">
        Source: <code className="font-sans">shchukin_entities.json</code> /{" "}
        <code className="font-sans">shchukin_entities.csv</code>. Evidence tiers
        and notes are reproduced verbatim from the register.
      </p>
    </div>
  );
}
