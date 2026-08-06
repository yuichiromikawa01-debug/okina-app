"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Collection, Message, Thread } from "@/domain/types";
import { getWorkById } from "@/data/repositories";
import {
  getThreadById,
  isThreadThinking,
  selectCollectionWithReply,
} from "@/lib/threads";
import { useEntitlements } from "@/hooks/useEntitlements";
import { CitationCard } from "./CitationCard";
import { CollectionCard } from "./CollectionCard";
import { SourcePreviewOverlay } from "./SourcePreviewOverlay";
import { ThinkingIndicator } from "./ThinkingIndicator";

type PreviewState = {
  workId: string;
  excerpt: string;
};

type ChatViewProps = {
  threadId: string;
  relatedCollections: Collection[];
  onPreviewOpenChange?: (open: boolean) => void;
};

const SELECTION_ANIM_MS = 380;
const SUGGESTIONS_EXIT_MS = 350;

function renderAssistantMessage(
  message: Message,
  onOpenPreview: (workId: string, excerpt: string) => void
) {
  if (message.blocks && message.blocks.length > 0) {
    return message.blocks.map((block, index) => {
      if (block.type === "text") {
        return (
          <p key={index} className={index > 0 ? "mt-4" : undefined}>
            {block.content}
          </p>
        );
      }
      return (
        <CitationCard
          key={index}
          citation={block.citation}
          onOpenPreview={onOpenPreview}
        />
      );
    });
  }

  return (
    <>
      {message.content.split("\n\n").map((paragraph, index) => (
        <p key={index} className={index > 0 ? "mt-4" : undefined}>
          {paragraph}
        </p>
      ))}
      {message.citations?.map((citation, index) => (
        <CitationCard
          key={index}
          citation={citation}
          onOpenPreview={onOpenPreview}
        />
      ))}
    </>
  );
}

export function ChatView({
  threadId,
  relatedCollections,
  onPreviewOpenChange,
}: ChatViewProps) {
  const [thread, setThread] = useState<Thread | undefined>(() =>
    typeof window !== "undefined" ? getThreadById(threadId) : undefined
  );
  const [thinking, setThinking] = useState(() =>
    typeof window !== "undefined" ? isThreadThinking(threadId) : false
  );
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [suggestionsHidden, setSuggestionsHidden] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const { isOwned } = useEntitlements();

  const handleOpenPreview = useCallback((workId: string, excerpt: string) => {
    setPreview({ workId, excerpt });
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreview(null);
  }, []);

  useEffect(() => {
    onPreviewOpenChange?.(preview !== null);
  }, [preview, onPreviewOpenChange]);

  const previewWork = preview ? getWorkById(preview.workId) : undefined;

  useEffect(() => {
    const onChange = () => {
      const updated = getThreadById(threadId);
      setThread(updated);
      if (updated && !updated.collectionId) {
        setSuggestionsHidden(false);
        setSelectingId(null);
      }
    };
    window.addEventListener("okina-threads-changed", onChange);
    return () => window.removeEventListener("okina-threads-changed", onChange);
  }, [threadId]);

  useEffect(() => {
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

  const handleCollectionSelect = useCallback(
    async (collectionId: string) => {
      if (selectingId) return;

      setSelectingId(collectionId);

      await new Promise((resolve) => setTimeout(resolve, SELECTION_ANIM_MS));

      setSuggestionsHidden(true);
      await new Promise((resolve) => setTimeout(resolve, SUGGESTIONS_EXIT_MS));

      await selectCollectionWithReply(threadId, collectionId);
      setSelectingId(null);
    },
    [selectingId, threadId]
  );

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

  const lastMessage = thread.messages[thread.messages.length - 1];
  const showSuggestions =
    !thread.collectionId &&
    lastMessage?.role === "assistant" &&
    !thinking &&
    !suggestionsHidden;

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
              {renderAssistantMessage(message, handleOpenPreview)}
            </article>
          )
        )}

        <AnimatePresence>
          {thinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ThinkingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.section
            key="collection-suggestions"
            className="mt-8 overflow-hidden"
            initial={{ opacity: 1, height: "auto" }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            <h2 className="mb-3 text-sm font-semibold text-muted">
              関連コレクション
            </h2>
            <p className="mb-3 text-xs text-muted">
              テーマを選ぶと、そのコレクションの本を参照して回答します
            </p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {relatedCollections.map((collection, index) => {
                const isSelected = selectingId === collection.id;
                const isDimmed = Boolean(selectingId && !isSelected);

                return (
                  <motion.div
                    key={collection.id}
                    layout
                    initial={{ opacity: 1, scale: 1, y: 0 }}
                    animate={{
                      opacity: isDimmed ? 0 : 1,
                      scale: isSelected ? 1.06 : isDimmed ? 0.88 : 1,
                      y: isSelected ? -6 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 26,
                      delay: isDimmed ? index * 0.04 : 0,
                    }}
                    className="shrink-0"
                    style={{ pointerEvents: selectingId ? "none" : "auto" }}
                  >
                    <CollectionCard
                      collection={collection}
                      variant="square"
                      onSelect={handleCollectionSelect}
                      dimmed={isDimmed}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewWork && preview && (
          <SourcePreviewOverlay
            key="source-preview"
            work={previewWork}
            citationExcerpt={preview.excerpt}
            owned={isOwned(preview.workId)}
            onClose={handleClosePreview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
