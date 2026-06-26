import * as React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, ChevronDown } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { formatGroupedInteger } from '@/lib/numberFormat';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types';

interface VehicleIdentityHeaderProps {
  vehicle?: Vehicle | null;
  className?: string;
}

function VehicleIdentityHeader({ vehicle: vehicleProp, className }: VehicleIdentityHeaderProps) {
  const { vehicles, activeVehicle, setActiveVehicle } = useActiveVehicle();
  const vehicle = vehicleProp ?? activeVehicle;
  const [open, setOpen] = React.useState(false);

  if (!vehicle) return null;

  const multi = vehicles.length > 1;
  const subtitle = [
    vehicle.year,
    `${formatGroupedInteger(vehicle.mileage)} km`,
    vehicle.licensePlate,
  ]
    .filter(Boolean)
    .join(' · ');

  const goDetail = () => {
    setOpen(false);
    router.push(`/(app)/vehicles/${vehicle.id}`);
  };

  const selectVehicle = async (v: Vehicle) => {
    await setActiveVehicle(v);
    setOpen(false);
  };

  return (
    <View className={cn('relative z-20', className)}>
      <View className="flex-row items-center rounded-2xl border border-border bg-card pl-4 pr-2 py-3">
        <Pressable
          onPress={goDetail}
          className="flex-1 gap-0.5 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={`${vehicle.make} ${vehicle.model}, ver detalle`}
        >
          <Text className="text-lg font-bold text-foreground">
            {vehicle.make} {vehicle.model}
          </Text>
          <Text variant="muted" className="text-sm">
            {subtitle}
          </Text>
        </Pressable>

        {multi ? (
          <Pressable
            onPress={() => setOpen((v) => !v)}
            className="h-10 w-10 items-center justify-center rounded-lg bg-muted active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Cambiar vehículo"
          >
            <ChevronDown size={20} color="#71717a" />
          </Pressable>
        ) : (
          <Pressable
            onPress={goDetail}
            className="h-10 w-10 items-center justify-center active:opacity-80"
            accessibilityLabel="Ver detalle del vehículo"
          >
            <ChevronRight size={20} color="#71717a" />
          </Pressable>
        )}
      </View>

      {open && multi && (
        <View className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-30">
            {vehicles.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => selectVehicle(v)}
                className={cn(
                  'px-4 py-3 border-b border-border last:border-b-0 active:opacity-80',
                  v.id === vehicle.id && 'bg-primary/5',
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-medium',
                    v.id === vehicle.id ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {v.make} {v.model} ({v.year})
                </Text>
                <Text variant="muted" className="text-xs mt-0.5">
                  {formatGroupedInteger(v.mileage)} km
                  {v.licensePlate ? ` · ${v.licensePlate}` : ''}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setOpen(false);
                router.push('/(app)/vehicles/new');
              }}
              className="px-4 py-3 bg-muted/50 active:opacity-80"
            >
              <Text className="text-sm font-medium text-primary">+ Agregar vehículo</Text>
            </Pressable>
        </View>
      )}
    </View>
  );
}

export { VehicleIdentityHeader };
