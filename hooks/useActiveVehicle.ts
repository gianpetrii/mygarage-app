import * as React from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import type { Vehicle } from '@/types';

export function useActiveVehicle() {
  const { vehicles, selectedVehicle, setSelectedVehicle, fetchVehicles, isLoading } =
    useVehiclesStore();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (vehicles.length === 0) {
        if (!cancelled) {
          setSelectedVehicle(null);
          await storage.remove(STORAGE_KEYS.ACTIVE_VEHICLE_ID);
          setIsReady(true);
        }
        return;
      }

      const savedId = await storage.get<string>(STORAGE_KEYS.ACTIVE_VEHICLE_ID);
      if (cancelled) return;

      const found = savedId ? vehicles.find((v) => v.id === savedId) : undefined;
      const next = found ?? vehicles[0];

      setSelectedVehicle(next);
      if (next.id !== savedId) {
        await storage.set(STORAGE_KEYS.ACTIVE_VEHICLE_ID, next.id);
      }
      setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [vehicles, setSelectedVehicle]);

  const setActiveVehicle = React.useCallback(
    async (vehicle: Vehicle | null) => {
      setSelectedVehicle(vehicle);
      if (vehicle) {
        await storage.set(STORAGE_KEYS.ACTIVE_VEHICLE_ID, vehicle.id);
      } else {
        await storage.remove(STORAGE_KEYS.ACTIVE_VEHICLE_ID);
      }
    },
    [setSelectedVehicle],
  );

  return {
    vehicles,
    activeVehicle: selectedVehicle,
    setActiveVehicle,
    fetchVehicles,
    isLoading,
    isReady,
  };
}
