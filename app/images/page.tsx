import type { Metadata } from "next";
import Link from "next/link";
import { SectionIntro } from "@/components/SectionIntro";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ImageRightsNotice } from "@/components/ImageRightsNotice";
import { getImageSections } from "@/lib/data";
import type { EnrichedArtwork } from "@/lib/image";

export const metadata: Metadata = {
  title: "Image Archive",
  description:
    "A gateway to the Shchukin collection imagery: cached and verified images first, then Commons-resolved and lookup-only works, then unresolved and needs-review entries. Images are referenced, never re-hosted, and never mis-attributed."
};

function CardGrid({ items }: { items: EnrichedArtwork[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((a) => (
        <ArtworkCard key={a.slug} artwork={a} />
      ))}
    </div>
  );
}

function LinkList({
  items,
  linkKind
}: {
  items: EnrichedArtwork[];
  linkKind: "commons" | "source" | "none";
}) {
  return (
    <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => {
        const href =
          linkKind === "commons"
            ? a.image.commonsSearchUrl
            : linkKind === "source"
              ? a.image.sourcePageUrl
              : null;
        return (
          <li
            key={a.slug}
            className="flex items-baseline justify-between gap-3 border-b border-line py-1.5"
          >
            <Link
              href={`/collection/${a.slug}`}
              className="link-underline text-sm text-ink"
            >
              <span className="text-muted">{a.artist}</span>,{" "}
              {a.titleEN || "Untitled"}
            </Link>
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-sans text-xs text-oxblood hover:underline"
              >
                {linkKind === "commons" ? "Commons ↗" : "Source ↗"}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function ImagesPage() {
  const s = getImageSections();

  const Section = ({
    n,
    title,
    blurb,
    count,
    children
  }: {
    n: number;
    title: string;
    blurb: string;
    count: number;
    children: React.ReactNode;
  }) => (
    <section className="mt-14">
      <h2 className="label-accent">
        {n} · {title} ({count})
      </h2>
      <p className="prose-archive mb-5 mt-1 max-w-prose text-sm">{blurb}</p>
      {count > 0 ? (
        children
      ) : (
        <p className="rounded-sm border border-line bg-paper p-4 text-sm text-muted">
          None in this section.
        </p>
      )}
    </section>
  );

  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Image archive"
        title="Imagery Gateway"
        lede="The archive does not host images. It points to them — preferring locally cached, rights-cleared copies, then verified high-resolution Wikimedia Commons originals, and otherwise a lookup so the correct file can be found at its holder. Accuracy beats completeness: a work shows no image rather than the wrong one."
      />

      <div className="mt-8">
        <ImageRightsNotice />
      </div>

      <Section
        n={1}
        title="Cached, rights-cleared images"
        count={s.cachedLocal.length}
        blurb="Locally cached display copies of public-domain / openly-licensed works, served from the site for stability. Populated by the image cache pipeline."
      >
        <CardGrid items={s.cachedLocal} />
      </Section>

      <Section
        n={2}
        title="Verified hi-res originals"
        count={s.verifiedRemote.length}
        blurb="Works whose dataset link is a genuine Wikimedia Commons original (Special:FilePath), shown at a card-sized thumbnail with the full original one click away."
      >
        <CardGrid items={s.verifiedRemote} />
      </Section>

      <Section
        n={3}
        title="Commons-resolved images"
        count={s.commonsResolved.length}
        blurb="Images matched to a Commons file via the resolver and accepted under the conservative matching rules. Populated when the resolve pipeline is run with network access."
      >
        <CardGrid items={s.commonsResolved} />
      </Section>

      <Section
        n={4}
        title="Commons / source lookups"
        count={s.lookupOnly.length}
        blurb="No direct image yet, but a Commons MediaSearch lookup or museum source page is available to locate the correct file."
      >
        <LinkList items={s.lookupOnly} linkKind="commons" />
      </Section>

      <Section
        n={5}
        title="Missing / unresolved"
        count={s.missing.length}
        blurb="No image reference of any kind in the dataset. The blank is deliberate — see the completion roadmap."
      >
        <LinkList items={s.missing} linkKind="none" />
      </Section>

      {/* 6 · Needs review */}
      <section className="mt-14">
        <h2 className="label-accent">
          6 · Failed links needing review ({s.failed.length})
        </h2>
        <p className="prose-archive mb-5 mt-1 max-w-prose text-sm">
          The dataset claims a direct image for these works, but the link is not
          a usable image file (chiefly NeWestMuseum viewer pages, which return
          HTML). They are held back from the verified sections until a real
          image is resolved — this is what prevents fake HI-RES cards.
        </p>
        {s.failed.length > 0 ? (
          <div className="overflow-x-auto rounded-sm border border-line">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="bg-paper">
                  {["Artist", "Title", "Bad / unusable URL", "Reason", "Suggested fix"].map(
                    (h) => (
                      <th
                        key={h}
                        className="border-b border-ink/20 px-3 py-2 text-left font-sans text-[0.68rem] font-semibold uppercase tracking-wide text-muted"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {s.failed.map((a) => (
                  <tr
                    key={a.slug}
                    className="border-b border-line align-top last:border-0 odd:bg-paper/40"
                  >
                    <td className="px-3 py-2 text-ink/90">{a.artist}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/collection/${a.slug}`}
                        className="link-underline text-ink"
                      >
                        {a.titleEN || "Untitled"}
                      </Link>
                    </td>
                    <td className="max-w-[22rem] break-all px-3 py-2 font-sans text-xs text-ink/70">
                      {a.image.sourcePageUrl || a.imageDirectHiRes || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-ink/70">
                      {a.image.notes}
                    </td>
                    <td className="px-3 py-2 text-xs text-ink/70">
                      {a.image.commonsSearchUrl ? (
                        <a
                          href={a.image.commonsSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-oxblood hover:underline"
                        >
                          Resolve via Commons ↗
                        </a>
                      ) : a.inventoryId ? (
                        `Resolve via inventory ${a.inventoryId}`
                      ) : (
                        "Resolve via museum catalogue"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-sm border border-line bg-paper p-4 text-sm text-muted">
            None — no broken image links.
          </p>
        )}
      </section>
    </div>
  );
}
