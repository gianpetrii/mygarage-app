import * as React from 'react';
import { View, Pressable, Image } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { AppEngineIcon } from '@/components/brand/AppEngineIcon';
import { cn } from '@/lib/utils';
import { Text } from './text';
import type { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  compact?: boolean;
  className?: string;
}

function VehicleCard({ vehicle, onPress, compact = false, className }: VehicleCardProps) {
  const firstPhoto = vehicle.photos?.[0];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-xl border border-border bg-card p-3',
        className,
      )}
    >
      {firstPhoto ? (
        <Image
          source={{ uri: firstPhoto }}
          className={cn('rounded-lg bg-muted', compact ? 'w-14 h-14' : 'w-16 h-16')}
          resizeMode="cover"
        />
      ) : (
        <View className={cn('rounded-lg bg-muted items-center justify-center', compact ? 'w-14 h-14' : 'w-16 h-16')}>
          <AppEngineIcon size={compact ? 24 : 28} />
        </View>
      )}

      <View className="flex-1 gap-0.5">
        <Text className="font-semibold text-foreground" numberOfLines={1}>
          {vehicle.make} {vehicle.model}
          {vehicle.trim ? ` ${vehicle.trim}` : ''}
        </Text>
        <Text variant="muted" className="text-sm">{vehicle.year}</Text>
        {!compact && (
          <View className="flex-row gap-3 mt-1">
            {vehicle.licensePlate && (
              <View className="bg-muted rounded px-1.5 py-0.5">
                <Text className="text-xs font-mono text-foreground">{vehicle.licensePlate}</Text>
              </View>
            )}
            <Text variant="muted" className="text-xs">{vehicle.mileage.toLocaleString()} km</Text>
          </View>
        )}
      </View>

      {onPress && <ChevronRight size={18} color="#71717a" />}
    </Pressable>
  );
}

export { VehicleCard };
