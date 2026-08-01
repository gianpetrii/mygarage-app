import * as React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/colors';
import type { ResolvedVehicleManual } from '@/lib/vehicleManuals';
import { cn } from '@/lib/utils';

interface VehicleManualCardProps {
  resolved: ResolvedVehicleManual | null;
  isLoading: boolean;
  onOpen: () => void;
  className?: string;
}

function VehicleManualCard({
  resolved,
  isLoading,
  onOpen,
  className,
}: VehicleManualCardProps) {
  const { resolvedScheme } = useColorScheme();
  const colors = Colors[resolvedScheme];
  const isAvailable = resolved?.status === 'available' && Boolean(resolved.url);
  const iconColor = isAvailable ? colors.foreground : colors.mutedForeground;

  const statusLabel = isLoading
    ? 'Buscando...'
    : isAvailable
      ? null
      : 'En camino';

  const row = (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border px-4 py-3',
        'border-border bg-card',
        className,
      )}
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <BookOpen size={18} color={iconColor} />
        )}
      </View>

      <View className="flex-1 min-w-0">
        <Text className="font-semibold text-foreground" numberOfLines={1}>
          Manual del vehículo
        </Text>
        {!isLoading && !isAvailable && (
          <Text variant="muted" className="text-xs mt-0.5" numberOfLines={2}>
            Estamos sumando manuales para más modelos
          </Text>
        )}
      </View>

      {statusLabel ? (
        <Text variant="muted" className="text-sm shrink-0">
          {statusLabel}
        </Text>
      ) : (
        <ChevronRight size={18} color={colors.mutedForeground} />
      )}
    </View>
  );

  if (isAvailable && !isLoading) {
    return (
      <Pressable
        onPress={onOpen}
        className="active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel="Abrir manual del vehículo"
      >
        {row}
      </Pressable>
    );
  }

  return row;
}

export { VehicleManualCard };
