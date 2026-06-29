import type { EvidenceTier } from "./types";

/**
 * Evidence-tier helpers. Kept free of any server-only / filesystem code so
 * both server pages and client components (badges, filters) can import them.
 */
export interface EvidenceBadgeMeta {
  tier: EvidenceTier;
  label: string;
  description: string;
}

const EVIDENCE_META: Record<EvidenceTier, EvidenceBadgeMeta> = {
  Public: {
    tier: "Public",
    label: "Public",
    description:
      "Independently documented in scholarship, museum records, press or institutional publication."
  },
  "Family-asserted": {
    tier: "Family-asserted",
    label: "Family-asserted",
    description:
      "Stated publicly by the family or gallery and repeated in press, but not independently corroborated."
  },
  Estate: {
    tier: "Estate",
    label: "Estate",
    description:
      "Held in family / estate records — true to first-hand knowledge but not on the open web."
  },
  Mixed: {
    tier: "Mixed",
    label: "Mixed",
    description:
      "Combines tiers: some elements are publicly documented while others are family-asserted or estate-held."
  }
};

/**
 * Maps an entity's free-text evidence value (which may read e.g.
 * "Mixed (Public + Family-asserted + Estate)") to a normalised badge tier,
 * preserving the source's exact phrasing in the label.
 */
export function getEvidenceBadge(value: string): EvidenceBadgeMeta {
  const v = (value || "").trim();
  if (/^mixed/i.test(v)) return { ...EVIDENCE_META.Mixed, label: v };
  if (/^family-asserted/i.test(v))
    return { ...EVIDENCE_META["Family-asserted"], label: v };
  if (/^estate/i.test(v)) return { ...EVIDENCE_META.Estate, label: v };
  if (/^public/i.test(v)) return { ...EVIDENCE_META.Public, label: v };
  // Unknown phrasing: surface verbatim under a neutral badge, never inventing
  // a stronger claim than the source supports.
  return { tier: "Public", label: v || "—", description: v };
}

export const EVIDENCE_TIERS = EVIDENCE_META;
