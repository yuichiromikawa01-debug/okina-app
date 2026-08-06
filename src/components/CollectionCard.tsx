import Link from "next/link";
import type { Collection } from "@/domain/types";
import { CoverImage } from "./CoverImage";

type CollectionCardProps = {
  collection: Collection;
  variant?: "hero" | "square" | "row";
  priority?: boolean;
  inverted?: boolean;
  onSelect?: (collectionId: string) => void;
  dimmed?: boolean;
};

function CardWrapper({
  href,
  onSelect,
  collectionId,
  className,
  children,
}: {
  href: string;
  onSelect?: (collectionId: string) => void;
  collectionId: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(collectionId)}
        className={`text-left ${className ?? ""}`}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function CollectionCard({
  collection,
  variant = "square",
  priority,
  inverted = false,
  onSelect,
  dimmed = false,
}: CollectionCardProps) {
  const href = `/collections/${collection.id}`;
  const selectionClass = dimmed ? "opacity-40" : "";

  if (variant === "hero") {
    return (
      <CardWrapper
        href={href}
        onSelect={onSelect}
        collectionId={collection.id}
        className="snap-item flex w-[260px] shrink-0 flex-col"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg shadow-black/10">
          <CoverImage
            src={collection.heroImage}
            alt={collection.title}
            fallbackTitle={collection.title}
            fill
            className="rounded-2xl"
            objectPosition="center top"
            priority={priority}
            sizes="260px"
          />
        </div>
        <div className="mt-3 min-h-[6.75rem] px-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted line-clamp-1">
            {collection.category}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-lg font-semibold leading-tight">
            {collection.title}
          </h3>
          <p className="mt-1 text-sm text-muted line-clamp-2">
            {collection.description}
          </p>
        </div>
      </CardWrapper>
    );
  }

  if (variant === "row") {
    return (
      <CardWrapper
        href={href}
        onSelect={onSelect}
        collectionId={collection.id}
        className={
          inverted
            ? "flex gap-3 rounded-xl p-2 transition hover:bg-white/6"
            : "flex gap-3 rounded-xl p-2 hover:bg-black/4"
        }
      >
        <CoverImage
          src={collection.squareImage ?? collection.heroImage}
          alt={collection.title}
          fallbackTitle={collection.title}
          aspectRatio="aspect-square"
          className="h-16 w-16 shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1 py-0.5">
          <p
            className={
              inverted ? "text-xs text-white/45" : "text-xs text-muted"
            }
          >
            {collection.category}
          </p>
          <h3
            className={`font-semibold leading-snug ${inverted ? "text-white" : ""}`}
          >
            {collection.title}
          </h3>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      href={href}
      onSelect={onSelect}
      collectionId={collection.id}
      className={`block shrink-0 w-[140px] transition-opacity duration-300 ${selectionClass}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        <CoverImage
          src={collection.squareImage ?? collection.heroImage}
          alt={collection.title}
          fallbackTitle={collection.title}
          fill
          className="rounded-xl"
          objectPosition="center"
          priority={priority}
          sizes="140px"
        />
      </div>
      <h3 className="mt-2 text-sm font-semibold leading-snug line-clamp-2">
        {collection.title}
      </h3>
      <p className="mt-0.5 text-xs text-muted line-clamp-1">{collection.category}</p>
    </CardWrapper>
  );
}
