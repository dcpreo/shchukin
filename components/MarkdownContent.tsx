import { marked } from "marked";

/**
 * Renders a Markdown source document (from /data/sources) to styled HTML at
 * build time. GitHub-flavoured tables are supported. Content is trusted
 * (it ships in the repository), so sanitisation is unnecessary; placeholders
 * such as {filename} in the source are preserved verbatim rather than
 * interpreted, which is why these documents are rendered here and not via MDX.
 */
marked.setOptions({ gfm: true, breaks: false });

export function MarkdownContent({ markdown }: { markdown: string }) {
  const html = marked.parse(markdown, { async: false }) as string;
  return (
    <div
      className="mdx-content max-w-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
