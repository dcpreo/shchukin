import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. Inherits the archive prose styles.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
