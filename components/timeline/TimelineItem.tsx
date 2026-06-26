import * as React from 'react';
import { View, Pressable } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wrench, Fuel, DollarSign, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { getTimelineSubtitle } from '@/lib/timeline';
import type { TimelineEntry } from '@/types';
import { cn } from '@/lib/utils';

const ICONS = {
  maintenance: Wrench,
  fuel: Fuel,
  expense: DollarSign,
} as const;

const ICON_COLORS = {
  maintenance: '#22c55e',
  fuel: '#3b82f6',
  expense: '#a855f7',
} as const;

interface TimelineItemProps {
  entry: TimelineEntry;
  onPress?: () => void;
  className?: string;
}

function TimelineItem({ entry, onPress, className }: TimelineItemProps) {
  const Icon = ICONS[entry.type];
  const color = ICON_COLORS[entry.type];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 active:opacity-80',
        className,
      )}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={18} color={color} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-semibold text-foreground" numberOfLines={1}>
          {entry.title}
        </Text>
        <Text variant="muted" className="text-xs">
          {getTimelineSubtitle(entry)}
          {entry.mileage != null ? ` · ${entry.mileage.toLocaleString()} km` : ''}
        </Text>
        <Text variant="muted" className="text-xs">
          {format(entry.date, "d MMM yyyy", { locale: es })}
        </Text>
      </View>
      {entry.amount != null && (
        <Text className="font-semibold text-foreground text-sm">
          ${entry.amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
        </Text>
      )}
      {onPress && <ChevronRight size={16} color="#71717a" />}
    </Pressable>
  );
}

export { TimelineItem };
