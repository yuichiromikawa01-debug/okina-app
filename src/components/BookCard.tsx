"use client";

import type { Work } from "@/domain/types";
import { CoverImage } from "./CoverImage";

type BookCardProps = {
  work: Work;
  variant?: "list" | "grid" | "track" | "inline";
  onSelect?: (work: Work) => void;
};

export function InlineBookCard({
  work,
  onSelect,
}: {
  work: Work;
  onSelect?: (work: Work) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(work)}
      className="my-6 flex w-full gap-4 rounded-2xl border border-black/6 bg-white/70 p-4 text-left shadow-sm transition hover:bg-white active:scale-[0.99]"
    >
      <CoverImage
        src={work.coverImage}
        alt={work.title}
        fallbackTitle={work.title}
        aspectRatio="aspect-square"
        className="h-[72px] w-[72px] shrink-0 rounded-lg"
        sizes="72px"
      />
      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          おすすめの本
        </p>
        <h4 className="mt-1 font-semibold leading-snug">{work.title}</h4>
        <p className="mt-0.5 text-sm text-muted">{work.author}</p>
      </div>
    </button>
  );
}

export function BookCard({ work, variant = "list", onSelect }: BookCardProps) {
  if (variant === "inline") {
    return <InlineBookCard work={work} onSelect={onSelect} />;
  }

  if (variant === "track") {
    return (
      <div className="flex items-center gap-3 py-2.5">
        <CoverImage
          src={work.coverImage}
          alt={work.title}
          fallbackTitle={work.title}
          aspectRatio="aspect-square"
          className="h-12 w-12 shrink-0 rounded-md"
          sizes="48px"
        />
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium leading-snug">{work.title}</h4>
          <p className="truncate text-sm text-muted">{work.author}</p>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted/70 hover:bg-black/5"
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
          aspectRatio="aspect-[2/3]"
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
        aspectRatio="aspect-[2/3]"
        className="h-[72px] w-12 shrink-0 rounded-md"
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
};

export function BookList({ works, variant = "list" }: BookListProps) {
  return (
    <ul className="divide-y divide-black/6">
      {works.map((work) => (
        <li key={work.id}>
          <BookCard work={work} variant={variant} />
        </li>
      ))}
    </ul>
  );
}
