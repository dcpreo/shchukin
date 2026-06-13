"use client";

export interface ArtworkFilterState {
  query: string;
  artist: string;
  museum: string;
  category: string;
  date: string;
  hasImage: boolean;
  hasInventoryId: boolean;
}

export const EMPTY_FILTERS: ArtworkFilterState = {
  query: "",
  artist: "",
  museum: "",
  category: "",
  date: "",
  hasImage: false,
  hasInventoryId: false
};

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm border border-line bg-paper px-2 py-1.5 font-sans text-sm text-ink focus:border-oxblood focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Filter controls for the collection. All filtering is client-side; search
 * spans artist, EN/RU titles, date, medium, museum and inventory ID.
 */
export function SearchFilters({
  filters,
  onChange,
  artists,
  museums,
  categories,
  dates,
  resultCount,
  total
}: {
  filters: ArtworkFilterState;
  onChange: (next: ArtworkFilterState) => void;
  artists: string[];
  museums: string[];
  categories: string[];
  dates: string[];
  resultCount: number;
  total: number;
}) {
  const set = <K extends keyof ArtworkFilterState>(
    key: K,
    value: ArtworkFilterState[K]
  ) => onChange({ ...filters, [key]: value });

  const opt = (values: string[], allLabel: string) => [
    { value: "", label: allLabel },
    ...values.map((v) => ({ value: v, label: v }))
  ];

  return (
    <div className="rounded-sm border border-line bg-paper/60 p-4">
      <div className="mb-3">
        <label className="flex flex-col gap-1">
          <span className="label">Search the catalogue</span>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Artist, title (EN / RU), date, medium, museum, inventory ID…"
            className="w-full rounded-sm border border-line bg-ivory px-3 py-2 font-sans text-sm text-ink placeholder:text-muted/70 focus:border-oxblood focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select
          label="Artist"
          value={filters.artist}
          onChange={(v) => set("artist", v)}
          options={opt(artists, "All artists")}
        />
        <Select
          label="Museum"
          value={filters.museum}
          onChange={(v) => set("museum", v)}
          options={opt(museums, "All museums")}
        />
        <Select
          label="Category"
          value={filters.category}
          onChange={(v) => set("category", v)}
          options={opt(categories, "All categories")}
        />
        <Select
          label="Date"
          value={filters.date}
          onChange={(v) => set("date", v)}
          options={opt(dates, "All dates")}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 font-sans text-sm text-ink/80">
            <input
              type="checkbox"
              checked={filters.hasImage}
              onChange={(e) => set("hasImage", e.target.checked)}
              className="accent-oxblood"
            />
            Has direct image
          </label>
          <label className="flex items-center gap-2 font-sans text-sm text-ink/80">
            <input
              type="checkbox"
              checked={filters.hasInventoryId}
              onChange={(e) => set("hasInventoryId", e.target.checked)}
              className="accent-oxblood"
            />
            Has inventory ID
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="source-note tabular-nums">
            {resultCount} of {total} objects
          </span>
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-sm border border-line px-2.5 py-1 font-sans text-xs text-ink/70 hover:border-oxblood hover:text-oxblood"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
