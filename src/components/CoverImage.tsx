"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  return /\b(h-\d|h-\[|w-\d|w-\[|size-\d|size-\[)/.test(className);
}

export function CoverImage({
  src,
  alt,
  fallbackTitle,
  className,
  aspectRatio = "aspect-[3/4]",
  objectFit = "cover",
  objectPosition = "center",
  priority,
  sizes = "(max-width: 390px) 100vw, 390px",
  fill = false,
}: CoverImageProps) {
  const [error, setError] = useState(false);
  const hasFixedSize = fill || hasExplicitPixelSize(className);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-paper p-4",
          fill && "absolute inset-0",
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
        fill && "absolute inset-0",
        !hasFixedSize && aspectRatio,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          objectFit === "contain" ? "object-contain" : "object-cover"
        )}
        style={{ objectPosition }}
        sizes={sizes}
        priority={priority}
        onError={() => setError(true)}
      />
    </div>
  );
}
