/**
 * Offline enrichment build (no network).
 *
 * Produces data/artworks.enriched.json from the inventory CSV using the
 * deterministic image classifier, merged over any image metadata already
 * resolved/validated by the network scripts. This is wired into `prebuild`
 * so the site always has an enriched dataset, even before the Commons
 * pipeline has been run.
 */
import { readInventory, loadEnrichedImages, writeEnriched } from "./shared";

function main(): void {
  const rows = readInventory();
  const existing = loadEnrichedImages();

  const merged = rows.map((r) => {
    const prior = existing.get(r.slug);
    // Keep previously resolved/validated metadata (license, dims, localPath,
    // commons_resolved status, verifiedAt) when it is stronger than a fresh
    // classification.
    if (prior && (prior.localPath || prior.status === "commons_resolved" || prior.verifiedAt)) {
      return { ...r, image: { ...r.image, ...prior } };
    }
    return r;
  });

  writeEnriched(merged);

  const counts = merged.reduce<Record<string, number>>((acc, r) => {
    acc[r.image.status] = (acc[r.image.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log("Enriched dataset written:", merged.length, "artworks");
  console.log("By status:", counts);
}

main();
