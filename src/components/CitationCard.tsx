"use client";

import type { Citation } from "@/domain/types";
import { getWorkById } from "@/data/repositories";
import { CoverImage } from "./CoverImage";

type CitationCardProps = {
  citation: Citation;
  onOpenPreview?: (workId: string, excerpt: string) => void;
};

export function CitationCard({ citation, onOpenPreview }: CitationCardProps) {
  const work = getWorkById(citation.workId);
  if (!work) return null;

  return (
    <div className="mt-4 flex items-start gap-3.5 rounded-xl bg-black/[0.03] px-3 py-3">
      <CoverImage
        src={work.coverImage}
        alt={work.title}
        fallbackTitle={work.title}
        aspectRatio="aspect-[3/4]"
        className="w-[52px] shrink-0 rounded-md"
        objectFit="cover"
        sizes="52px"
      />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-medium text-muted">引用</p>
        <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink line-clamp-2">
          {work.title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted line-clamp-2">
          {citation.excerpt}
        </p>
        <p className="mt-1.5 text-xs text-muted">{work.author}</p>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenPreview?.(citation.workId, citation.excerpt)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            原文を開く
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
