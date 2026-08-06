const STORAGE_KEY = "okina-owned-works";

export const SEED_OWNED_WORK_IDS = [
  "7f3a2b1c-4d5e-6f70-8192-a3b4c5d6e7f8",
  "ce8f7051-92a3-b415-c637-f8091011223",
  "68c69eafb-3da4-5fc6-6ad7-78899001123",
];

function readPurchasedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function getOwnedWorkIds(): string[] {
  const purchased = readPurchasedIds();
  return [...new Set([...SEED_OWNED_WORK_IDS, ...purchased])];
}

export function isWorkOwned(workId: string): boolean {
  return getOwnedWorkIds().includes(workId);
}

export function purchaseWork(workId: string): void {
  if (typeof window === "undefined") return;
  if (isWorkOwned(workId)) return;

  const purchased = readPurchasedIds();
  purchased.push(workId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(purchased));
  window.dispatchEvent(new Event("okina-entitlements-changed"));
}
