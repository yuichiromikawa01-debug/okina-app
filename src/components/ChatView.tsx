"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Thread, Collection } from "@/domain/types";
import { getThreadById } from "@/lib/threads";
import { getWorkById } from "@/data/repositories";
import { CollectionCard } from "./CollectionCard";

type ChatViewProps = {
  threadId: string;
  relatedCollections: Collection[];
};

export function ChatView({ threadId, relatedCollections }: ChatViewProps) {
  const [thread, setThread] = useState<Thread | undefined>(() =>
    typeof window !== "undefined" ? getThreadById(threadId) : undefined
  );

  useEffect(() => {
    const onChange = () => setThread(getThreadById(threadId));
    window.addEventListener("okina-threads-changed", onChange);
    return () => window.removeEventListener("okina-threads-changed", onChange);
  }, [threadId]);

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-muted">会話が見つかりません</p>
        <Link href="/" className="mt-4 text-sm font-medium underline">
          ホームに戻る
        </Link>
      </div>
    );
  }

  const showSuggestions = !thread.collectionId && thread.messages.length > 0;

  return (
    <div className="px-5 pt-2">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
          aria-label="戻る"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="min-w-0 flex-1 text-base font-semibold leading-snug line-clamp-2">
          {thread.title}
        </h1>
      </div>

      <div className="space-y-6">
        {thread.messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[88%] rounded-2xl bg-ink px-4 py-3 text-[15px] leading-relaxed text-white">
                <p>{message.content}</p>
              </div>
            </div>
          ) : (
            <article key={message.id} className="text-[15px] leading-relaxed text-ink">
              {message.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className={index > 0 ? "mt-4" : undefined}>
                  {paragraph}
                </p>
              ))}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-4 space-y-2">
                  {message.citations.map((cite) => {
                    const work = getWorkById(cite.workId);
                    return (
                      <div
                        key={cite.workId}
                        className="rounded-lg bg-bg/80 px-3 py-2 text-xs leading-relaxed text-ink/80"
                      >
                        {work && (
                          <p className="font-semibold text-ink">
                            📖 {work.title}
                          </p>
                        )}
                        <p className="mt-1">{cite.excerpt}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          )
        )}
      </div>

      {showSuggestions && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-muted">
            関連コレクション
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {relatedCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} variant="square" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
