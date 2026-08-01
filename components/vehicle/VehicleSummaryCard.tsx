import * as React from 'react';
import { View, Pressable, Image } from 'react-native';
import { ChevronRight, Car } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { formatGroupedInteger } from '@/lib/numberFormat';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types';

interface VehicleSummaryCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  isActive?: boolean;
  showPhoto?: boolean;
  showActiveBadge?: boolean;
  showChevron?: boolean;
  className?: string;
}

function VehicleSummaryCard({
  vehicle,
  onPress,
  isActive = false,
  showPhoto = false,
  showActiveBadge = false,
  showChevron = true,
  className,
}: VehicleSummaryCardProps) {
  const subtitle = [
    vehicle.year,
    `${formatGroupedInteger(vehicle.mileage)} km`,
    vehicle.licensePlate,
  ]
    .filter(Boolean)
    .join(' · ');

  const photo = vehicle.photos?.[0];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        'flex-row items-center rounded-2xl border bg-card px-4 py-3 gap-3 active:opacity-80',
        isActive ? 'border-primary bg-primary/5' : 'border-border',
        className,
      )}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${vehicle.make} ${vehicle.model}`}
    >
      {showPhoto && (
        photo ? (
          <Image source={{ uri: photo }} className="h-14 w-14 rounded-lg bg-muted" resizeMode="cover" />
        ) : (
          <View className="h-14 w-14 items-center justify-center rounded-lg bg-muted">
            <Car size={28} color="#71717a" />
          </View>
        )
      )}

      <View className="flex-1 gap-0.5 justify-center">
        <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
          {vehicle.make} {vehicle.model}
        </Text>
        <Text variant="muted" className="text-sm" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {showActiveBadge && isActive && (
        <View className="rounded-full bg-primary px-2 py-0.5 shrink-0 self-center">
          <Text className="text-[10px] font-semibold text-primary-foreground">Activo</Text>
        </View>
      )}

      {onPress && showChevron && <ChevronRight size={20} color="#71717a" />}
    </Pressable>
  );
}

interface AddVehicleCardProps {
  onPress: () => void;
  className?: string;
}

function AddVehicleCard({ onPress, className }: AddVehicleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-4 py-4 active:opacity-80',
        className,
      )}
      accessibilityRole="button"
      accessibilityLabel="Agregar vehículo"
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <Text className="text-xl font-light text-muted-foreground">+</Text>
      </View>
      <Text className="font-semibold text-primary">Agregar vehículo</Text>
    </Pressable>
  );
}

export { VehicleSummaryCard, AddVehicleCard };
