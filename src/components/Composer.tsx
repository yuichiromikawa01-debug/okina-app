"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { startChat, sendMessage } from "@/lib/threads";
import { getCollectionById } from "@/data/repositories";

type ComposerProps = {
  collectionId?: string;
  threadId?: string;
  placeholder?: string;
  variant?: "light" | "dark";
  immersiveTint?: string;
};

export function Composer({
  collectionId,
  threadId,
  placeholder = "Okina に聞く",
  variant = "light",
  immersiveTint,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const collection = collectionId ? getCollectionById(collectionId) : undefined;
  const displayPlaceholder = collection
    ? `「${collection.title}」について聞く`
    : placeholder;

  useEffect(() => {
    if (threadId && pathname.startsWith("/chat/")) {
      inputRef.current?.focus();
    }
  }, [threadId, pathname]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      if (threadId && pathname.startsWith("/chat/")) {
        sendMessage(threadId, trimmed);
        setValue("");
      } else {
        const thread = startChat(trimmed, collectionId);
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

  const hasText = value.trim().length > 0;

  const outerClass =
    variant === "dark"
      ? "fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[390px] border-t border-white/10 pt-4 backdrop-blur-[12px]"
      : immersiveTint
        ? "fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[390px] pt-4"
        : "fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[390px] bg-gradient-to-t from-bg via-bg/95 to-transparent pt-4";

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
        <div
          className={`flex items-center gap-2 rounded-full border bg-white px-3 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-shadow ${
            focused
              ? "border-black/12 shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
              : "border-black/8"
          }`}
        >
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/50 transition hover:bg-black/4 hover:text-ink/70"
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
            className="max-h-20 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-snug outline-none placeholder:text-muted/80"
          />

          {hasText ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition hover:brightness-105 disabled:opacity-40"
              aria-label="送信"
            >
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
            </button>
          ) : (
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/50 transition hover:bg-black/4 hover:text-ink/70"
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
