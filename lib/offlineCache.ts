import { storage } from './storage';

const CACHE_PREFIX = 'offline_cache_';

export async function cacheCollection<T>(key: string, data: T[]): Promise<void> {
  await storage.set(`${CACHE_PREFIX}${key}`, { data, cachedAt: Date.now() });
}

export async function getCachedCollection<T>(key: string): Promise<T[] | null> {
  const cached = await storage.get<{ data: T[]; cachedAt: number }>(`${CACHE_PREFIX}${key}`);
  return cached?.data ?? null;
}

export const CACHE_KEYS = {
  vehicles: 'vehicles',
  maintenance: 'maintenance',
  fuel: 'fuel',
  expenses: 'expenses',
  reminders: 'reminders',
} as const;
