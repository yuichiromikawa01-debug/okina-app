import type { Thread } from "@/domain/types";
import { generateMockReply, generateThreadTitle } from "@/lib/chat-mock";

const STORAGE_KEY = "okina-threads";

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
  citations?: Thread["messages"][0]["citations"]
): Thread | undefined {
  const threads = readThreads();
  const index = threads.findIndex((t) => t.id === threadId);
  if (index === -1) return undefined;

  const message = {
    id: crypto.randomUUID(),
    role,
    content,
    citations,
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

export function sendMessage(threadId: string, content: string): Thread | undefined {
  const trimmed = content.trim();
  if (!trimmed) return undefined;

  addMessageToThread(threadId, "user", trimmed);
  const thread = getThreadById(threadId);
  if (!thread) return undefined;

  const reply = generateMockReply(trimmed, thread);
  const result = addMessageToThread(threadId, "assistant", reply.content, reply.citations);
  notifyThreadsChanged();
  return result;
}

export function startChat(message: string, collectionId?: string): Thread {
  const thread = createThread(collectionId, message);
  sendMessage(thread.id, message);
  notifyThreadsChanged();
  return getThreadById(thread.id)!;
}

function notifyThreadsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("okina-threads-changed"));
  }
}
