"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useThreads } from "@/hooks/useThreads";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function Drawer({ open, onClose }: DrawerProps) {
  const { threads } = useThreads();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed left-0 top-0 z-50 flex h-full w-[min(320px,85vw)] flex-col bg-bg shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between px-5 pt-12 pb-3">
              <span className="font-display text-[22px] font-normal tracking-tight text-ink">
                Okina
              </span>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 rounded-full p-2 text-ink/60 hover:bg-black/5"
                aria-label="閉じる"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="space-y-1 px-5 pb-3">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium hover:bg-black/5"
              >
                <svg
                  className="shrink-0 text-ink"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 3 2 12h3v9h6v-6h2v6h6v-9h3L12 3z" />
                </svg>
                ホーム
              </Link>
              <Link
                href="/library"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium hover:bg-black/5"
              >
                <svg
                  className="shrink-0 text-ink"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6zm0 2h5v16H6V4zm7 0h5v16h-5V4z" />
                </svg>
                ライブラリ
              </Link>
            </nav>

            <div className="mx-5 border-t border-black/8" />

            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                最近の会話
              </p>
              {threads.length === 0 ? (
                <p className="text-sm text-muted">まだ会話がありません</p>
              ) : (
                <ul className="space-y-1">
                  {threads.map((thread) => (
                    <li key={thread.id}>
                      <Link
                        href={`/chat/${thread.id}`}
                        onClick={onClose}
                        className="block rounded-xl px-3 py-3 hover:bg-black/5"
                      >
                        <p className="text-[15px] font-medium leading-snug line-clamp-2">
                          {thread.title}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
