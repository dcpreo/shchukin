import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a fully static site into `out/` — the app has no server runtime
  // (plain <img>, no API routes, all data read from local JSON at build).
  output: "export",
  // Clean static URLs: each route becomes `route/index.html`.
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    // `output: export` has no image-optimization server; we already use a
    // plain <img> in ArtworkImage, so optimization is disabled outright.
    unoptimized: true,
    // Remote artwork images are referenced only from the supplied dataset and
    // resolved Commons files. We prefer locally cached copies (public/images)
    // for stability and never download unlicensed originals into the repo.
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "**.wikimedia.org" },
      { protocol: "https", hostname: "hermitagemuseum.org" },
      { protocol: "https", hostname: "**.hermitagemuseum.org" },
      { protocol: "https", hostname: "collections.hermitage.ru" },
      { protocol: "https", hostname: "pushkinmuseum.art" },
      { protocol: "https", hostname: "**.pushkinmuseum.art" }
    ]
  }
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
