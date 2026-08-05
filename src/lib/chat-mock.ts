import type { Citation, Message, Thread, Work } from "@/domain/types";
import {
  getCollectionById,
  getRelatedCollections,
  getWorksForCollection,
} from "@/data/repositories";

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildCitation(work: Work): Citation {
  const excerpts = [
    `${work.title}より——「${work.description.slice(0, 40)}...」`,
    `『${work.title}』の一節：「${work.author}は、日常の中に学びを見出す視点を示している。」`,
    `引用：${work.title}（${work.author}）——「このテーマは、現代の読者にとって特に響く。」`,
  ];
  return {
    workId: work.id,
    excerpt: pickRandom(excerpts),
  };
}

function buildCollectionReply(
  userMessage: string,
  works: Work[],
  collectionTitle: string
): string {
  const cited = works.slice(0, Math.min(2, works.length));
  const intros = [
    `「${collectionTitle}」の文脈で考えると、`,
    `あなたの質問は核心を突いています。`,
    `このコレクションの本たちは、まさにその問いに応えるように選ばれています。`,
  ];
  const bodies = [
    `失恋直後は、答えを急がないことが大切です。言葉に預ける時間を、自分に許してください。`,
    `ワインは知識よりも、五感を開く体験から始まります。まずは一本、ゆっくりと。`,
    `組織の成功は、現場の小さな改善の積み重ねから生まれます。`,
    `大谷翔平の思考は、「昨日より少し」という積み上げに集約されます。`,
    `20代は実験の時期。正解より、試した回数が輪郭をつくります。`,
  ];
  return `${pickRandom(intros)}${pickRandom(bodies)}\n\nあなたが書いた「${userMessage.slice(0, 30)}${userMessage.length > 30 ? "..." : ""}」について、${cited.map((w) => `『${w.title}』`).join("と")}が参考になるはずです。`;
}

function buildGeneralReply(userMessage: string): string {
  const related = getRelatedCollections(2);
  const names = related.map((c) => c.title).join("、");
  return `ご質問ありがとうございます。「${userMessage.slice(0, 40)}${userMessage.length > 40 ? "..." : ""}」について、まずは関連するコレクション——${names}——から探すのがおすすめです。気になるテーマを選んで、さらに深く話しましょう。`;
}

export function generateMockReply(
  userMessage: string,
  thread: Thread
): Message {
  const works = thread.collectionId
    ? getWorksForCollection(thread.collectionId)
    : [];
  const collection = thread.collectionId
    ? getCollectionById(thread.collectionId)
    : undefined;

  const content = collection
    ? buildCollectionReply(userMessage, works, collection.title)
    : buildGeneralReply(userMessage);

  const citations: Citation[] = works.length
    ? works.slice(0, 2).map(buildCitation)
    : [];

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    citations: citations.length ? citations : undefined,
    createdAt: new Date().toISOString(),
  };
}

export function generateThreadTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  if (trimmed.length <= 28) return trimmed;
  return `${trimmed.slice(0, 28)}...`;
}
