import type { Thread } from "@/domain/types";
import {
  generateCollectionSelectReply,
  generateMockReply,
  generateThreadTitle,
} from "@/lib/chat-mock";

const STORAGE_KEY = "okina-threads";
const thinkingThreads = new Set<string>();

function thinkDelay(): Promise<void> {
  const ms = 1200 + Math.random() * 600;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isThreadThinking(threadId: string): boolean {
  return thinkingThreads.has(threadId);
}

function setThreadThinking(threadId: string, thinking: boolean): void {
  if (thinking) {
    thinkingThreads.add(threadId);
  } else {
    thinkingThreads.delete(threadId);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("okina-thinking-changed", { detail: { threadId } })
    );
  }
}

function readThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Thread[]) : [];
  } catch {
    return [];
  }
}

function writeThreads(threads: Thread[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function getThreads(): Thread[] {
  return readThreads().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getThreadById(id: string): Thread | undefined {
  return readThreads().find((t) => t.id === id);
}

export function createThread(collectionId?: string, initialMessage?: string): Thread {
  const now = new Date().toISOString();
  const thread: Thread = {
    id: crypto.randomUUID(),
    title: initialMessage ? generateThreadTitle(initialMessage) : "新しい会話",
    collectionId,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  const threads = readThreads();
  threads.push(thread);
  writeThreads(threads);
  return thread;
}

export function addMessageToThread(
  threadId: string,
  role: "user" | "assistant",
  content: string,
  citations?: Thread["messages"][0]["citations"],
  blocks?: Thread["messages"][0]["blocks"]
): Thread | undefined {
  const threads = readThreads();
  const index = threads.findIndex((t) => t.id === threadId);
  if (index === -1) return undefined;

  const message = {
    id: crypto.randomUUID(),
    role,
    content,
    citations,
    blocks,
    createdAt: new Date().toISOString(),
  };

  const thread = { ...threads[index] };
  thread.messages = [...thread.messages, message];
  thread.updatedAt = message.createdAt;
  if (role === "user" && thread.title === "新しい会話") {
    thread.title = generateThreadTitle(content);
  }
  threads[index] = thread;
  writeThreads(threads);
  return thread;
}

export function setThreadCollection(
  threadId: string,
  collectionId: string
): Thread | undefined {
  const threads = readThreads();
  const index = threads.findIndex((t) => t.id === threadId);
  if (index === -1) return undefined;

  const thread = {
    ...threads[index],
    collectionId,
    updatedAt: new Date().toISOString(),
  };
  threads[index] = thread;
  writeThreads(threads);
  notifyThreadsChanged();
  return thread;
}

export function clearThreadCollection(threadId: string): Thread | undefined {
  const threads = readThreads();
  const index = threads.findIndex((t) => t.id === threadId);
  if (index === -1) return undefined;

  const thread = { ...threads[index] };
  delete thread.collectionId;
  thread.updatedAt = new Date().toISOString();
  threads[index] = thread;
  writeThreads(threads);
  notifyThreadsChanged();
  return thread;
}

export async function sendMessage(
  threadId: string,
  content: string
): Promise<Thread | undefined> {
  const trimmed = content.trim();
  if (!trimmed) return undefined;

  addMessageToThread(threadId, "user", trimmed);
  notifyThreadsChanged();

  const thread = getThreadById(threadId);
  if (!thread) return undefined;

  setThreadThinking(threadId, true);
  await thinkDelay();

  const current = getThreadById(threadId);
  if (!current) {
    setThreadThinking(threadId, false);
    return undefined;
  }

  const reply = generateMockReply(trimmed, current);
  const result = addMessageToThread(
    threadId,
    "assistant",
    reply.content,
    reply.citations,
    reply.blocks
  );
  setThreadThinking(threadId, false);
  notifyThreadsChanged();
  return result;
}

export async function selectCollectionWithReply(
  threadId: string,
  collectionId: string
): Promise<Thread | undefined> {
  const thread = getThreadById(threadId);
  if (!thread) return undefined;

  const firstUserMessage = thread.messages.find((m) => m.role === "user");
  setThreadCollection(threadId, collectionId);

  if (!firstUserMessage) {
    notifyThreadsChanged();
    return getThreadById(threadId);
  }

  setThreadThinking(threadId, true);
  await thinkDelay();

  const reply = generateCollectionSelectReply(
    firstUserMessage.content,
    collectionId
  );
  const result = addMessageToThread(
    threadId,
    "assistant",
    reply.content,
    reply.citations,
    reply.blocks
  );
  setThreadThinking(threadId, false);
  notifyThreadsChanged();
  return result;
}

export function startChat(message: string, collectionId?: string): Thread {
  const thread = createThread(collectionId, message);
  notifyThreadsChanged();
  void sendMessage(thread.id, message);
  return thread;
}

function notifyThreadsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("okina-threads-changed"));
  }
}
