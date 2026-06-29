/**
 * The Sergei provenance spine — the single chain every catalogued object
 * carries. Rendered as an ordered, labelled sequence.
 *
 * Source: Shchukin_Archive_MASTER_INDEX.md §5.
 */
const STEPS: { label: string; detail?: string }[] = [
  { label: "S. Shchukin", detail: "private collection, Moscow" },
  { label: "Nationalisation", detail: "5 November 1918" },
  { label: "First Museum of New Western Painting" },
  { label: "GMNZI", detail: "formed 1923" },
  { label: "1948 dissolution", detail: "GMNZI split" },
  { label: "Hermitage or Pushkin", detail: "current holding" }
];

export function ProvenanceSpine({ compact = false }: { compact?: boolean }) {
  return (
    <ol
      className={`flex flex-wrap items-stretch gap-2 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      {STEPS.map((step, i) => (
        <li key={step.label} className="flex items-stretch gap-2">
          <div className="flex flex-col justify-center rounded-sm border border-line bg-paper px-3 py-2">
            <span className="cat-no">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-sans text-sm font-medium text-ink">
              {step.label}
            </span>
            {step.detail && (
              <span className="source-note">{step.detail}</span>
            )}
          </div>
          {i < STEPS.length - 1 && (
            <span
              aria-hidden
              className="flex items-center text-oxblood/60"
            >
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
