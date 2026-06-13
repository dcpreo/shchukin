import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Archive-layer card used on /archive to present the four layers
 * (0 Origins · A Historic brothers · B Modern chapter · C Contemporary).
 */
export function ArchiveLayerCard({
  layer,
  scope,
  status,
  children,
  href
}: {
  layer: string;
  scope: string;
  status: string;
  children?: ReactNode;
  href?: string;
}) {
  const inner = (
    <article className="group flex h-full flex-col rounded-sm border border-line bg-paper p-5 transition-colors hover:border-oxblood/40">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl font-medium text-ink">{layer}</h3>
        <span className="label">{status}</span>
      </div>
      <p className="mt-2 font-sans text-sm text-ink/80">{scope}</p>
      {children && <div className="prose-archive mt-3 text-sm">{children}</div>}
      {href && (
        <span className="mt-4 inline-block font-sans text-sm text-oxblood group-hover:underline">
          Explore →
        </span>
      )}
    </article>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
