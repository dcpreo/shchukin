"use client";

import { useMemo, useState } from "react";
import type { Artwork } from "@/lib/types";
import { ArtworkTable } from "./ArtworkTable";
import { ArtworkCard } from "./ArtworkCard";
import {
  EMPTY_FILTERS,
  SearchFilters,
  type ArtworkFilterState
} from "./SearchFilters";

/** Extracts a coarse decade-ish bucket label from a free-text date string. */
function dateBucket(date: string): string {
  const m = date.match(/\d{4}/);
  if (!m) return "Undated";
  const year = parseInt(m[0], 10);
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

function matches(a: Artwork, f: ArtworkFilterState): boolean {
  if (f.artist && a.artist !== f.artist) return false;
  if (f.museum && a.museum !== f.museum) return false;
  if (f.category && a.category !== f.category) return false;
  if (f.date && dateBucket(a.date) !== f.date) return false;
  if (f.hasImage && !a.imageDirectHiRes) return false;
  if (f.hasInventoryId && !a.inventoryId) return false;
  if (f.query.trim()) {
    const q = f.query.trim().toLowerCase();
    const haystack = [
      a.artist,
      a.titleEN,
      a.titleRU,
      a.date,
      a.medium,
      a.museum,
      a.inventoryId
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export function CollectionExplorer({
  artworks,
  artists,
  museums,
  categories,
  defaultView = "table"
}: {
  artworks: Artwork[];
  artists: string[];
  museums: string[];
  categories: string[];
  defaultView?: "table" | "grid";
}) {
  const [filters, setFilters] = useState<ArtworkFilterState>(EMPTY_FILTERS);
  const [view, setView] = useState<"table" | "grid">(defaultView);

  const dates = useMemo(() => {
    const set = new Set<string>();
    artworks.forEach((a) => set.add(dateBucket(a.date)));
    return [...set].sort((a, b) => {
      if (a === "Undated") return 1;
      if (b === "Undated") return -1;
      return a.localeCompare(b);
    });
  }, [artworks]);

  const results = useMemo(
    () => artworks.filter((a) => matches(a, filters)),
    [artworks, filters]
  );

  return (
    <div className="space-y-5">
      <SearchFilters
        filters={filters}
        onChange={setFilters}
        artists={artists}
        museums={museums}
        categories={categories}
        dates={dates}
        resultCount={results.length}
        total={artworks.length}
      />

      <div className="flex items-center justify-end gap-2">
        <span className="label">View</span>
        <div className="inline-flex overflow-hidden rounded-sm border border-line">
          {(["table", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-3 py-1 font-sans text-xs capitalize ${
                view === v
                  ? "bg-oxblood text-ivory"
                  : "bg-paper text-ink/70 hover:text-oxblood"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "table" ? (
        <ArtworkTable artworks={results} />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((a) => (
            <ArtworkCard key={a.slug} artwork={a} />
          ))}
        </div>
      ) : (
        <p className="rounded-sm border border-line bg-paper p-6 text-center text-sm text-muted">
          No objects match the current filters.
        </p>
      )}
    </div>
  );
}
