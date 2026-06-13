import type { Metadata } from "next";
import { SectionIntro } from "@/components/SectionIntro";

export const metadata: Metadata = {
  title: "Inquiries",
  description:
    "Contact the Shchukin Foundation Archive: research inquiries, provenance inquiries, image-rights inquiries and estate/archive inquiries."
};

const INQUIRY_TYPES = [
  {
    title: "Research inquiries",
    body: "Scholarly access to the catalogue, the entity register and the source documents.",
    subject: "Research inquiry"
  },
  {
    title: "Provenance inquiries",
    body: "Questions on the Sergei provenance spine, GMNZI numbering, or the museum split.",
    subject: "Provenance inquiry"
  },
  {
    title: "Image-rights inquiries",
    body: "Reproduction, licensing and sourcing of imagery referenced by the archive.",
    subject: "Image-rights inquiry"
  },
  {
    title: "Estate / archive inquiries",
    body: "Estate material, gallery records, and contributions toward closing documented gaps.",
    subject: "Estate / archive inquiry"
  }
];

const CONTACT_EMAIL = "archive@shchukin-foundation.org";

export default function ContactPage() {
  return (
    <div className="container-archive py-14">
      <SectionIntro
        eyebrow="Contact"
        title="Inquiries"
        lede="The archive is a working research infrastructure under continuing development. Inquiries are welcomed across four channels; please use the matching subject line so requests are routed correctly."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {INQUIRY_TYPES.map((t) => (
          <a
            key={t.title}
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              t.subject
            )}`}
            className="group flex flex-col rounded-sm border border-line bg-paper p-5 transition-colors hover:border-oxblood/40"
          >
            <h2 className="font-serif text-xl font-medium text-ink group-hover:text-oxblood">
              {t.title}
            </h2>
            <p className="prose-archive mt-2 text-sm">{t.body}</p>
            <span className="mt-4 font-sans text-sm text-oxblood">
              {CONTACT_EMAIL} →
            </span>
          </a>
        ))}
      </section>

      {/* Minimal form shell (non-functional placeholder) */}
      <section className="mt-12 max-w-2xl">
        <h2 className="label mb-4">Or send a message</h2>
        <form
          className="space-y-4 rounded-sm border border-line bg-paper p-6"
          action={`mailto:${CONTACT_EMAIL}`}
          method="post"
          encType="text/plain"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="label">Name</span>
              <input
                type="text"
                name="name"
                className="rounded-sm border border-line bg-ivory px-3 py-2 font-sans text-sm focus:border-oxblood focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="label">Email</span>
              <input
                type="email"
                name="email"
                className="rounded-sm border border-line bg-ivory px-3 py-2 font-sans text-sm focus:border-oxblood focus:outline-none"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="label">Type of inquiry</span>
            <select
              name="type"
              className="rounded-sm border border-line bg-ivory px-3 py-2 font-sans text-sm focus:border-oxblood focus:outline-none"
            >
              {INQUIRY_TYPES.map((t) => (
                <option key={t.subject}>{t.subject}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Message</span>
            <textarea
              name="message"
              rows={5}
              className="rounded-sm border border-line bg-ivory px-3 py-2 font-sans text-sm focus:border-oxblood focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-sm bg-oxblood px-5 py-2.5 font-sans text-sm text-ivory transition-colors hover:bg-oxblood-dark"
          >
            Send inquiry
          </button>
          <p className="source-note">
            This is a static archive: the form opens your mail client. No data is
            collected or stored by the site.
          </p>
        </form>
      </section>
    </div>
  );
}
