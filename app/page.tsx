import Link from "next/link";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ProvenanceSpine } from "@/components/ProvenanceSpine";
import {
  getCollectionStats,
  getEntities,
  getFeaturedArtworks
} from "@/lib/data";

const ENTRY_POINTS = [
  {
    href: "/family",
    title: "Historic Collections",
    blurb:
      "Pyotr, Sergei, Dmitri and Ivan — four brothers, four collections, now anchors of Russian state museums."
  },
  {
    href: "/modern",
    title: "Modern Chapter",
    blurb:
      "Nikolai Shchukin and Gallery SHCHUKIN — the 20th–21st-century revival, documented with forensic caution."
  },
  {
    href: "/collection",
    title: "Collection Search",
    blurb:
      "The full searchable catalogue of Sergei Shchukin's 259 reconstructed objects, filterable and citable."
  },
  {
    href: "/images",
    title: "Image Archive",
    blurb:
      "A gateway to hi-res originals and Commons lookups — referenced, never re-hosted."
  },
  {
    href: "/method",
    title: "Method",
    blurb:
      "The evidence-tier system: Public, Family-asserted, Estate — and why the distinction matters."
  }
];

export default function HomePage() {
  const featured = getFeaturedArtworks(8);
  const stats = getCollectionStats();
  const entityCount = getEntities().length;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="container-archive py-16 sm:py-24">
          <p className="label-accent mb-5">The Shchukin Collection Archive</p>
          <h1 className="max-w-4xl font-serif text-4xl font-medium leading-[1.1] sm:text-5xl md:text-6xl">
            A dynasty of collectors, archives, and institutions from 1818 to the
            present.
          </h1>
          <p className="prose-archive mt-6 max-w-2xl text-lg">
            The Shchukin Collection Archive documents a family name carried
            through collecting, museums, galleries, displacement,
            nationalisation, revival, and contemporary custodianship. It
            distinguishes documented public record from family-held memory and
            estate material, preserving the archive as both cultural history and
            working research infrastructure.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/archive"
              className="rounded-sm bg-oxblood px-5 py-2.5 font-sans text-sm text-ivory transition-colors hover:bg-oxblood-dark"
            >
              Enter the archive
            </Link>
            <Link
              href="/collection"
              className="rounded-sm border border-ink/20 px-5 py-2.5 font-sans text-sm text-ink transition-colors hover:border-oxblood hover:text-oxblood"
            >
              Search {stats.total} catalogued objects
            </Link>
          </div>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-4 border-t border-line pt-8 sm:grid-cols-4">
            {[
              { v: "4", l: "historic collections" },
              { v: String(stats.total), l: "objects (Sergei)" },
              { v: String(stats.artistCount), l: "artists catalogued" },
              { v: String(entityCount), l: "entities in register" }
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-serif text-3xl font-medium tabular-nums text-oxblood">
                  {s.v}
                </dt>
                <dd className="label mt-1">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Entry points */}
      <section className="container-archive py-14">
        <h2 className="label mb-6">Entry points</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENTRY_POINTS.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group flex flex-col rounded-sm border border-line bg-paper p-5 transition-colors hover:border-oxblood/40"
            >
              <h3 className="font-serif text-xl font-medium text-ink group-hover:text-oxblood">
                {e.title}
              </h3>
              <p className="prose-archive mt-2 text-sm">{e.blurb}</p>
              <span className="mt-4 font-sans text-sm text-oxblood">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured works */}
      <section className="border-t border-line bg-paper/40">
        <div className="container-archive py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="max-w-prose">
              <h2 className="label-accent mb-2">From the Sergei inventory</h2>
              <p className="font-serif text-2xl font-medium">
                Featured works with verified hi-res images
              </p>
              <p className="prose-archive mt-2 text-sm">
                These {featured.length} works carry a direct high-resolution
                image link in the dataset. The remaining objects offer a
                Wikimedia Commons lookup or are flagged as not yet verified —
                never invented.
              </p>
            </div>
            <Link
              href="/images"
              className="font-sans text-sm text-oxblood hover:underline"
            >
              Image archive →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((a) => (
              <ArtworkCard key={a.slug} artwork={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Provenance spine */}
      <section className="container-archive py-14">
        <h2 className="label-accent mb-2">The provenance spine</h2>
        <p className="max-w-prose font-serif text-2xl font-medium">
          Every catalogued Sergei object carries one chain.
        </p>
        <p className="prose-archive mb-6 mt-2 text-sm">
          From private collection to nationalisation and the 1948 split between
          the Hermitage and the Pushkin — the GMNZI number is the provenance
          fingerprint that links any object to the 1923–48 museum.
        </p>
        <ProvenanceSpine />
      </section>

      {/* Evidence-tier notice */}
      <section className="border-t border-line bg-ink text-ivory">
        <div className="container-archive py-14">
          <h2 className="font-sans text-xs uppercase tracking-label text-ivory/60">
            Evidence-tier notice
          </h2>
          <p className="mt-3 max-w-3xl font-serif text-xl leading-relaxed">
            Sergei Shchukin's historic collection is object-complete in this
            dataset. Pyotr, Dmitri and Ivan are documented at guide level.
            Nikolai and Gallery SHCHUKIN are carried at chapter level — no
            public object-level inventory exists for the modern collection.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                t: "Public",
                d: "Independently documented in scholarship, museum records, press or institutional publication."
              },
              {
                t: "Family-asserted",
                d: "Stated publicly by the family or gallery, but not independently corroborated — e.g. the modern family's descent from the historic Shchukins."
              },
              {
                t: "Estate",
                d: "Held in family / estate records, true to first-hand knowledge but not on the open web — e.g. Nikolai's dates, the NACFUND founding year."
              }
            ].map((tier) => (
              <div key={tier.t} className="border-t border-ivory/20 pt-4">
                <p className="font-sans text-sm font-semibold uppercase tracking-wide text-ivory">
                  {tier.t}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ivory/70">
                  {tier.d}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/method"
            className="mt-8 inline-block font-sans text-sm text-ivory underline decoration-ivory/40 underline-offset-4 hover:decoration-ivory"
          >
            Read the full method →
          </Link>
        </div>
      </section>
    </>
  );
}
