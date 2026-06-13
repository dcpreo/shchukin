import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-archive flex flex-col items-start py-28">
      <p className="label-accent mb-3">404 · Not in the register</p>
      <h1 className="font-serif text-4xl font-medium">
        This record could not be found.
      </h1>
      <p className="prose-archive mt-4 max-w-prose">
        The page or object you requested is not part of the archive. It may have
        been moved, or it may be a value not yet verified — a deliberate blank
        rather than an invented record.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-sm bg-oxblood px-5 py-2.5 font-sans text-sm text-ivory hover:bg-oxblood-dark"
        >
          Return home
        </Link>
        <Link
          href="/collection"
          className="rounded-sm border border-ink/20 px-5 py-2.5 font-sans text-sm text-ink hover:border-oxblood hover:text-oxblood"
        >
          Search the collection
        </Link>
      </div>
    </div>
  );
}
