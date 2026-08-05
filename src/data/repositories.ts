import type { Collection, Work } from "@/domain/types";
import collectionsIndex from "./catalog/collections.json";
import heartbreak from "./catalog/heartbreak.json";
import wineDeep from "./catalog/wine-deep.json";
import baystarsSuccess from "./catalog/baystars-success.json";
import ohtaniMind from "./catalog/ohtani-mind.json";
import twentiesGoals from "./catalog/twenties-goals.json";

type CollectionFile = Collection & { works: Work[] };

const collectionFiles: CollectionFile[] = [
  heartbreak as CollectionFile,
  wineDeep as CollectionFile,
  baystarsSuccess as CollectionFile,
  ohtaniMind as CollectionFile,
  twentiesGoals as CollectionFile,
];

const collectionsMap = new Map(
  collectionFiles.map((c) => [c.id, c])
);

const worksMap = new Map<string, Work>();
for (const file of collectionFiles) {
  for (const work of file.works) {
    worksMap.set(work.id, work);
  }
}

export function getAllCollections(): Collection[] {
  return (collectionsIndex as { id: string; order: number }[])
    .sort((a, b) => a.order - b.order)
    .map((meta) => {
      const full = collectionsMap.get(meta.id);
      if (!full) throw new Error(`Missing collection: ${meta.id}`);
      const { works, ...collection } = full;
      void works;
      return collection;
    });
}

export function getFeaturedCollections(): Collection[] {
  return getAllCollections().filter((c) =>
    (collectionsIndex as { id: string; featured?: boolean }[]).find(
      (m) => m.id === c.id
    )?.featured
  );
}

export function getCollectionById(id: string): Collection | undefined {
  const full = collectionsMap.get(id);
  if (!full) return undefined;
  const { works, ...collection } = full;
  void works;
  return collection;
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return getAllCollections().find((c) => c.slug === slug);
}

export function getWorksForCollection(collectionId: string): Work[] {
  const full = collectionsMap.get(collectionId);
  return full?.works ?? [];
}

export function getWorkById(id: string): Work | undefined {
  return worksMap.get(id);
}

export function getAllWorks(): Work[] {
  return Array.from(worksMap.values());
}

export function getRelatedCollections(limit = 3): Collection[] {
  return getAllCollections().slice(0, limit);
}

export const libraryPickupQuestions = [
  "失恋したとき、何を読めばいい？",
  "ワイン初心者におすすめの入門書は？",
  "大谷翔平のメンタル術を知りたい",
  "20代で身につけるべきスキルは？",
  "スポーツビジネスの成功事例を教えて",
];

export const ownedWorkIds = [
  "7f3a2b1c-4d5e-6f70-8192-a3b4c5d6e7f8",
  "ce8f7051-92a3-b415-c637-f8091011223",
  "68c69eafb-3da4-5fc6-6ad7-78899001123",
];
