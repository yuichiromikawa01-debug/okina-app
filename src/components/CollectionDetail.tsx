"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Collection, Work } from "@/domain/types";
import { BookList, InlineBookCard } from "./BookCard";
import { CoverImage } from "./CoverImage";
import { startChat } from "@/lib/threads";

type CollectionDetailProps = {
  collection: Collection;
  works: Work[];
};

function buildEssayBlocks(
  collection: Collection,
  worksById: Map<string, Work>
) {
  const paragraphs = collection.essay.split("\n\n");
  const embedsByIndex = new Map<number, Work[]>();

  for (const embed of collection.inlineWorks ?? []) {
    const work = worksById.get(embed.workId);
    if (!work) continue;
    const existing = embedsByIndex.get(embed.afterParagraph) ?? [];
    existing.push(work);
    embedsByIndex.set(embed.afterParagraph, existing);
  }

  return paragraphs.map((text, index) => ({
    text,
    embeds: embedsByIndex.get(index) ?? [],
  }));
}

export function CollectionDetail({ collection, works }: CollectionDetailProps) {
  const [essayExpanded, setEssayExpanded] = useState(false);
  const router = useRouter();

  const worksById = useMemo(
    () => new Map(works.map((work) => [work.id, work])),
    [works]
  );

  const essayBlocks = useMemo(
    () => buildEssayBlocks(collection, worksById),
    [collection, worksById]
  );

  const previewParagraph = collection.essay.split("\n\n")[0] ?? "";
  const hasMore = collection.essay.includes("\n\n");

  const handleBookSelect = (work: Work) => {
    const thread = startChat(
      `「${work.title}」（${work.author}）について教えて`,
      collection.id
    );
    router.push(`/chat/${thread.id}`);
  };

  return (
    <div className="pb-4">
      {/* Full-bleed hero (~40vh) */}
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden bg-paper">
        <CoverImage
          src={collection.heroImage}
          alt={collection.title}
          fallbackTitle={collection.title}
          fill
          objectPosition="center top"
          sizes="390px"
          priority
        />

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-black/60" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-bg" />

        {/* Top nav */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-12">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
            aria-label="戻る"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
              aria-label="共有"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
              aria-label="その他"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-5 text-center">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white drop-shadow-sm">
            {collection.title}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-white/75">
            {collection.category}
          </p>
        </div>
      </div>

      {/* Description + essay */}
      <section className="relative -mt-2 px-5 pt-2">
        <p className="text-[15px] leading-relaxed text-ink/80">
          {collection.description}
        </p>

        <div className="essay-body mt-5">
          <AnimatePresence mode="wait">
            {essayExpanded ? (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {essayBlocks.map((block, i) => (
                  <div key={i}>
                    <p>{block.text}</p>
                    {block.embeds.map((work) => (
                      <InlineBookCard
                        key={work.id}
                        work={work}
                        onSelect={handleBookSelect}
                      />
                    ))}
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.p key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {previewParagraph}
                {hasMore && "…"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setEssayExpanded(!essayExpanded)}
            className="mt-3 text-sm font-semibold text-ink/70 hover:text-ink"
          >
            {essayExpanded ? "閉じる" : "さらに表示"}
          </button>
        )}
      </section>

      {/* Track-style book list */}
      <section className="mt-8 px-5">
        <h2 className="mb-1 text-lg font-bold">このコレクションの本</h2>
        <BookList works={works} variant="track" />
      </section>
    </div>
  );
}
