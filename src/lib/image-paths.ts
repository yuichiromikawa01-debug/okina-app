/** Preferred order: .png first, then legacy/alternate formats. */
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

/** Strip a known image extension from a public asset path. */
export function stripImageExtension(src: string): string {
  return src.replace(/\.(png|jpe?g|webp)$/i, "");
}

/**
 * Build candidate paths for a catalog image reference.
 * Always tries .png first so user-dropped PNGs load even if catalog still says .jpg.
 */
export function imageSrcCandidates(src: string): string[] {
  const base = stripImageExtension(src);
  return IMAGE_EXTENSIONS.map((ext) => `${base}${ext}`);
}
