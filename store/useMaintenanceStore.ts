import { create } from 'zustand';
import {
  getMaintenanceRecords,
  addMaintenanceRecord as addToDb,
  updateMaintenanceRecord as updateInDb,
  deleteMaintenanceRecord as deleteFromDb,
} from '@/lib/maintenance';
import { cacheCollection, getCachedCollection, CACHE_KEYS } from '@/lib/offlineCache';
import type { MaintenanceRecord } from '@/types';

interface MaintenanceStore {
  records: MaintenanceRecord[];
  isLoading: boolean;
  fetchRecords: (userId: string, vehicleId?: string) => Promise<void>;
  addRecord: (data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateRecord: (id: string, updates: Partial<Omit<MaintenanceRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  reset: () => void;
}

export const useMaintenanceStore = create<MaintenanceStore>((set) => ({
  records: [],
  isLoading: false,

  fetchRecords: async (userId, vehicleId) => {
    set({ isLoading: true });
    try {
      const records = await getMaintenanceRecords(userId, vehicleId);
      set({ records });
      await cacheCollection(CACHE_KEYS.maintenance, records);
    } catch {
      const cached = await getCachedCollection<MaintenanceRecord>(CACHE_KEYS.maintenance);
      if (cached) set({ records: cached });
    } finally {
      set({ isLoading: false });
    }
  },

  addRecord: async (data) => {
    const id = await addToDb(data);
    const now = Date.now();
    const newRecord: MaintenanceRecord = { ...data, id, createdAt: now, updatedAt: now };
    set((state) => ({ records: [newRecord, ...state.records] }));
    return id;
  },

  updateRecord: async (id, updates) => {
    await updateInDb(id, updates);
    const now = Date.now();
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: now } : r,
      ),
    }));
  },

  deleteRecord: async (id) => {
    await deleteFromDb(id);
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
  },

  reset: () => set({ records: [], isLoading: false }),
}));
