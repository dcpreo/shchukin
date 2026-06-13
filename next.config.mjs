import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
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
