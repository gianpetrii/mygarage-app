import { router } from 'expo-router';
import { guardAddVehicle } from '@/lib/quota';
import { useVehiclesStore } from '@/store/useVehiclesStore';

/** Navega a alta de vehículo solo si no se superó el cupo de la cuenta. */
export function useAddVehicleNavigation() {
  const vehicleCount = useVehiclesStore((s) => s.vehicles.length);

  return () => {
    if (guardAddVehicle(vehicleCount)) {
      router.push('/(app)/vehicles/new');
    }
  };
}
