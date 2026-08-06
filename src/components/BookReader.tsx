"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Work } from "@/domain/types";
import { EssayParagraph } from "@/lib/essay-format";
import {
  getReadingProgress,
  saveReadingProgress,
} from "@/lib/reading-progress";
import { useEntitlements } from "@/hooks/useEntitlements";

type BookReaderProps = {
  work: Work;
};

export function BookReader({ work }: BookReaderProps) {
  const router = useRouter();
  const { isOwned } = useEntitlements();
  const owned = isOwned(work.id);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const lastScrollY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!owned) {
      router.replace(`/works/${work.id}`);
      return;
    }
    if (restoredRef.current) return;
    const saved = getReadingProgress(work.id);
    if (saved > 0 && contentRef.current) {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: saved * maxScroll, behavior: "auto" });
      setProgress(saved);
    }
    restoredRef.current = true;
  }, [work.id, owned, router]);

  const handleScroll = useCallback(() => {
    if (!owned) return;
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY.current;

    if (currentY < 40) {
      setHeaderVisible(true);
    } else if (delta > 8) {
      setHeaderVisible(false);
    } else if (delta < -8) {
      setHeaderVisible(true);
    }

    lastScrollY.current = currentY;

    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? currentY / maxScroll : 0;
    const clamped = Math.min(1, Math.max(0, ratio));
    setProgress(clamped);
    saveReadingProgress(work.id, clamped);
  }, [work.id, owned]);

  useEffect(() => {
    if (!owned) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, owned]);

  const paragraphs = work.content.split("\n\n");

  if (!owned) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-black/6">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Scroll-linked header */}
      <header
        className={`fixed top-[2px] left-0 right-0 z-40 mx-auto max-w-[390px] bg-paper/90 backdrop-blur-md transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <Link
            href={`/works/${work.id}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="戻る"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-base text-ink">
              {work.title}
            </h1>
            <p className="truncate text-xs text-muted">{work.author}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <article ref={contentRef} className="reader-body px-5 pt-28 pb-16">
        {paragraphs.map((paragraph, i) => (
          <div key={i} className={i > 0 ? "mt-7" : undefined}>
            <EssayParagraph text={paragraph} />
          </div>
        ))}
      </article>
    </div>
  );
}
