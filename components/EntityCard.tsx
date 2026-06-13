import type { Entity } from "@/lib/types";
import { EvidenceBadge } from "./EvidenceBadge";

/** Register card for a single entity, with evidence and catalogue status. */
export function EntityCard({ entity }: { entity: Entity }) {
  const dl: { label: string; value: string }[] = [
    { label: "Role", value: entity.role },
    { label: "Dates", value: entity.dates },
    { label: "Collected", value: entity.collected },
    { label: "Scale", value: entity.scale },
    { label: "Location / now in", value: entity.location },
    { label: "Catalogue", value: entity.catalogue }
  ].filter((row) => row.value && row.value !== "—" && row.value !== "n/a");

  return (
    <article className="flex h-full flex-col rounded-sm border border-line bg-paper p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="cat-no">{entity.id}</span>
          <h3 className="font-serif text-lg font-medium leading-tight text-ink">
            {entity.name}
          </h3>
          <p className="label mt-1">{entity.chapter}</p>
        </div>
        <EvidenceBadge value={entity.evidence} />
      </div>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {dl.map((row) => (
          <div key={row.label} className="contents">
            <dt className="label self-center whitespace-nowrap">{row.label}</dt>
            <dd className="text-ink/90">{row.value}</dd>
          </div>
        ))}
      </dl>

      {entity.note && (
        <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink/80">
          {entity.note}
        </p>
      )}

      {entity.sources && (
        <p className="source-note mt-3">
          <span className="label-accent mr-1">Sources</span>
          {entity.sources}
        </p>
      )}
    </article>
  );
}
