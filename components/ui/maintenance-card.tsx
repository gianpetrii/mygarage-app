import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Wrench, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Text } from './text';
import { MAINTENANCE_TYPE_LABELS } from '@/constants/domain';
import { useCurrency } from '@/hooks/useCurrency';
import type { MaintenanceRecord } from '@/types';

interface MaintenanceCardProps {
  record: MaintenanceRecord;
  onPress?: () => void;
  className?: string;
}

function MaintenanceCard({ record, onPress, className }: MaintenanceCardProps) {
  const { formatMoney } = useCurrency();

  return (
    <Pressable
      onPress={onPress}
      className={cn('rounded-xl border border-border bg-card p-4 gap-2', className)}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-8 h-8 rounded-lg bg-muted items-center justify-center">
            <Wrench size={16} color="#71717a" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-foreground" numberOfLines={1}>{record.title}</Text>
            <Text variant="muted" className="text-xs">
              {MAINTENANCE_TYPE_LABELS[record.type]}
            </Text>
          </View>
        </View>
        {onPress && <ChevronRight size={18} color="#71717a" />}
      </View>

      <View className="flex-row items-center justify-between">
        <Text variant="muted" className="text-xs">
          {format(record.date, "d MMM yyyy", { locale: es })} • {record.mileage.toLocaleString()} km
        </Text>
        <View className="flex-row items-center gap-0.5">
          <Text variant="muted" className="text-xs font-medium">
            {formatMoney(record.cost)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export { MaintenanceCard };
