import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImage } from "@/components/ArtworkImage";
import { ProvenanceSpine } from "@/components/ProvenanceSpine";
import { ImageRightsNotice } from "@/components/ImageRightsNotice";
import { getAllArtworks, getArtworkBySlug } from "@/lib/data";

export function generateStaticParams() {
  return getAllArtworks().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArtworkBySlug(slug);
  if (!a) return { title: "Object not found" };
  const title = `${a.artist} — ${a.titleEN}${a.date ? `, ${a.date}` : ""}`;
  return {
    title,
    description: `${title}. ${a.medium}${a.dimensionsCm ? `, ${a.dimensionsCm} cm` : ""}. ${a.museum}. From Sergei Shchukin's collection. ${a.inventoryId ? `Inventory ${a.inventoryId}.` : ""}`
  };
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-4 border-b border-line py-2.5">
      <dt className="label self-center">{label}</dt>
      <dd className="text-ink/90">
        {value ? value : <span className="text-muted/60">— not yet verified</span>}
      </dd>
    </div>
  );
}

export default async function ObjectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArtworkBySlug(slug);
  if (!a) notFound();

  return (
    <div className="container-archive py-12">
      <nav className="mb-6 font-sans text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/collection" className="hover:text-oxblood">
          Collection
        </Link>{" "}
        <span aria-hidden>/</span> <span className="text-ink/80">{a.artist}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        {/* Image */}
        <div>
          <div className="overflow-hidden rounded-sm border border-line bg-paper">
            <ArtworkImage
              artwork={a}
              sizes="(max-width: 1024px) 100vw, 520px"
              className="max-h-[70vh] w-full"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {a.imageDirectHiRes && (
              <a
                href={a.imageDirectHiRes}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm bg-oxblood px-3 py-1.5 font-sans text-xs text-ivory hover:bg-oxblood-dark"
              >
                Open hi-res original ↗
              </a>
            )}
            {a.imageCommonsLookup && (
              <a
                href={a.imageCommonsLookup}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-line px-3 py-1.5 font-sans text-xs text-ink hover:border-oxblood hover:text-oxblood"
              >
                Find image on Commons ↗
              </a>
            )}
            {a.imagePage && (
              <a
                href={a.imagePage}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-line px-3 py-1.5 font-sans text-xs text-ink hover:border-oxblood hover:text-oxblood"
              >
                Image page ↗
              </a>
            )}
          </div>
        </div>

        {/* Catalogue record */}
        <div>
          <p className="font-sans text-sm text-muted">{a.artist}</p>
          <h1 className="mt-1 font-serif text-3xl font-medium leading-tight">
            {a.titleEN || "Untitled"}
          </h1>
          {a.titleRU && (
            <p className="mt-1 font-serif text-xl text-ink/70">{a.titleRU}</p>
          )}

          <dl className="mt-6">
            <Field label="Artist" value={a.artist} />
            <Field label="Title (EN)" value={a.titleEN} />
            <Field label="Title (RU)" value={a.titleRU} />
            <Field label="Date" value={a.date} />
            <Field label="Medium" value={a.medium} />
            <Field label="Dimensions (cm)" value={a.dimensionsCm} />
            <Field label="Museum" value={a.museum} />
            <Field label="Inventory ID" value={a.inventoryId} />
            <Field label="Category" value={a.category} />
          </dl>

          <div className="mt-8 rounded-sm border border-line bg-paper p-4">
            <h2 className="label-accent mb-2">Provenance note</h2>
            <p className="text-sm leading-relaxed text-ink/80">
              From the collection of Sergei Ivanovich Shchukin (1854–1936),
              nationalised 5 November 1918, held by the First Museum of New
              Western Painting, absorbed into GMNZI (1923) and, on the museum's
              dissolution in 1948, allocated to the {a.museum}.
            </p>
            <div className="mt-3 overflow-x-auto">
              <ProvenanceSpine compact />
            </div>
          </div>

          <div className="mt-4 rounded-sm border border-line bg-paper p-4">
            <h2 className="label-accent mb-2">Evidence note</h2>
            <p className="text-sm leading-relaxed text-ink/80">
              Collection attribution to Sergei Shchukin and the
              nationalisation/split provenance are{" "}
              <strong className="font-semibold">Public</strong> — documented via
              NeWestMuseum/GMNZI, the Hermitage and the Pushkin. Do not treat
              missing fields as unknown invention; blanks indicate not yet
              verified, awaiting accession records, Russian titles, or hi-res
              images per the completion roadmap.
            </p>
          </div>

          <div className="mt-4">
            <ImageRightsNotice compact />
          </div>
        </div>
      </div>
    </div>
  );
}
