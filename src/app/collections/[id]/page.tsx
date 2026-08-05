import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CollectionDetail } from "@/components/CollectionDetail";
import { ImmersiveThemeProvider } from "@/contexts/immersive-theme";
import {
  getCollectionById,
  getWorksForCollection,
} from "@/data/repositories";
import { resolveDetailHeroImage } from "@/lib/resolve-public-image";

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
    <ImmersiveThemeProvider>
      <AppShell
        collectionId={collection.id}
        hideHeader
        immersive
      >
        <CollectionDetail
          collection={collection}
          works={works}
          detailHeroImage={resolveDetailHeroImage(collection)}
        />
      </AppShell>
    </ImmersiveThemeProvider>
  );
}
