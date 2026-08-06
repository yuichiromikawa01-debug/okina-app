"use client";

import { useState } from "react";
import type { Collection } from "@/domain/types";
import { AppShell } from "@/components/AppShell";
import { ChatView } from "@/components/ChatView";

type ChatPageClientProps = {
  threadId: string;
  relatedCollections: Collection[];
};

export function ChatPageClient({
  threadId,
  relatedCollections,
}: ChatPageClientProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <AppShell threadId={threadId} hideHeader showComposer={!previewOpen}>
      <ChatView
        key={threadId}
        threadId={threadId}
        relatedCollections={relatedCollections}
        onPreviewOpenChange={setPreviewOpen}
      />
    </AppShell>
  );
}
