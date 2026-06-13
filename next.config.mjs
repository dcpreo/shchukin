import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    // Remote artwork images are referenced only from the supplied dataset
    // (Wikimedia Commons originals). We never download them into the repo.
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "**.wikimedia.org" }
    ]
  }
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
