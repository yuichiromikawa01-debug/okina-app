import { AppShell } from "@/components/AppShell";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CollectionCard } from "@/components/CollectionCard";
import { BookList } from "@/components/BookCard";
import {
  getAllCollections,
  getFeaturedCollections,
  getAllWorks,
} from "@/data/repositories";

export default function HomePage() {
  const featured = getFeaturedCollections();
  const collections = getAllCollections();
  const recentWorks = getAllWorks().slice(0, 6);

  return (
    <AppShell>
      <HeroCarousel collections={featured} />

      <section className="mb-8 px-5">
        <h2 className="mb-4 text-xl font-bold tracking-tight">人気</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="px-5">
        <h2 className="mb-4 text-xl font-bold tracking-tight">新着の本</h2>
        <BookList works={recentWorks} />
      </section>
    </AppShell>
  );
}
