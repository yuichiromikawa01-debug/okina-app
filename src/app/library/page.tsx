"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CollectionCard } from "@/components/CollectionCard";
import { BookCard } from "@/components/BookCard";
import {
  getAllCollections,
  libraryPickupQuestions,
  ownedWorkIds,
  getWorkById,
} from "@/data/repositories";
import { startChat } from "@/lib/threads";

export default function LibraryPage() {
  const router = useRouter();
  const collections = getAllCollections().slice(0, 4);
  const ownedWorks = ownedWorkIds
    .map((id) => getWorkById(id))
    .filter(Boolean);

  const handleQuestion = (question: string) => {
    const thread = startChat(question);
    router.push(`/chat/${thread.id}`);
  };

  return (
    <AppShell>
      <div className="px-5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">ライブラリ</h1>
        <p className="mt-1 text-sm text-muted">
          質問から始めるか、コレクションを探索
        </p>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            ピックアップの質問
          </h2>
          <div className="flex flex-col gap-2">
            {libraryPickupQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => handleQuestion(question)}
                className="rounded-xl bg-white/80 px-4 py-3.5 text-left text-[15px] leading-snug shadow-sm ring-1 ring-black/6 transition hover:bg-white active:scale-[0.98]"
              >
                {question}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">最近のコレクション</h2>
          <div className="space-y-1">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                variant="row"
              />
            ))}
          </div>
          <Link
            href="/"
            className="mt-3 block text-sm font-medium text-ink/70 hover:text-ink"
          >
            すべて見る →
          </Link>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">所持している本</h2>
          <div className="grid grid-cols-3 gap-4">
            {ownedWorks.map((work) => (
              <BookCard key={work!.id} work={work!} variant="grid" />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
