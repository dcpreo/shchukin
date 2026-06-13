"use client";

import { useMemo, useState } from "react";
import type { Entity } from "@/lib/types";
import { EntityCard } from "./EntityCard";

function normaliseTier(evidence: string): string {
  const v = evidence.toLowerCase();
  if (v.startsWith("mixed")) return "Mixed";
  if (v.startsWith("family-asserted")) return "Family-asserted";
  if (v.startsWith("estate")) return "Estate";
  return "Public";
}

/** Entity register with chapter / evidence-tier / catalogue-status filters. */
export function EntitiesExplorer({ entities }: { entities: Entity[] }) {
  const [chapter, setChapter] = useState("");
  const [tier, setTier] = useState("");
  const [catalogue, setCatalogue] = useState("");

  const chapters = useMemo(
    () => [...new Set(entities.map((e) => e.chapter))],
    [entities]
  );
  const tiers = useMemo(
    () => [...new Set(entities.map((e) => normaliseTier(e.evidence)))],
    [entities]
  );
  const catalogues = useMemo(
    () => [...new Set(entities.map((e) => e.catalogue))],
    [entities]
  );

  const results = entities.filter((e) => {
    if (chapter && e.chapter !== chapter) return false;
    if (tier && normaliseTier(e.evidence) !== tier) return false;
    if (catalogue && e.catalogue !== catalogue) return false;
    return true;
  });

  const Field = ({
    label,
    value,
    set,
    options,
    allLabel
  }: {
    label: string;
    value: string;
    set: (v: string) => void;
    options: string[];
    allLabel: string;
  }) => (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="rounded-sm border border-line bg-paper px-2 py-1.5 font-sans text-sm text-ink focus:border-oxblood focus:outline-none"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 rounded-sm border border-line bg-paper/60 p-4 sm:grid-cols-3">
        <Field
          label="Chapter"
          value={chapter}
          set={setChapter}
          options={chapters}
          allLabel="All chapters"
        />
        <Field
          label="Evidence tier"
          value={tier}
          set={setTier}
          options={tiers}
          allLabel="All tiers"
        />
        <Field
          label="Catalogue status"
          value={catalogue}
          set={setCatalogue}
          options={catalogues}
          allLabel="All statuses"
        />
      </div>

      <p className="source-note">
        {results.length} of {entities.length} entities
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {results.map((e) => (
          <EntityCard key={e.id} entity={e} />
        ))}
      </div>
    </div>
  );
}
