import type { ReactNode } from "react";

/**
 * Standard page / section header in the catalogue idiom: a small spaced
 * eyebrow label, a serif title, and an optional lede.
 */
export function SectionIntro({
  eyebrow,
  title,
  lede,
  children,
  as = "h1"
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <div className="max-w-prose">
      {eyebrow && <p className="label-accent mb-3">{eyebrow}</p>}
      <Heading className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
        {title}
      </Heading>
      {lede && <p className="prose-archive mt-4 text-lg text-ink/80">{lede}</p>}
      {children}
    </div>
  );
}
