import { storage } from './storage';

const QUEUE_KEY = 'offline_write_queue';

export interface OfflineWrite {
  id: string;
  collection: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: number;
}

export async function enqueueWrite(write: Omit<OfflineWrite, 'id' | 'createdAt'>): Promise<void> {
  const queue = (await storage.get<OfflineWrite[]>(QUEUE_KEY)) ?? [];
  queue.push({
    ...write,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  });
  await storage.set(QUEUE_KEY, queue);
}

export async function getWriteQueue(): Promise<OfflineWrite[]> {
  return (await storage.get<OfflineWrite[]>(QUEUE_KEY)) ?? [];
}

export async function clearWriteQueue(): Promise<void> {
  await storage.remove(QUEUE_KEY);
}
