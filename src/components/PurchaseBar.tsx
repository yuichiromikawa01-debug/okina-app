"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Work } from "@/domain/types";

type PurchaseBarProps = {
  work: Work;
  owned: boolean;
  purchasing: boolean;
  onPurchase: () => void;
  onRead: () => void;
};

export function PurchaseBar({
  work,
  owned,
  purchasing,
  onPurchase,
  onRead,
}: PurchaseBarProps) {
  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <p className="text-base font-medium text-white/70">
        ¥{work.priceYen.toLocaleString()} · 電子版
      </p>

      <AnimatePresence mode="wait">
        <motion.button
          key={owned ? "read" : "purchase"}
          type="button"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          onClick={owned ? onRead : onPurchase}
          disabled={purchasing}
          className="shrink-0 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink transition hover:brightness-105 disabled:opacity-60"
        >
          {purchasing ? "処理中…" : owned ? "読む" : "購入する"}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
