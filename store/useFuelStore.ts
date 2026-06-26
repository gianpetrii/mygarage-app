import { create } from 'zustand';
import {
  getFuelEntries,
  addFuelEntry as addToDb,
  updateFuelEntry as updateInDb,
  deleteFuelEntry as deleteFromDb,
} from '@/lib/fuel';
import { cacheCollection, getCachedCollection, CACHE_KEYS } from '@/lib/offlineCache';
import type { FuelEntry } from '@/types';

interface FuelStore {
  entries: FuelEntry[];
  isLoading: boolean;
  fetchEntries: (userId: string, vehicleId?: string) => Promise<void>;
  addEntry: (data: Omit<FuelEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEntry: (id: string, updates: Partial<Omit<FuelEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  reset: () => void;
}

export const useFuelStore = create<FuelStore>((set) => ({
  entries: [],
  isLoading: false,

  fetchEntries: async (userId, vehicleId) => {
    set({ isLoading: true });
    try {
      const entries = await getFuelEntries(userId, vehicleId);
      set({ entries });
      await cacheCollection(CACHE_KEYS.fuel, entries);
    } catch {
      const cached = await getCachedCollection<FuelEntry>(CACHE_KEYS.fuel);
      if (cached) set({ entries: cached });
    } finally {
      set({ isLoading: false });
    }
  },

  addEntry: async (data) => {
    const id = await addToDb(data);
    const now = Date.now();
    const newEntry: FuelEntry = { ...data, id, createdAt: now, updatedAt: now };
    set((state) => ({ entries: [newEntry, ...state.entries] }));
    return id;
  },

  updateEntry: async (id, updates) => {
    await updateInDb(id, updates);
    const now = Date.now();
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: now } : e,
      ),
    }));
  },

  deleteEntry: async (id) => {
    await deleteFromDb(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },

  reset: () => set({ entries: [], isLoading: false }),
}));
