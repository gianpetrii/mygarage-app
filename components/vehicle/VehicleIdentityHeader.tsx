import * as React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { VehicleSwitcher } from '@/components/vehicle/VehicleSwitcher';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { formatGroupedInteger } from '@/lib/numberFormat';
import type { Vehicle } from '@/types';

interface VehicleIdentityHeaderProps {
  vehicle?: Vehicle | null;
}

function VehicleIdentityHeader({ vehicle: vehicleProp }: VehicleIdentityHeaderProps) {
  const { vehicles, activeVehicle } = useActiveVehicle();
  const vehicle = vehicleProp ?? activeVehicle;

  if (!vehicle) return null;

  if (vehicles.length > 1) {
    return <VehicleSwitcher className="mb-1" />;
  }

  const subtitle = [
    vehicle.year,
    `${formatGroupedInteger(vehicle.mileage)} km`,
    vehicle.licensePlate,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={() => router.push(`/(app)/vehicles/${vehicle.id}`)}
      className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`${vehicle.make} ${vehicle.model}, ver detalle`}
    >
      <View className="flex-1 gap-0.5">
        <Text className="text-lg font-bold text-foreground">
          {vehicle.make} {vehicle.model}
        </Text>
        <Text variant="muted" className="text-sm">
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={20} color="#71717a" />
    </Pressable>
  );
}

export { VehicleIdentityHeader };
