import { getEvidenceBadge } from "@/lib/evidence";

/**
 * Compact evidence badge. Colour-codes the three tiers (plus Mixed) so the
 * documented / asserted / estate distinction is legible at a glance, while
 * preserving the source's exact phrasing in the label.
 */
const TIER_STYLES: Record<string, string> = {
  Public: "border-emerald-700/30 bg-emerald-700/5 text-emerald-900",
  "Family-asserted": "border-amber-700/30 bg-amber-700/5 text-amber-900",
  Estate: "border-oxblood/30 bg-oxblood/5 text-oxblood",
  Mixed: "border-brass/40 bg-brass/5 text-brass"
};

export function EvidenceBadge({
  value,
  showLabel = true,
  title
}: {
  value: string;
  showLabel?: boolean;
  title?: string;
}) {
  const meta = getEvidenceBadge(value);
  const style = TIER_STYLES[meta.tier] ?? TIER_STYLES.Public;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-sans text-[0.65rem] font-medium uppercase tracking-wide ${style}`}
      title={title ?? meta.description}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {showLabel ? meta.label : meta.tier}
    </span>
  );
}
