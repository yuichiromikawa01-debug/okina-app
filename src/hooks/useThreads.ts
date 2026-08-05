"use client";

import { useCallback, useEffect, useState } from "react";
import type { Thread } from "@/domain/types";
import { getThreads } from "@/lib/threads";

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>(() =>
    typeof window !== "undefined" ? getThreads() : []
  );

  const refresh = useCallback(() => {
    setThreads(getThreads());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "okina-threads") setThreads(getThreads());
    };
    const onChange = () => setThreads(getThreads());
    window.addEventListener("storage", onStorage);
    window.addEventListener("okina-threads-changed", onChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("okina-threads-changed", onChange);
    };
  }, []);

  return { threads, refresh };
}
