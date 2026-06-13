/**
 * Image-rights notice shown on every object page and the image archive.
 * The archive never downloads copyrighted images into the repository; remote
 * URLs are used only where the supplied dataset permits.
 */
export function ImageRightsNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="source-note border-l-2 border-line pl-3">
        Images are referenced from the supplied dataset (chiefly Wikimedia
        Commons originals) and remain the property of their respective holders
        and museums. No images are stored in this archive.
      </p>
    );
  }
  return (
    <aside className="rounded-sm border border-line bg-paper p-4">
      <h2 className="label-accent mb-2">Image rights &amp; sourcing</h2>
      <p className="source-note">
        This archive does not host or store artwork images. Where a direct
        hi-res link exists in the source dataset it points to a freely-licensed
        Wikimedia Commons original; otherwise a Commons lookup is provided so
        the correct file can be located at its holding institution. All images
        remain subject to the rights and reproduction policies of the Hermitage,
        the Pushkin State Museum of Fine Arts, Wikimedia Commons contributors,
        and other current holders. Verify licensing before reuse.
      </p>
    </aside>
  );
}
