import { create } from 'zustand';
import { FirebaseError } from 'firebase/app';
import {
  getReminders,
  addReminder as addToDb,
  updateReminder as updateInDb,
  deleteReminder as deleteFromDb,
  completeReminder as completeInDb,
} from '@/lib/reminders';
import {
  cacheCollection,
  clearCachedCollection,
  CACHE_KEYS,
} from '@/lib/offlineCache';
import { recalculateAfterComplete } from '@/lib/reminderUtils';
import {
  rescheduleReminderNotification,
  cancelNotificationsForReminder,
  syncAllReminderNotifications,
} from '@/lib/reminderScheduling';
import { buildMaintenanceFromReminderComplete, type ReminderCompleteExtras } from '@/lib/reminderCompletion';
import { areReminderNotificationsEnabled } from '@/lib/notificationPreferences';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import type { ServiceReminder } from '@/types';

function areRemindersEnabledForCurrentUser(): boolean {
  const { useAuthStore } = require('@/store/useAuthStore') as typeof import('./useAuthStore');
  return areReminderNotificationsEnabled(
    useAuthStore.getState().user?.preferences?.notifications,
  );
}

interface RemindersStore {
  reminders: ServiceReminder[];
  isLoading: boolean;
  fetchReminders: (userId: string, vehicleId?: string) => Promise<void>;
  addReminder: (data: Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateReminder: (id: string, updates: Partial<Omit<ServiceReminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  completeReminder: (
    id: string,
    completedDate: number,
    completedMileage: number,
    extras?: ReminderCompleteExtras,
  ) => Promise<void>;
  reset: () => void;
}

async function syncRemindersCache(reminders: ServiceReminder[]) {
  await cacheCollection(CACHE_KEYS.reminders, reminders);
}

function removeReminderFromState(
  set: (partial: Partial<{ reminders: ServiceReminder[] }>) => void,
  get: () => { reminders: ServiceReminder[] },
  id: string,
) {
  const reminders = get().reminders.filter((r) => r.id !== id);
  set({ reminders });
  void syncRemindersCache(reminders);
}

export const useRemindersStore = create<RemindersStore>((set, get) => ({
  reminders: [],
  isLoading: false,

  fetchReminders: async (userId) => {
    set({ isLoading: true });
    try {
      const reminders = await getReminders(userId);
      set({ reminders });
      await syncRemindersCache(reminders);
      void syncAllReminderNotifications(reminders, areRemindersEnabledForCurrentUser());
    } catch {
      // Firestore es la fuente de verdad: no rehidratar caché local (evita fantasmas).
    } finally {
      set({ isLoading: false });
    }
  },

  addReminder: async (data) => {
    const id = await addToDb(data);
    const now = Date.now();
    const newReminder: ServiceReminder = { ...data, id, createdAt: now, updatedAt: now };
    const reminders = [newReminder, ...get().reminders];
    set({ reminders });
    await syncRemindersCache(reminders);
    void rescheduleReminderNotification(newReminder, areRemindersEnabledForCurrentUser());
    return id;
  },

  updateReminder: async (id, updates) => {
    try {
      await updateInDb(id, updates);
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'not-found') {
        removeReminderFromState(set, get, id);
        return;
      }
      throw error;
    }
    const now = Date.now();
    const reminders = get().reminders.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: now } : r,
    );
    set({ reminders });
    await syncRemindersCache(reminders);
    const updated = reminders.find((r) => r.id === id);
    if (updated) void rescheduleReminderNotification(updated, areRemindersEnabledForCurrentUser());
  },

  deleteReminder: async (id) => {
    const trimmedId = id.trim();
    await cancelNotificationsForReminder(trimmedId);
    await deleteFromDb(trimmedId);
    removeReminderFromState(set, get, trimmedId);
  },

  completeReminder: async (id, completedDate, completedMileage, extras) => {
    const reminder = get().reminders.find((r) => r.id === id);
    if (!reminder) return;

    const updates = recalculateAfterComplete(reminder, completedDate, completedMileage);
    try {
      await completeInDb(id, updates);
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'not-found') {
        removeReminderFromState(set, get, id);
        return;
      }
      throw error;
    }
    const now = Date.now();
    const updatedReminder: ServiceReminder = { ...reminder, ...updates, updatedAt: now };

    void rescheduleReminderNotification(updatedReminder, areRemindersEnabledForCurrentUser());

    const reminders = get().reminders.map((r) => (r.id === id ? updatedReminder : r));
    set({ reminders });
    await syncRemindersCache(reminders);

    try {
      const maintenanceData = buildMaintenanceFromReminderComplete(
        reminder,
        completedDate,
        completedMileage,
        extras,
      );
      await useMaintenanceStore.getState().addRecord(maintenanceData);
    } catch {
      // El recordatorio quedó completado aunque falle el registro en historial.
    }
  },

  reset: () => {
    set({ reminders: [], isLoading: false });
    void clearCachedCollection(CACHE_KEYS.reminders);
  },
}));
