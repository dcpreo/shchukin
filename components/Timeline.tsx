import { EvidenceBadge } from "./EvidenceBadge";

/**
 * Master timeline (Shchukin_Archive_MASTER_INDEX.md §3). Estate-sourced
 * entries are flagged so that the documented record is never confused with
 * family/estate dating.
 */
export interface TimelineEntry {
  year: string;
  text: string;
  tier?: "Estate" | "Public";
}

const ENTRIES: TimelineEntry[] = [
  { year: "1818", text: "Ivan Vasilyevich Shchukin born; builds I.V. Shchukin & Sons (textiles)." },
  { year: "1853–1869", text: "Pyotr (1853) · Sergei (1854) · Dmitri (1855) · Ivan (1869) born." },
  { year: "1893", text: "Ivan settles in Paris; becomes the family's conduit to French art." },
  { year: "1898", text: "Sergei & Pyotr buy Pissarros side by side at Durand-Ruel." },
  { year: "1903", text: "Dmitri donates 19 Old Master pictures to the Moscow University museum." },
  { year: "1905", text: "Pyotr donates his Museum of Russian Antiquities to the Historical Museum." },
  { year: "1908", text: "Ivan's bankruptcy and suicide; his collection dispersed at Paris sales." },
  { year: "1913", text: "Sergei publishes his collection catalogue (225 numbers)." },
  { year: "5 Nov 1918", text: "Sergei's gallery nationalised → First Museum of New Western Painting." },
  { year: "1923 / 1948", text: "GMNZI formed / dissolved; Sergei's works split Hermitage ↔ Pushkin." },
  { year: "1912 / 1932 / 1936", text: "Deaths of Pyotr (1912) · Dmitri (1932) · Sergei (1936)." },
  { year: "1953", text: "Nikolai Vasilyevich Shchukin born.", tier: "Estate" },
  { year: "1987", text: "Gallery SHCHUKIN founded; Nikolai revives the collecting tradition.", tier: "Public" },
  { year: "1997", text: "National Art Collections Foundation founded.", tier: "Estate" },
  { year: "2002–2004", text: "Art Moscow album; Moscow avant-garde exhibitions (Dmitry)." },
  { year: "2013", text: "Gallery SHCHUKIN Paris opens on Avenue Matignon." },
  { year: "2014–2015", text: "“In Other Worlds” (Drutt) in New York; Gleb Pospelov Hall." },
  { year: "2019", text: "Pushkin's “Shchukin. Biography of a Collection” reunites all four brothers." },
  { year: "2024", text: "Nikolai Shchukin dies.", tier: "Estate" },
  { year: "2025–2026", text: "Present custodianship and archive (this project)." }
];

export function Timeline() {
  return (
    <ol className="relative border-l border-line">
      {ENTRIES.map((e) => (
        <li key={e.year + e.text} className="ml-5 pb-6 last:pb-0">
          <span
            aria-hidden
            className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border border-oxblood bg-ivory"
          />
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-sans text-sm font-semibold tabular-nums text-oxblood">
              {e.year}
            </span>
            {e.tier && <EvidenceBadge value={e.tier} />}
          </div>
          <p className="mt-1 max-w-prose text-ink/90">{e.text}</p>
        </li>
      ))}
    </ol>
  );
}
