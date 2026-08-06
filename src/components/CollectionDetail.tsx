"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Collection, Work } from "@/domain/types";
import { BookList, InlineBookCard } from "./BookCard";
import { CoverImage } from "./CoverImage";
import { useImmersiveTheme } from "@/contexts/immersive-theme";
import { useHeroImageTheme } from "@/hooks/useHeroImageTheme";
import { EssayParagraph } from "@/lib/essay-format";

type CollectionDetailProps = {
  collection: Collection;
  works: Work[];
  /** Resolved on the server when detail.png is not on disk yet. */
  detailHeroImage?: string;
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

export function CollectionDetail({
  collection,
  works,
  detailHeroImage: detailHeroImageProp,
}: CollectionDetailProps) {
  const router = useRouter();
  const { theme } = useImmersiveTheme();
  const detailHeroImage =
    detailHeroImageProp ?? collection.detailImage ?? collection.heroImage;

  useHeroImageTheme(detailHeroImage);

  const worksById = useMemo(
    () => new Map(works.map((work) => [work.id, work])),
    [works]
  );

  const essayBlocks = useMemo(
    () => buildEssayBlocks(collection, worksById),
    [collection, worksById]
  );

  const handleBookSelect = (work: Work) => {
    router.push(`/works/${work.id}`);
  };

  const immersiveStyle = {
    backgroundColor: theme.background,
    transition: "background-color 600ms ease",
  } as const;

  const heroHeight = 340;
  const gradientBleed = 72;
  const { r, g, b } = theme.backgroundRgb;
  const heroGradient = `linear-gradient(to bottom,
    rgba(${r}, ${g}, ${b}, 0) 0%,
    rgba(${r}, ${g}, ${b}, 0.35) 38%,
    ${theme.gradientMid} 58%,
    ${theme.gradientEnd} 76%,
    ${theme.gradientEnd} 100%)`;

  return (
    <div className="pb-4" style={immersiveStyle}>
      {/* Hero + fade: image clipped to 340px; gradient bleeds below for seamless handoff */}
      <div className="relative">
        <div
          className="absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: heroHeight }}
        >
          <CoverImage
            src={detailHeroImage}
            alt={collection.title}
            fallbackTitle={collection.title}
            fill
            objectPosition="center top"
            sizes="390px"
            priority
          />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1]"
          style={{
            height: heroHeight + gradientBleed,
            background: heroGradient,
            transition: "background 600ms ease",
          }}
          aria-hidden
        />

        <div className="relative z-10" style={{ height: heroHeight }}>
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-12">
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

          <div className="absolute bottom-0 left-0 right-0 px-5 pb-3 text-center translate-y-1">
            <h1 className="text-[28px] font-normal leading-tight tracking-tight text-white drop-shadow-sm">
              {collection.title}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-white/75">
              {collection.category}
            </p>
          </div>
        </div>

        {/* Lead + long-form essay — below hero, no overlap with title overlay */}
        <section className="relative z-10 px-5 pt-10">
          <p className="text-[15px] leading-relaxed text-white/75">
            {collection.description}
          </p>

          <article className="essay-body essay-body--dark mt-10">
            {essayBlocks.map((block, i) => (
              <div key={i} className="essay-block">
                <EssayParagraph text={block.text} />
                {block.embeds.map((work) => (
                  <InlineBookCard
                    key={work.id}
                    work={work}
                    inverted
                    onSelect={handleBookSelect}
                  />
                ))}
              </div>
            ))}
          </article>
        </section>
      </div>

      {/* Complete collection book list */}
      <section className="mt-10 border-t border-white/10 px-5 pt-8">
        <h2 className="mb-4 text-[22px] font-medium text-white">このコレクションの本</h2>
        <p className="mb-3 text-sm text-white/53">
          全{works.length}冊
        </p>
        <BookList works={works} variant="track" inverted />
      </section>
    </div>
  );
}
