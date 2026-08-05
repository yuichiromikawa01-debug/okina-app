import type { ReactNode } from "react";

const INLINE_MARKDOWN_RE = /\*\*(.+?)\*\*|\*([^*]+?)\*/g;

/** Parse `**bold**` and `*italic*` spans within a line of essay text. */
export function parseEssayInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE_MARKDOWN_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

type EssayBlockKind = "h1" | "h2" | "h3" | "blockquote" | "list" | "paragraph";

function detectEssayBlockKind(text: string): EssayBlockKind {
  const trimmed = text.trim();
  if (trimmed.startsWith("### ")) return "h3";
  if (trimmed.startsWith("## ")) return "h2";
  if (trimmed.startsWith("# ")) return "h1";
  if (trimmed.startsWith("> ")) return "blockquote";
  const lines = trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length >= 2 && lines.every((line) => line.startsWith("- "))) {
    return "list";
  }
  return "paragraph";
}

function stripBlockPrefix(text: string, kind: EssayBlockKind): string {
  const trimmed = text.trim();
  if (kind === "h1") return trimmed.slice(2);
  if (kind === "h2") return trimmed.slice(3);
  if (kind === "h3") return trimmed.slice(4);
  if (kind === "blockquote") return trimmed.slice(2);
  return text;
}

function parseListItems(text: string): string[] {
  return text
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(2));
}

/** Render one essay paragraph block (plain text with optional lightweight markdown). */
export function EssayParagraph({ text }: { text: string }) {
  const kind = detectEssayBlockKind(text);
  const content = parseEssayInline(stripBlockPrefix(text, kind));

  switch (kind) {
    case "h1":
      return <h1 className="essay-heading essay-heading--1">{content}</h1>;
    case "h2":
      return <h2 className="essay-heading essay-heading--2">{content}</h2>;
    case "h3":
      return <h3 className="essay-heading essay-heading--3">{content}</h3>;
    case "blockquote":
      return (
        <blockquote className="essay-quote">
          <p>{content}</p>
        </blockquote>
      );
    case "list":
      return (
        <ul className="essay-list">
          {parseListItems(text).map((item, index) => (
            <li key={index}>{parseEssayInline(item)}</li>
          ))}
        </ul>
      );
    default:
      return <p>{content}</p>;
  }
}
