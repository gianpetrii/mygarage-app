import * as React from 'react';
import {
  openVehicleManual,
  resolveVehicleManual,
  type ResolvedVehicleManual,
} from '@/lib/vehicleManuals';
import type { Vehicle } from '@/types';

export function useVehicleManual(vehicle: Vehicle | null | undefined) {
  const [manualResolved, setManualResolved] = React.useState<ResolvedVehicleManual | null>(null);
  const [manualLoading, setManualLoading] = React.useState(false);

  React.useEffect(() => {
    if (!vehicle) {
      setManualResolved(null);
      setManualLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setManualLoading(true);
      try {
        const resolved = await resolveVehicleManual(
          vehicle.make,
          vehicle.model,
          vehicle.year,
        );
        if (!cancelled) setManualResolved(resolved);
      } finally {
        if (!cancelled) setManualLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [vehicle?.make, vehicle?.model, vehicle?.year]);

  const openManual = React.useCallback(async () => {
    if (!vehicle) return;
    await openVehicleManual(vehicle.make, vehicle.model, vehicle.year);
  }, [vehicle]);

  return { manualResolved, manualLoading, openManual };
}
