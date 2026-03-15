import api from "./api";
import { getCache, saveCache } from "../utils/storage";

const SYNC_QUEUE_KEY = "sync_queue_v1";

type SyncMethod = "POST" | "PATCH" | "PUT" | "DELETE";

export type SyncQueueItem = {
  id: string;
  method: SyncMethod;
  url: string;
  data?: unknown;
  createdAt: string;
  retryCount: number;
  lastError?: string;
};

let processing = false;

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  return (await getCache<SyncQueueItem[]>(SYNC_QUEUE_KEY)) || [];
};

const saveQueue = async (queue: SyncQueueItem[]) => {
  await saveCache(SYNC_QUEUE_KEY, queue);
};

export const enqueueSyncRequest = async (payload: Omit<SyncQueueItem, "id" | "createdAt" | "retryCount">) => {
  const queue = await getSyncQueue();
  queue.push({
    id: makeId(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
    ...payload,
  });
  await saveQueue(queue);
  return queue.length;
};

const shouldKeepForRetry = (err: any) => {
  const status = err?.response?.status;
  if (!status) return true;
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
};

export const isServerReachable = async () => {
  try {
    await api.get("/health", { timeout: 4000 });
    return true;
  } catch {
    return false;
  }
};

export const processSyncQueue = async () => {
  if (processing) return { processed: 0, remaining: (await getSyncQueue()).length };

  processing = true;
  try {
    const reachable = await isServerReachable();
    if (!reachable) {
      const pending = await getSyncQueue();
      return { processed: 0, remaining: pending.length };
    }

    let queue = await getSyncQueue();
    let processed = 0;

    for (const item of [...queue]) {
      try {
        await api.request({
          method: item.method,
          url: item.url,
          data: item.data,
        });

        queue = queue.filter((q) => q.id !== item.id);
        processed += 1;
        await saveQueue(queue);
      } catch (err: any) {
        if (shouldKeepForRetry(err)) {
          queue = queue.map((q) =>
            q.id === item.id
              ? { ...q, retryCount: q.retryCount + 1, lastError: err?.message || "Request failed" }
              : q
          );
          await saveQueue(queue);
          break;
        }

        // Non-retriable client errors are dropped from queue to avoid deadlock.
        queue = queue.filter((q) => q.id !== item.id);
        await saveQueue(queue);
      }
    }

    return { processed, remaining: queue.length };
  } finally {
    processing = false;
  }
};
