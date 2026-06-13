# Shchukin Collection Archive

A production-ready website for the **Shchukin Foundation / Shchukin Collection
Archive** — a public-facing foundation site, a scholarly archive, a searchable
collection index, and a provenance-sensitive research platform for the Shchukin
family collections (1818–present).

> **The website is generated from structured archive files. Claims are not
> hardcoded unless they come from the supplied markdown/CSV/JSON sources.**

The archive makes one distinction explicit throughout:

- **Sergei Shchukin's** collection is **object-complete** in the dataset
  (259 works).
- **Pyotr, Dmitri and Ivan** are documented at **guide level**.
- **Nikolai / Gallery SHCHUKIN** is carried at **chapter level** — *no public
  object-level inventory exists* for the modern collection.

---

## Tech stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS 3** — restrained museum/archive aesthetic (ivory ground, ink
  type, oxblood accent)
- **MDX** support (`@next/mdx`)
- **CSV/JSON ingestion at build time** (dependency-free parser; `marked` for
  the source markdown documents)
- **Static generation** for every archive and object page
- Sitemap (`app/sitemap.ts`) + robots (`app/robots.ts`), SEO metadata,
  accessible semantic HTML

---

## Setup

```bash
npm install        # install dependencies
npm run dev        # local dev server → http://localhost:3000
```

Quality-control scripts:

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm run build      # production build (statically generates all pages)
npm run start      # serve the production build
```

Optional environment variable:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL used in metadata, the sitemap and
  robots.txt (defaults to `https://shchukin-archive.org`).

---

## Data sources

All factual content is read at build time from `/data`. **Nothing that
constitutes a claim is hardcoded in the pages.**

| File | Role |
|---|---|
| `data/shchukin_full_inventory.csv` | The **259-work** Sergei Shchukin object catalogue (bilingual titles, inventory IDs, image links). Drives `/collection`, `/collection/[slug]`, `/sergei`, `/images` and the homepage. |
| `data/shchukin_entities.json` / `.csv` | The **ten-entity** master register. Drives `/entities`, `/family`, `/modern`. |
| `data/sources/Shchukin_Archive_MASTER_INDEX.md` | Master index, rendered verbatim on `/archive`. |
| `data/sources/Shchukin_Family_Collections_Guide.md` | The four-brothers guide, rendered verbatim on `/family`. |

The data pipeline lives in **`lib/data.ts`** (build-time, `server-only`) and
exposes the typed utilities used across the site:

```
getAllArtworks()  getArtworkBySlug(slug)  getFeaturedArtworks()
getArtworksWithImages()  getArtists()  getMuseums()  getCategories()
getCollectionStats()  getEntities()  getEntityById(id)  getEntitiesByChapter()
getEvidenceBadge(value)   // in lib/evidence.ts (client-safe)
```

Types are defined in `lib/types.ts` (`Artwork`, `Entity`, `CollectionStatsData`).

### Slugs

Object page slugs are generated from **artist + titleEN + date** (not title
alone, since titles repeat), with accents/punctuation/whitespace normalised and
a numeric suffix added on any collision (`lib/slug.ts`). Slugs are therefore
stable and deterministic across builds.

---

## Evidence-tier system

Every claim is classed by tier, and the distinction is preserved verbatim in
the UI via the `EvidenceBadge` component:

- **[Public]** — independently documented in scholarship, museum records, press
  or institutional publication.
- **[Family-asserted]** — stated publicly by the family or gallery and repeated
  in press, but **not** independently corroborated (e.g. the modern family's
  descent from the historic Shchukins).
- **[Estate]** — held in family/estate records, true to first-hand knowledge
  but not on the open web (e.g. Nikolai's dates, the NACFUND founding year).
- **Mixed** — combines tiers (rendered with the source's exact phrasing).

The full methodology is published at **`/method`**. Blank fields in any record
are deliberate: they mark *not yet verified*, never invented data.

---

## Image handling

The archive **never downloads or re-hosts** artwork images.

1. **Direct hi-res** URL present in the CSV → the remote Wikimedia Commons
   original is shown.
2. Otherwise → a **"Find image on Commons"** lookup button.
3. No image at all → a refined **"Image not yet verified"** placeholder.

An image-rights notice appears on every object page and on `/images`. Remote
hosts are restricted in `next.config.mjs`.

---

## How to add new inventory

1. Append rows to `data/shchukin_full_inventory.csv`, keeping the existing
   header columns:
   `Artist, Title (EN), Title (RU), Date, Medium, Dimensions(cm), Museum,
   Inventory ID, Image (direct hi-res), Image (Commons lookup), Image page,
   Category`.
2. Leave a cell **blank** where a value is not yet verified — do not invent.
3. Run `npm run build`. Slugs, stats, filters, the sitemap and a static object
   page are generated automatically; no code changes are required.

To add or amend an **entity**, edit `data/shchukin_entities.json` (the canonical
source) — and mirror it in `data/shchukin_entities.csv` for completeness. To
raise a guide-level chapter to object-complete, drop a new inventory CSV in the
same shape and wire it through `lib/data.ts`.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Foundation homepage, featured works, evidence-tier notice |
| `/archive` | Master index — layered architecture, timeline, provenance spine |
| `/family` | The four historic brothers |
| `/sergei` | Sergei collection: stats, museum split, provenance, searchable table |
| `/collection` | Full searchable/filterable object catalogue |
| `/collection/[slug]` | Individual object pages (259, statically generated) |
| `/modern` | Nikolai · Gallery SHCHUKIN · NACFUND (forensic caution) |
| `/entities` | Ten-entity register with filters |
| `/method` | Evidence & provenance methodology |
| `/images` | Image archive gateway (hi-res → Commons → not verified) |
| `/roadmap` | Honest completion roadmap |
| `/contact` | Inquiry channels (mailto) |

---

## Deployment

The site is static-first; all pages are prerendered. Recommended host:
**Vercel** (zero-config for Next.js).

```bash
# Vercel
vercel            # preview
vercel --prod     # production
```

Set `NEXT_PUBLIC_SITE_URL` to the production domain in the host's environment so
metadata, the sitemap and robots.txt use the correct canonical URL. The app also
builds and runs on any Node host via `npm run build && npm run start`, and works
behind Netlify's Next.js runtime.

---

## Critical content rules (observed throughout)

- The modern branch is **not** presented as genealogically proven (descent =
  Family-asserted).
- Avant-garde works are **not** described as authenticated absent a formal
  authentication.
- Nikolai's collection is **not** presented as having a complete public
  inventory.
- Sergei's historic collection is **never** merged with the modern Foundation's
  holdings; the Foundation is **never** implied to own the museum-held Sergei
  works.
- The archive distinguishes: historic collection · former collection · public
  museum holding · Gallery SHCHUKIN exhibition · estate-held archive ·
  contemporary foundation activity.

---

*Custody: Kunst Gruppe Bureau / Shchukin Foundation.*
