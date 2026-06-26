import { create } from 'zustand';
import {
  getVehicles,
  addVehicle as addVehicleToDb,
  updateVehicle as updateVehicleInDb,
  deleteVehicle as deleteVehicleFromDb,
} from '@/lib/vehicles';
import { cacheCollection, getCachedCollection, CACHE_KEYS } from '@/lib/offlineCache';
import type { Vehicle } from '@/types';

interface VehiclesStore {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  fetchVehicles: (userId: string) => Promise<void>;
  addVehicle: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVehicle: (id: string, updates: Partial<Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  reset: () => void;
}

export const useVehiclesStore = create<VehiclesStore>((set, get) => ({
  vehicles: [],
  selectedVehicle: null,
  isLoading: false,

  fetchVehicles: async (userId) => {
    set({ isLoading: true });
    try {
      const vehicles = await getVehicles(userId);
      set({ vehicles });
      await cacheCollection(CACHE_KEYS.vehicles, vehicles);
    } catch {
      const cached = await getCachedCollection<Vehicle>(CACHE_KEYS.vehicles);
      if (cached) set({ vehicles: cached });
    } finally {
      set({ isLoading: false });
    }
  },

  addVehicle: async (data) => {
    const id = await addVehicleToDb(data);
    const now = Date.now();
    const newVehicle: Vehicle = { ...data, id, createdAt: now, updatedAt: now };
    set((state) => ({ vehicles: [newVehicle, ...state.vehicles] }));
    return id;
  },

  updateVehicle: async (id, updates) => {
    await updateVehicleInDb(id, updates);
    const now = Date.now();
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, ...updates, updatedAt: now } : v,
      ),
      selectedVehicle:
        state.selectedVehicle?.id === id
          ? { ...state.selectedVehicle, ...updates, updatedAt: now }
          : state.selectedVehicle,
    }));
  },

  deleteVehicle: async (id) => {
    await deleteVehicleFromDb(id);
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
      selectedVehicle: state.selectedVehicle?.id === id ? null : state.selectedVehicle,
    }));
  },

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  reset: () => set({ vehicles: [], selectedVehicle: null, isLoading: false }),
}));
