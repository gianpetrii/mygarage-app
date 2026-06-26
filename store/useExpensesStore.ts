import { create } from 'zustand';
import {
  getExpenses,
  addExpense as addToDb,
  updateExpense as updateInDb,
  deleteExpense as deleteFromDb,
} from '@/lib/expenses';
import { cacheCollection, getCachedCollection, CACHE_KEYS } from '@/lib/offlineCache';
import type { Expense } from '@/types';

interface ExpensesStore {
  expenses: Expense[];
  isLoading: boolean;
  fetchExpenses: (userId: string, vehicleId?: string) => Promise<void>;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  reset: () => void;
}

export const useExpensesStore = create<ExpensesStore>((set) => ({
  expenses: [],
  isLoading: false,

  fetchExpenses: async (userId, vehicleId) => {
    set({ isLoading: true });
    try {
      const expenses = await getExpenses(userId, vehicleId);
      set({ expenses });
      await cacheCollection(CACHE_KEYS.expenses, expenses);
    } catch {
      const cached = await getCachedCollection<Expense>(CACHE_KEYS.expenses);
      if (cached) set({ expenses: cached });
    } finally {
      set({ isLoading: false });
    }
  },

  addExpense: async (data) => {
    const id = await addToDb(data);
    const now = Date.now();
    const newExpense: Expense = { ...data, id, createdAt: now, updatedAt: now };
    set((state) => ({ expenses: [newExpense, ...state.expenses] }));
    return id;
  },

  updateExpense: async (id, updates) => {
    await updateInDb(id, updates);
    const now = Date.now();
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: now } : e,
      ),
    }));
  },

  deleteExpense: async (id) => {
    await deleteFromDb(id);
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
  },

  reset: () => set({ expenses: [], isLoading: false }),
}));
