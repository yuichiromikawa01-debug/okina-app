import fs from "fs";
import path from "path";
import type { Collection } from "@/domain/types";
import { imageSrcCandidates } from "@/lib/image-paths";

/** True when any extension candidate exists under `public/`. */
export function publicImageExists(src: string): boolean {
  return imageSrcCandidates(src).some((candidate) => {
    const rel = candidate.replace(/^\//, "");
    return fs.existsSync(path.join(process.cwd(), "public", rel));
  });
}

/** Use detailImage when the file exists; otherwise fall back to heroImage. */
export function resolveDetailHeroImage(collection: Collection): string {
  if (collection.detailImage && publicImageExists(collection.detailImage)) {
    return collection.detailImage;
  }
  return collection.heroImage;
}
