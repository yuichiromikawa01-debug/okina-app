"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { imageSrcCandidates } from "@/lib/image-paths";

type CoverImageProps = {
  src: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain";
  objectPosition?: string;
  priority?: boolean;
  sizes?: string;
  /** Fill a positioned parent (parent must set height/width). */
  fill?: boolean;
};

function hasExplicitPixelSize(className?: string): boolean {
  if (!className) return false;
  if (/\b(min|max)-(h|w)-/.test(className)) return false;
  if (/\bsize-\d|\bsize-\[/.test(className)) return true;
  const hasWidth = /\bw-\d|\bw-\[/.test(className);
  const hasHeight = /\bh-\d|\bh-\[/.test(className);
  return hasWidth && hasHeight;
}

function CoverImageContent({
  src,
  alt,
  fallbackTitle,
  className,
  aspectRatio = "aspect-[3/4]",
  objectFit = "cover",
  objectPosition = "center",
  priority,
  sizes = "(max-width: 768px) 100vw, 390px",
  fill = false,
}: CoverImageProps) {
  const candidates = useMemo(() => imageSrcCandidates(src), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const hasFixedSize = fill || hasExplicitPixelSize(className);
  const currentSrc = candidates[candidateIndex] ?? src;

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((index) => index + 1);
      return;
    }
    setExhausted(true);
  };

  if (exhausted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-paper p-4",
          fill && "absolute inset-0 size-full",
          !hasFixedSize && aspectRatio,
          className
        )}
      >
        <span className="text-center text-sm font-medium leading-snug text-ink/70">
          {fallbackTitle ?? alt}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-paper",
        fill && "absolute inset-0 size-full",
        !hasFixedSize && aspectRatio,
        className
      )}
    >
      <Image
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        fill
        className={cn(
          objectFit === "contain" ? "object-contain" : "object-cover"
        )}
        style={{ objectPosition }}
        sizes={sizes}
        priority={priority}
        onError={handleError}
      />
    </div>
  );
}

export function CoverImage(props: CoverImageProps) {
  return <CoverImageContent key={props.src} {...props} />;
}
