"use client";

import type { Collection } from "@/domain/types";
import { CollectionCard } from "./CollectionCard";

type HeroCarouselProps = {
  collections: Collection[];
};

export function HeroCarousel({ collections }: HeroCarouselProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 px-5 text-xl font-bold tracking-tight">おすすめ</h2>
      <div className="snap-carousel flex gap-4 overflow-x-auto px-5 pb-2">
        {collections.map((collection, i) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            variant="hero"
            priority={i === 0}
          />
        ))}
      </div>
    </section>
  );
}
