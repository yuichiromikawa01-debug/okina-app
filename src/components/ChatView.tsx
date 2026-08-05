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

      <div className="space-y-4">
        {thread.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                message.role === "user"
                  ? "bg-ink text-white"
                  : "bg-white/80 text-ink shadow-sm ring-1 ring-black/6"
              }`}
            >
              <p>{message.content}</p>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-black/8 pt-3">
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
            </div>
          </div>
        ))}
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
