import type { CollectionStatsData } from "@/lib/types";

function StatFigure({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-sm border border-line bg-paper p-4">
      <p className="font-serif text-3xl font-medium tabular-nums text-oxblood">
        {value}
      </p>
      <p className="label mt-1">{label}</p>
    </div>
  );
}

function Bars({
  title,
  rows,
  total
}: {
  title: string;
  rows: { name: string; count: number }[];
  total: number;
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div>
      <h3 className="label mb-3">{title}</h3>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.name} className="grid grid-cols-[10rem_1fr_2.5rem] items-center gap-3">
            <span className="truncate font-sans text-sm text-ink/90" title={r.name}>
              {r.name}
            </span>
            <span className="h-2 rounded-full bg-line/60">
              <span
                className="block h-2 rounded-full bg-oxblood/70"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-sans text-xs tabular-nums text-muted">
              {r.count}
            </span>
          </li>
        ))}
      </ul>
      {total > 0 && (
        <p className="source-note mt-2">Total objects: {total}</p>
      )}
    </div>
  );
}

/** Summary statistics block for the Sergei collection. */
export function CollectionStats({ stats }: { stats: CollectionStatsData }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatFigure value={stats.total} label="Objects catalogued" />
        <StatFigure value={stats.artistCount} label="Artists" />
        {stats.byMuseum.map((m) => (
          <StatFigure key={m.name} value={m.count} label={`Now in ${m.name}`} />
        ))}
        <StatFigure value={stats.withInventoryId} label="With accession ID" />
        <StatFigure value={stats.withDirectImage} label="With hi-res image" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Bars title="By artist (top 12)" rows={stats.topArtists} total={0} />
        <div className="space-y-8">
          <Bars title="By museum" rows={stats.byMuseum} total={0} />
          <Bars title="By medium / category" rows={stats.byCategory} total={0} />
        </div>
      </div>
    </div>
  );
}
