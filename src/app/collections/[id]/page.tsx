import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CollectionDetail } from "@/components/CollectionDetail";
import {
  getCollectionById,
  getWorksForCollection,
} from "@/data/repositories";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CollectionPage({ params }: PageProps) {
  const { id } = await params;
  const collection = getCollectionById(id);

  if (!collection) {
    notFound();
  }

  const works = getWorksForCollection(id);

  return (
    <AppShell collectionId={collection.id} hideHeader>
      <CollectionDetail collection={collection} works={works} />
    </AppShell>
  );
}
