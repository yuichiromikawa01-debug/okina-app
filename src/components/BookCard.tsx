"use client";

import type { Work } from "@/domain/types";
import { CoverImage } from "./CoverImage";

type BookCardProps = {
  work: Work;
  variant?: "list" | "grid" | "track" | "inline";
  inverted?: boolean;
  onSelect?: (work: Work) => void;
};

export function InlineBookCard({
  work,
  inverted = false,
  onSelect,
}: {
  work: Work;
  inverted?: boolean;
  onSelect?: (work: Work) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(work)}
      className={`my-5 flex w-full items-start gap-3.5 rounded-xl px-3 py-3 text-left transition active:scale-[0.99] ${
        inverted
          ? "bg-white/[0.06] hover:bg-white/[0.1]"
          : "bg-black/[0.03] hover:bg-black/[0.05]"
      }`}
    >
      <CoverImage
        src={work.coverImage}
        alt={work.title}
        fallbackTitle={work.title}
        aspectRatio="aspect-[3/4]"
        className="w-[52px] shrink-0 rounded-md"
        sizes="52px"
      />
      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={`text-xs font-medium ${
            inverted ? "text-white/40" : "text-muted"
          }`}
        >
          おすすめの本
        </p>
        <h4
          className={`mt-0.5 text-[15px] font-semibold leading-snug ${
            inverted ? "text-white" : "text-ink"
          }`}
        >
          {work.title}
        </h4>
        <p
          className={`mt-1 text-sm leading-relaxed line-clamp-2 ${
            inverted ? "text-white/55" : "text-muted"
          }`}
        >
          {inverted ? work.description : work.author}
        </p>
        {inverted && (
          <p className="mt-1.5 text-xs text-white/40">{work.author}</p>
        )}
      </div>
    </button>
  );
}

export function BookCard({
  work,
  variant = "list",
  inverted = false,
  onSelect,
}: BookCardProps) {
  if (variant === "inline") {
    return (
      <InlineBookCard work={work} inverted={inverted} onSelect={onSelect} />
    );
  }

  if (variant === "track") {
    return (
      <div className="flex items-center gap-3 py-2.5">
        <CoverImage
          src={work.coverImage}
          alt={work.title}
          fallbackTitle={work.title}
          aspectRatio="aspect-[3/4]"
          className="w-12 shrink-0 rounded-md"
          sizes="48px"
        />
        <div className="min-w-0 flex-1">
          <h4
            className={`truncate font-medium leading-snug ${inverted ? "text-white" : ""}`}
          >
            {work.title}
          </h4>
          <p
            className={`truncate text-sm ${inverted ? "text-white/53" : "text-muted"}`}
          >
            {work.author}
          </p>
        </div>
        <button
          type="button"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            inverted
              ? "text-white/53 hover:bg-white/10"
              : "text-muted/70 hover:bg-black/5"
          }`}
          aria-label={`${work.title}のオプション`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="block">
        <CoverImage
          src={work.coverImage}
          alt={work.title}
          fallbackTitle={work.title}
          aspectRatio="aspect-[3/4]"
          className="w-full rounded-lg shadow-sm"
        />
        <p className="mt-2 text-sm font-semibold leading-snug line-clamp-2">
          {work.title}
        </p>
        <p className="text-xs text-muted">{work.author}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-2">
      <CoverImage
        src={work.coverImage}
        alt={work.title}
        fallbackTitle={work.title}
        aspectRatio="aspect-[3/4]"
        className="w-12 shrink-0 rounded-md"
        sizes="48px"
      />
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold leading-snug">{work.title}</h4>
        <p className="text-sm text-muted">{work.author}</p>
        <p className="mt-1 text-xs text-muted line-clamp-2">{work.description}</p>
      </div>
    </div>
  );
}

type BookListProps = {
  works: Work[];
  variant?: "list" | "track";
  inverted?: boolean;
};

export function BookList({
  works,
  variant = "list",
  inverted = false,
}: BookListProps) {
  return (
    <ul className={inverted ? "divide-y divide-white/10" : "divide-y divide-black/6"}>
      {works.map((work) => (
        <li key={work.id}>
          <BookCard work={work} variant={variant} inverted={inverted} />
        </li>
      ))}
    </ul>
  );
}
