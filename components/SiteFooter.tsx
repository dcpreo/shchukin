import Link from "next/link";

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Historic Collections",
    links: [
      { href: "/family", label: "The Four Brothers" },
      { href: "/sergei", label: "Sergei Shchukin" },
      { href: "/collection", label: "Collection Search" },
      { href: "/images", label: "Image Archive" }
    ]
  },
  {
    heading: "Archive",
    links: [
      { href: "/archive", label: "Master Index" },
      { href: "/entities", label: "Entity Register" },
      { href: "/method", label: "Evidence & Method" },
      { href: "/roadmap", label: "Completion Roadmap" }
    ]
  },
  {
    heading: "Modern & Contemporary",
    links: [
      { href: "/modern", label: "Nikolai · Gallery SHCHUKIN" },
      { href: "/contact", label: "Inquiries" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-paper">
      <div className="container-archive grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-base font-medium text-ink">
            Shchukin Collection Archive
          </p>
          <p className="prose-archive mt-3 text-sm text-muted">
            A scholarly archive and working research infrastructure documenting
            a family name carried through collecting, museums, galleries,
            displacement, nationalisation, revival and contemporary
            custodianship.
          </p>
          <p className="source-note mt-4">
            Custody: Kunst Gruppe Bureau / Shchukin Foundation.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className="label mb-3">{col.heading}</h2>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-sm text-ink/80 transition-colors hover:text-oxblood"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-archive flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="source-note">
            Generated from structured archive files. Claims are tiered{" "}
            <span className="text-emerald-900">Public</span> ·{" "}
            <span className="text-amber-900">Family-asserted</span> ·{" "}
            <span className="text-oxblood">Estate</span>. Nothing is invented;
            blanks mark values not yet verified.
          </p>
          <p className="source-note">
            © {new Date().getFullYear()} Shchukin Foundation Archive
          </p>
        </div>
      </div>
    </footer>
  );
}
