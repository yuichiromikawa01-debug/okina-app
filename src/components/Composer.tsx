"use client";

import { useState, useRef, useEffect, useReducer } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
  startChat,
  sendMessage,
  getThreadById,
  clearThreadCollection,
  isThreadThinking,
} from "@/lib/threads";
import { getCollectionById, getWorkById } from "@/data/repositories";
import type { Thread } from "@/domain/types";

type ComposerProps = {
  collectionId?: string;
  workId?: string;
  threadId?: string;
  placeholder?: string;
  variant?: "light" | "dark";
  immersiveTint?: string;
};

export function Composer({
  collectionId: collectionIdProp,
  workId,
  threadId,
  placeholder = "Okina に聞く",
  variant = "light",
  immersiveTint,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState(() =>
    threadId ? isThreadThinking(threadId) : false
  );
  const [, refreshThread] = useReducer((count: number) => count + 1, 0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const inChat = Boolean(threadId && pathname.startsWith("/chat/"));
  const thread: Thread | undefined =
    inChat && threadId ? getThreadById(threadId) : undefined;

  useEffect(() => {
    if (!inChat || !threadId) return;

    const sync = () => refreshThread();
    window.addEventListener("okina-threads-changed", sync);
    return () => window.removeEventListener("okina-threads-changed", sync);
  }, [inChat, threadId]);

  useEffect(() => {
    if (!threadId) return;

    const onThinking = (e: Event) => {
      const detail = (e as CustomEvent<{ threadId: string }>).detail;
      if (detail.threadId === threadId) {
        setThinking(isThreadThinking(threadId));
      }
    };
    window.addEventListener("okina-thinking-changed", onThinking);
    return () =>
      window.removeEventListener("okina-thinking-changed", onThinking);
  }, [threadId]);

  const activeCollectionId = inChat
    ? thread?.collectionId
    : collectionIdProp;
  const work = workId ? getWorkById(workId) : undefined;
  const collection = activeCollectionId
    ? getCollectionById(activeCollectionId)
    : undefined;
  const displayPlaceholder = work
    ? `「${work.title}」について聞く`
    : collection
      ? `「${collection.title}」について聞く`
      : placeholder;

  useEffect(() => {
    if (inChat) {
      inputRef.current?.focus();
    }
  }, [inChat, threadId]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending || thinking) return;

    setSending(true);
    try {
      if (inChat && threadId) {
        await sendMessage(threadId, trimmed);
        setValue("");
      } else {
        const thread = startChat(trimmed, collectionIdProp);
        setValue("");
        router.push(`/chat/${thread.id}`);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearCollection = () => {
    if (threadId) {
      clearThreadCollection(threadId);
    }
  };

  const hasText = value.trim().length > 0;
  const busy = sending || thinking;

  const outerClass =
    variant === "dark"
      ? "fixed bottom-0 left-0 right-0 z-30 w-full md:mx-auto md:max-w-[390px] border-t border-white/10 pt-4 backdrop-blur-[12px]"
      : immersiveTint
        ? "fixed bottom-0 left-0 right-0 z-30 w-full md:mx-auto md:max-w-[390px] pt-4"
        : "fixed bottom-0 left-0 right-0 z-30 w-full md:mx-auto md:max-w-[390px] bg-gradient-to-t from-bg via-bg/95 to-transparent pt-4";

  return (
    <div
      className={outerClass}
      style={{
        paddingBottom: "var(--safe-bottom)",
        ...(variant === "dark"
          ? {
              backgroundColor:
                immersiveTint ?? "rgba(26, 26, 46, 0.83)",
              transition: "background-color 600ms ease",
            }
          : {}),
      }}
    >
      <div className="px-4 pb-3">
        {inChat && collection && (
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className="truncate">「{collection.title}」コレクション</span>
              <button
                type="button"
                onClick={handleClearCollection}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/6 hover:text-ink"
                aria-label="コレクションの選択を解除"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        )}

        <div
          className={`flex min-h-[76px] items-center gap-0.5 rounded-[28px] border bg-white px-3.5 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-shadow ${
            focused
              ? "border-black/12 shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
              : "border-black/8"
          }`}
        >
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/50 transition hover:bg-black/4 hover:text-ink/70"
            aria-label="添付"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={displayPlaceholder}
            rows={1}
            disabled={busy}
            className="composer-textarea max-h-24 min-h-10 flex-1 -translate-y-1 resize-none bg-transparent px-0 py-1 text-[15px] leading-5 outline-none placeholder:text-muted/80 disabled:opacity-50"
          />

          {hasText ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition hover:brightness-105 disabled:opacity-40"
              aria-label={busy ? "送信中" : "送信"}
            >
              {busy ? (
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-ink/20 border-t-ink/70"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/50 transition hover:bg-black/4 hover:text-ink/70"
              aria-label="音声入力"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
