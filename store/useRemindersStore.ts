import { create } from 'zustand';
import {
  getReminders,
  addReminder as addToDb,
  updateReminder as updateInDb,
  deleteReminder as deleteFromDb,
  completeReminder as completeInDb,
} from '@/lib/reminders';
import { cacheCollection, getCachedCollection, CACHE_KEYS } from '@/lib/offlineCache';
import type { ServiceReminder } from '@/types';

interface RemindersStore {
  reminders: ServiceReminder[];
  isLoading: boolean;
  fetchReminders: (userId: string, vehicleId?: string) => Promise<void>;
  addReminder: (data: Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateReminder: (id: string, updates: Partial<Omit<ServiceReminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  completeReminder: (id: string, completedDate: number, completedMileage: number) => Promise<void>;
  reset: () => void;
}

export const useRemindersStore = create<RemindersStore>((set) => ({
  reminders: [],
  isLoading: false,

  fetchReminders: async (userId, vehicleId) => {
    set({ isLoading: true });
    try {
      const reminders = await getReminders(userId, vehicleId);
      set({ reminders });
      await cacheCollection(CACHE_KEYS.reminders, reminders);
    } catch {
      const cached = await getCachedCollection<ServiceReminder>(CACHE_KEYS.reminders);
      if (cached) set({ reminders: cached });
    } finally {
      set({ isLoading: false });
    }
  },

  addReminder: async (data) => {
    const id = await addToDb(data);
    const now = Date.now();
    const newReminder: ServiceReminder = { ...data, id, createdAt: now, updatedAt: now };
    set((state) => ({ reminders: [newReminder, ...state.reminders] }));
    return id;
  },

  updateReminder: async (id, updates) => {
    await updateInDb(id, updates);
    const now = Date.now();
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: now } : r,
      ),
    }));
  },

  deleteReminder: async (id) => {
    await deleteFromDb(id);
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
  },

  completeReminder: async (id, completedDate, completedMileage) => {
    await completeInDb(id, completedDate, completedMileage);
    const now = Date.now();
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id
          ? {
              ...r,
              isCompleted: true,
              lastCompletedDate: completedDate,
              lastCompletedMileage: completedMileage,
              updatedAt: now,
            }
          : r,
      ),
    }));
  },

  reset: () => set({ reminders: [], isLoading: false }),
}));
