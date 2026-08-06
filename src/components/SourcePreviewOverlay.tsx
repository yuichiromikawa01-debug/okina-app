"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Work } from "@/domain/types";
import { EssayParagraph } from "@/lib/essay-format";
import { getPreviewParagraphs } from "@/lib/work-preview";

type SourcePreviewOverlayProps = {
  work: Work;
  citationExcerpt?: string;
  owned: boolean;
  onClose: () => void;
};

export function SourcePreviewOverlay({
  work,
  citationExcerpt,
  owned,
  onClose,
}: SourcePreviewOverlayProps) {
  const paragraphs = getPreviewParagraphs(work, citationExcerpt);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 w-full md:mx-auto md:max-w-[390px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        aria-label="プレビューを閉じる"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-preview-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[92vh] w-full flex-col bg-paper shadow-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <header className="shrink-0 border-b border-black/[0.06] px-4 pt-12 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="チャットに戻る"
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
            </button>
            <div className="min-w-0 flex-1">
              <h2
                id="source-preview-title"
                className="truncate font-display text-base text-ink"
              >
                {work.title}
              </h2>
              <p className="truncate text-xs text-muted">{work.author}</p>
            </div>
          </div>
        </header>

        <article className="reader-body flex-1 overflow-y-auto px-5 py-6">
          {paragraphs.map((paragraph, index) => (
            <div key={index} className={index > 0 ? "mt-7" : undefined}>
              <EssayParagraph text={paragraph} />
            </div>
          ))}
        </article>

        <footer className="shrink-0 border-t border-black/[0.06] bg-paper px-5 pt-4 pb-[calc(1rem+var(--safe-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            チャットに戻る
          </button>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href={`/works/${work.id}`}
              className="text-center text-sm font-medium text-ink underline-offset-2 hover:underline"
            >
              本の詳細を見る
            </Link>
            {owned && (
              <Link
                href={`/works/${work.id}/read`}
                className="text-center text-sm font-medium text-muted underline-offset-2 hover:underline"
              >
                続きを読む
              </Link>
            )}
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}
