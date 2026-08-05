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
        className="snap-item block w-[78%] shrink-0 first:pl-5 last:pr-5"
      >
        <CoverImage
          src={collection.heroImage}
          alt={collection.title}
          fallbackTitle={collection.title}
          aspectRatio="aspect-[3/4]"
          className="w-full rounded-2xl shadow-lg shadow-black/10"
          objectPosition="center top"
          priority={priority}
          sizes="78vw"
        />
        <div className="mt-3 px-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {collection.category}
          </p>
          <h3 className="mt-0.5 text-lg font-semibold leading-tight">
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
      <CoverImage
        src={collection.squareImage ?? collection.heroImage}
        alt={collection.title}
        fallbackTitle={collection.title}
        aspectRatio="aspect-square"
        className="w-full rounded-xl"
        objectPosition="center"
        priority={priority}
        sizes="140px"
      />
      <h3 className="mt-2 text-sm font-semibold leading-snug line-clamp-2">
        {collection.title}
      </h3>
      <p className="mt-0.5 text-xs text-muted line-clamp-1">{collection.category}</p>
    </Link>
  );
}
