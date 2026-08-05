import { AppShell } from "@/components/AppShell";
import { ChatView } from "@/components/ChatView";
import { getRelatedCollections } from "@/data/repositories";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function ChatPage({ params }: PageProps) {
  const { threadId } = await params;
  const relatedCollections = getRelatedCollections(4);

  return (
    <AppShell threadId={threadId} hideHeader>
      <ChatView threadId={threadId} relatedCollections={relatedCollections} />
    </AppShell>
  );
}
