"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Collection, Work } from "@/domain/types";
import { CoverImage } from "./CoverImage";
import { CollectionCard } from "./CollectionCard";
import { PurchaseBar } from "./PurchaseBar";
import { useImmersiveTheme } from "@/contexts/immersive-theme";
import { useHeroImageTheme } from "@/hooks/useHeroImageTheme";
import { useEntitlements } from "@/hooks/useEntitlements";
import { imageSrcCandidates } from "@/lib/image-paths";

type WorkDetailProps = {
  work: Work;
  collection: Collection;
};

function getIntroduction(work: Work): string {
  if (work.introduction) return work.introduction;
  return work.description;
}

export function WorkDetail({ work, collection }: WorkDetailProps) {
  const router = useRouter();
  const { theme } = useImmersiveTheme();
  const { isOwned, purchaseWork } = useEntitlements();
  const [purchasing, setPurchasing] = useState(false);
  const [justPurchased, setJustPurchased] = useState(false);

  const owned = isOwned(work.id);

  useHeroImageTheme(work.coverImage);

  const blurSrc = imageSrcCandidates(work.coverImage)[0] ?? work.coverImage;
  const introduction = getIntroduction(work);

  const immersiveStyle = {
    backgroundColor: theme.background,
    transition: "background-color 600ms ease",
  } as const;

  const handlePurchase = async () => {
    setPurchasing(true);
    await new Promise((r) => setTimeout(r, 600));
    purchaseWork(work.id);
    setJustPurchased(true);
    setPurchasing(false);
  };

  const handleRead = () => {
    router.push(`/works/${work.id}/read`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="relative pb-8" style={immersiveStyle}>
      {/* Blurred cover background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden opacity-40">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-3xl"
          style={{ backgroundImage: `url(${blurSrc})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${theme.background} 100%)`,
          }}
          aria-hidden
        />
      </div>

      {/* Top navigation */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12">
        <button
          type="button"
          onClick={handleBack}
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
        </button>
      </div>

      {/* Floating cover */}
      <div className="relative z-10 flex justify-center px-5 pt-6">
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{
            scale: justPurchased ? 1.04 : 1,
            opacity: 1,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-[180px] shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
        >
          <CoverImage
            src={work.coverImage}
            alt={work.title}
            fallbackTitle={work.title}
            aspectRatio="aspect-[3/4]"
            className="w-[180px] rounded-lg"
            sizes="180px"
            priority
          />
        </motion.div>
      </div>

      {/* Title, metadata & purchase */}
      <div className="relative z-10 mt-8 px-5 text-center">
        <Link
          href={`/collections/${collection.id}`}
          className="text-xs font-medium text-white/45 transition hover:text-white/65"
        >
          {collection.category}
        </Link>
        <h1 className="font-display mt-2 text-[26px] leading-tight tracking-tight text-white">
          {work.title}
        </h1>
        <p className="mt-2 text-sm text-white/55">{work.author}</p>

        <PurchaseBar
          work={work}
          owned={owned}
          purchasing={purchasing}
          onPurchase={handlePurchase}
          onRead={handleRead}
        />
      </div>

      {/* Book introduction */}
      <section className="relative z-10 mt-10 px-5">
        <p className="text-[15px] leading-[1.85] text-white/75">
          {introduction}
        </p>
      </section>

      {/* Parent collection */}
      <section className="relative z-10 mt-10 border-t border-white/10 px-5 pt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          収録コレクション
        </h2>
        <CollectionCard collection={collection} variant="row" inverted />
      </section>
    </div>
  );
}
