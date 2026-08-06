const KEY_PREFIX = "okina-read-progress-";

export function getReadingProgress(workId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${workId}`);
    if (!raw) return 0;
    const value = parseFloat(raw);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  } catch {
    return 0;
  }
}

export function saveReadingProgress(workId: string, progress: number): void {
  if (typeof window === "undefined") return;
  const clamped = Math.min(1, Math.max(0, progress));
  localStorage.setItem(`${KEY_PREFIX}${workId}`, String(clamped));
}
