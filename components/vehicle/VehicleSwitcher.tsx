import * as React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { X, ChevronDown } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types';

interface VehicleSwitcherProps {
  className?: string;
  showAllOption?: boolean;
  onSelect?: (vehicle: Vehicle | null) => void;
}

function VehicleSwitcher({ className, showAllOption = false, onSelect }: VehicleSwitcherProps) {
  const { vehicles, activeVehicle, setActiveVehicle } = useActiveVehicle();
  const [open, setOpen] = React.useState(false);

  if (vehicles.length === 0) return null;
  if (vehicles.length === 1 && !showAllOption) return null;

  const label = activeVehicle
    ? `${activeVehicle.make} ${activeVehicle.model}`
    : showAllOption
      ? 'Todos los vehículos'
      : 'Seleccionar vehículo';

  const handleSelect = async (vehicle: Vehicle | null) => {
    if (!showAllOption || vehicle) {
      await setActiveVehicle(vehicle);
    }
    onSelect?.(vehicle);
    setOpen(false);
  };

  return (
    <View className={cn('relative z-10', className)}>
      <Pressable
        onPress={() => vehicles.length > 1 || showAllOption ? setOpen(!open) : undefined}
        className="flex-row items-center gap-2 self-start rounded-full border border-border bg-card px-3 py-1.5"
        accessibilityRole="button"
        accessibilityLabel={`Vehículo activo: ${label}`}
      >
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {label}
        </Text>
        {(vehicles.length > 1 || showAllOption) && <ChevronDown size={14} color="#71717a" />}
      </Pressable>

      {open && (
        <View className="absolute top-full left-0 right-0 mt-1 min-w-[200] rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {showAllOption && (
            <Pressable
              onPress={() => handleSelect(null)}
              className="px-4 py-3 border-b border-border"
            >
              <Text className={cn('text-sm', !activeVehicle && 'font-semibold text-primary')}>
                Todos los vehículos
              </Text>
            </Pressable>
          )}
          {vehicles.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => handleSelect(v)}
              className="px-4 py-3 border-b border-border last:border-b-0"
            >
              <Text
                className={cn(
                  'text-sm',
                  activeVehicle?.id === v.id && 'font-semibold text-primary',
                )}
              >
                {v.make} {v.model} ({v.year})
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => {
              setOpen(false);
              router.push('/(app)/vehicles/new');
            }}
            className="px-4 py-3 bg-muted/50"
          >
            <Text className="text-sm text-primary font-medium">+ Agregar vehículo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export { VehicleSwitcher };
