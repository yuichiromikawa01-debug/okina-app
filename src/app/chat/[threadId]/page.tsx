import { ChatPageClient } from "@/components/ChatPageClient";
import { getRelatedCollections } from "@/data/repositories";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function ChatPage({ params }: PageProps) {
  const { threadId } = await params;
  const relatedCollections = getRelatedCollections(4);

  return (
    <ChatPageClient
      threadId={threadId}
      relatedCollections={relatedCollections}
    />
  );
}
