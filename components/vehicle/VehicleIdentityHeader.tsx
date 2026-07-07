import * as React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { KeyboardSheet } from '@/components/layout/KeyboardSheet';
import { AddVehicleCard, VehicleSummaryCard } from '@/components/vehicle/VehicleSummaryCard';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types';

interface VehicleIdentityHeaderProps {
  vehicle?: Vehicle | null;
  className?: string;
}

function VehicleIdentityHeader({ vehicle: vehicleProp, className }: VehicleIdentityHeaderProps) {
  const { vehicles, activeVehicle, setActiveVehicle } = useActiveVehicle();
  const vehicle = vehicleProp ?? activeVehicle;
  const [sheetOpen, setSheetOpen] = React.useState(false);

  if (!vehicle) return null;

  const multi = vehicles.length > 1;

  const goDetail = () => {
    router.push(`/(app)/vehicles/${vehicle.id}`);
  };

  const selectVehicle = async (v: Vehicle) => {
    await setActiveVehicle(v);
    setSheetOpen(false);
  };

  return (
    <View className={cn('gap-2', className)}>
      <VehicleSummaryCard vehicle={vehicle} showPhoto onPress={goDetail} showChevron />

      {multi ? (
        <Pressable
          onPress={() => setSheetOpen(true)}
          className="flex-row items-center justify-center gap-1 py-1 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Cambiar vehículo"
        >
          <Text className="text-sm font-medium text-primary">
            Cambiar vehículo
          </Text>
          <Text variant="muted" className="text-sm">
            · {vehicles.length} en total
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push('/(app)/vehicles/new')}
          className="self-center py-1 active:opacity-70"
        >
          <Text className="text-sm font-medium text-primary">+ Agregar otro vehículo</Text>
        </Pressable>
      )}

      <KeyboardSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text variant="h3" className="mb-1">
          Elegí un vehículo
        </Text>
        <Text variant="muted" className="text-sm mb-4">
          El tablero muestra datos del auto seleccionado
        </Text>

        <View className="gap-2">
          {vehicles.map((v) => (
            <VehicleSummaryCard
              key={v.id}
              vehicle={v}
              showPhoto
              showActiveBadge
              showChevron={false}
              isActive={v.id === vehicle.id}
              onPress={() => selectVehicle(v)}
            />
          ))}
          <AddVehicleCard
            onPress={() => {
              setSheetOpen(false);
              router.push('/(app)/vehicles/new');
            }}
          />
        </View>

        <Pressable
          onPress={() => {
            setSheetOpen(false);
            router.push('/(app)/vehicles');
          }}
          className="flex-row items-center justify-center gap-1 mt-4 py-2 active:opacity-70"
        >
          <Text className="text-sm font-medium text-primary">Gestionar vehículos</Text>
          <ChevronRight size={16} color="#18181b" />
        </Pressable>
      </KeyboardSheet>
    </View>
  );
}

export { VehicleIdentityHeader };
