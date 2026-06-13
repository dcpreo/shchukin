import type { MetadataRoute } from "next";
import { getAllArtworks } from "@/lib/data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shchukin-archive.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/archive",
    "/family",
    "/sergei",
    "/collection",
    "/modern",
    "/entities",
    "/method",
    "/images",
    "/roadmap",
    "/contact"
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7
  }));

  const objectRoutes = getAllArtworks().map((a) => ({
    url: `${SITE_URL}/collection/${a.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.5
  }));

  return [...staticRoutes, ...objectRoutes];
}
