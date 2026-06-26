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
      const savedId = await storage.get<string>(STORAGE_KEYS.ACTIVE_VEHICLE_ID);
      if (cancelled) return;

      if (savedId) {
        const found = vehicles.find((v) => v.id === savedId);
        if (found) {
          setSelectedVehicle(found);
        } else if (vehicles.length === 1) {
          setSelectedVehicle(vehicles[0]);
          await storage.set(STORAGE_KEYS.ACTIVE_VEHICLE_ID, vehicles[0].id);
        } else {
          setSelectedVehicle(null);
        }
      } else if (vehicles.length === 1) {
        setSelectedVehicle(vehicles[0]);
        await storage.set(STORAGE_KEYS.ACTIVE_VEHICLE_ID, vehicles[0].id);
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
