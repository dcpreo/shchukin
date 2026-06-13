import Link from "next/link";
import type { Artwork } from "@/lib/types";

/**
 * Presentational catalogue table. Columns follow the brief:
 * Artist · Title EN · Title RU · Date · Medium · Dimensions · Museum ·
 * Inventory ID · Image · Category.
 */
export function ArtworkTable({ artworks }: { artworks: Artwork[] }) {
  if (artworks.length === 0) {
    return (
      <p className="rounded-sm border border-line bg-paper p-6 text-center text-sm text-muted">
        No objects match the current filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-line">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="bg-paper">
            {[
              "No.",
              "Artist",
              "Title (EN)",
              "Title (RU)",
              "Date",
              "Medium",
              "Dimensions",
              "Museum",
              "Inventory ID",
              "Image",
              "Category"
            ].map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b border-ink/20 px-3 py-2 text-left font-sans text-[0.68rem] font-semibold uppercase tracking-wide text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {artworks.map((a, i) => (
            <tr
              key={a.slug}
              className="border-b border-line align-top last:border-0 odd:bg-paper/40 hover:bg-oxblood/[0.03]"
            >
              <td className="px-3 py-2">
                <span className="cat-no">{String(i + 1).padStart(3, "0")}</span>
              </td>
              <td className="px-3 py-2 text-ink/90">{a.artist}</td>
              <td className="px-3 py-2 font-medium">
                <Link
                  href={`/collection/${a.slug}`}
                  className="link-underline text-ink"
                >
                  {a.titleEN || "Untitled"}
                </Link>
              </td>
              <td className="px-3 py-2 text-ink/70">
                {a.titleRU || <span className="text-muted/60">—</span>}
              </td>
              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-ink/80">
                {a.date || "—"}
              </td>
              <td className="px-3 py-2 text-ink/80">{a.medium || "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-ink/80">
                {a.dimensionsCm || "—"}
              </td>
              <td className="px-3 py-2">
                <span className="label">{a.museum}</span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-sans text-xs text-ink/80">
                {a.inventoryId || <span className="text-muted/60">—</span>}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">
                {a.imageDirectHiRes ? (
                  <span className="text-oxblood">Hi-res</span>
                ) : a.imageCommonsLookup ? (
                  <a
                    href={a.imageCommonsLookup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-ink/70"
                  >
                    Commons
                  </a>
                ) : (
                  <span className="text-muted/60">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-ink/70">{a.category || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
