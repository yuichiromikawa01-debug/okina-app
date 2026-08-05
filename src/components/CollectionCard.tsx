import Link from "next/link";
import type { Collection } from "@/domain/types";
import { CoverImage } from "./CoverImage";

type CollectionCardProps = {
  collection: Collection;
  variant?: "hero" | "square" | "row";
  priority?: boolean;
};

export function CollectionCard({
  collection,
  variant = "square",
  priority,
}: CollectionCardProps) {
  const href = `/collections/${collection.id}`;

  if (variant === "hero") {
    return (
      <Link
        href={href}
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
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link href={href} className="flex gap-3 rounded-xl p-2 hover:bg-black/4">
        <CoverImage
          src={collection.squareImage ?? collection.heroImage}
          alt={collection.title}
          fallbackTitle={collection.title}
          aspectRatio="aspect-square"
          className="h-16 w-16 shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-xs text-muted">{collection.category}</p>
          <h3 className="font-semibold leading-snug">{collection.title}</h3>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="block shrink-0 w-[140px]">
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
    </Link>
  );
}
