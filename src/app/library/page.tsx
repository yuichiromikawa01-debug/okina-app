"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CollectionCard } from "@/components/CollectionCard";
import { BookCard } from "@/components/BookCard";
import {
  getAllCollections,
  libraryPickupQuestions,
  getWorkById,
} from "@/data/repositories";
import { startChat } from "@/lib/threads";
import { useEntitlements } from "@/hooks/useEntitlements";

export default function LibraryPage() {
  const router = useRouter();
  const { ownedIds } = useEntitlements();
  const collections = getAllCollections().slice(0, 4);
  const ownedWorks = ownedIds
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
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            ピックアップの質問
          </h2>
          <ul className="divide-y divide-black/6">
            {libraryPickupQuestions.map((question) => (
              <li key={question} className="-mx-2">
                <button
                  type="button"
                  onClick={() => handleQuestion(question)}
                  className="w-full rounded-lg px-2 py-3.5 text-left text-[15px] leading-relaxed text-ink transition hover:bg-black/4 active:opacity-80"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
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
          {ownedWorks.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {ownedWorks.map((work) => (
                <BookCard key={work!.id} work={work!} variant="grid" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">まだ購入した本はありません</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
