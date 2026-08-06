"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getOwnedWorkIds,
  isWorkOwned,
  purchaseWork,
} from "@/lib/entitlements";

export function useEntitlements() {
  const [ownedIds, setOwnedIds] = useState<string[]>(() =>
    typeof window !== "undefined" ? getOwnedWorkIds() : []
  );

  const refresh = useCallback(() => {
    setOwnedIds(getOwnedWorkIds());
  }, []);

  useEffect(() => {
    window.addEventListener("okina-entitlements-changed", refresh);
    return () => window.removeEventListener("okina-entitlements-changed", refresh);
  }, [refresh]);

  return {
    ownedIds,
    isOwned: (workId: string) => ownedIds.includes(workId),
    isWorkOwned,
    purchaseWork: (workId: string) => {
      purchaseWork(workId);
      refresh();
    },
    refresh,
  };
}
