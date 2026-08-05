export type InlineWorkEmbed = {
  afterParagraph: number;
  workId: string;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  essay: string;
  heroImage: string;
  squareImage?: string;
  detailImage?: string;
  workIds: string[];
  inlineWorks?: InlineWorkEmbed[];
};

export type Work = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: string;
  collectionId: string;
  description: string;
};

export type Citation = {
  workId: string;
  excerpt: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  createdAt: string;
};

export type Thread = {
  id: string;
  title: string;
  collectionId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export type AskPayload = {
  message: string;
  threadId: string;
};
