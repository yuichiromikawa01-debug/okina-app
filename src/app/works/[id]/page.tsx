import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { WorkDetail } from "@/components/WorkDetail";
import { ImmersiveThemeProvider } from "@/contexts/immersive-theme";
import {
  getWorkById,
  getCollectionById,
} from "@/data/repositories";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkPage({ params }: PageProps) {
  const { id } = await params;
  const work = getWorkById(id);

  if (!work) {
    notFound();
  }

  const collection = getCollectionById(work.collectionId);
  if (!collection) {
    notFound();
  }

  return (
    <ImmersiveThemeProvider>
      <AppShell
        workId={work.id}
        collectionId={work.collectionId}
        hideHeader
        immersive
      >
        <WorkDetail work={work} collection={collection} />
      </AppShell>
    </ImmersiveThemeProvider>
  );
}
