import type { Work } from "@/domain/types";

function normalizeForMatch(text: string): string {
  return text.replace(/\s+/g, "").trim();
}

export function getPreviewParagraphs(
  work: Work,
  anchorExcerpt?: string
): string[] {
  const paragraphs = work.content.split("\n\n").filter((p) => p.trim());

  if (paragraphs.length === 0) return [];

  if (!anchorExcerpt?.trim()) {
    return paragraphs.slice(0, 3);
  }

  const normalizedAnchor = normalizeForMatch(anchorExcerpt);

  let anchorIndex = paragraphs.findIndex((paragraph) => {
    const normalized = normalizeForMatch(paragraph);
    return (
      normalized.includes(normalizedAnchor) ||
      normalizedAnchor.includes(normalized.slice(0, 50))
    );
  });

  if (anchorIndex === -1) {
    const anchorStart = normalizedAnchor.slice(0, 30);
    if (anchorStart.length > 0) {
      anchorIndex = paragraphs.findIndex((paragraph) =>
        normalizeForMatch(paragraph).includes(anchorStart)
      );
    }
  }

  if (anchorIndex === -1) {
    return paragraphs.slice(0, 3);
  }

  const start = Math.max(0, anchorIndex - 1);
  const end = Math.min(paragraphs.length, start + 4);
  const adjustedStart = Math.max(0, end - 4);

  return paragraphs.slice(adjustedStart, end);
}
