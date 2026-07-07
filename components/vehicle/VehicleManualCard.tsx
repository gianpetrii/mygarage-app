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
  const canOpen = Boolean(resolved?.url);
  const iconColor = canOpen ? colors.foreground : colors.mutedForeground;

  const row = (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border px-4 py-3',
        canOpen ? 'border-border bg-card' : 'border-border bg-card',
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

      <Text className="flex-1 font-semibold text-foreground" numberOfLines={1}>
        Manual del vehículo
      </Text>

      {isLoading ? (
        <Text variant="muted" className="text-sm">
          ...
        </Text>
      ) : canOpen ? (
        <ChevronRight size={18} color={colors.mutedForeground} />
      ) : (
        <Text variant="muted" className="text-sm">
          Próximamente
        </Text>
      )}
    </View>
  );

  if (canOpen && !isLoading) {
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
