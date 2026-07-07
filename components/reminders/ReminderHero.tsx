import * as React from 'react';
import { View, Pressable } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { isReminderMileageDue } from '@/lib/reminderUtils';
import type { ServiceReminder } from '@/types';

interface ReminderHeroProps {
  reminder: ServiceReminder;
  isOverdue: boolean;
  currentMileage?: number;
  onViewAll?: () => void;
  onComplete?: () => void;
}

function ReminderHero({
  reminder,
  isOverdue,
  currentMileage,
  onViewAll,
  onComplete,
}: ReminderHeroProps) {
  const mileageDue =
    currentMileage != null && isReminderMileageDue(reminder, currentMileage);
  const highlight = isOverdue || mileageDue;

  const scheduleParts: string[] = [];
  if (reminder.targetDate) {
    scheduleParts.push(
      `${isOverdue ? 'Venció' : 'Vence'} ${format(reminder.targetDate, 'd MMM', { locale: es })}`,
    );
  }
  if (reminder.targetMileage != null) {
    const kmPart = `Obj. ${reminder.targetMileage.toLocaleString()} km`;
    scheduleParts.push(
      currentMileage != null
        ? `${kmPart} · ${currentMileage.toLocaleString()} km`
        : kmPart,
    );
  }

  const className = `flex-row items-center gap-3 rounded-xl border px-3 py-2.5 ${
    highlight
      ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950'
      : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950'
  }`;

  const main = (
    <>
      <AlertTriangle size={18} color={highlight ? '#ef4444' : '#f59e0b'} />
      <View className="flex-1 min-w-0">
        <Text className="text-xs font-medium text-muted-foreground">
          {highlight ? 'Atención' : 'Próximo vencimiento'}
        </Text>
        <Text className="font-semibold text-foreground" numberOfLines={1}>
          {reminder.title}
        </Text>
        {scheduleParts.length > 0 && (
          <Text variant="muted" className="text-xs" numberOfLines={2}>
            {scheduleParts.join(' · ')}
          </Text>
        )}
      </View>
    </>
  );

  return (
    <View className={className}>
      {onViewAll ? (
        <Pressable onPress={onViewAll} className="flex-1 flex-row items-center gap-3 min-w-0">
          {main}
        </Pressable>
      ) : (
        <View className="flex-1 flex-row items-center gap-3 min-w-0">{main}</View>
      )}
      {onComplete && (
        <Pressable onPress={onComplete} hitSlop={8} className="rounded-lg bg-primary px-2.5 py-1.5">
          <Text className="text-xs font-semibold text-primary-foreground">Hecho</Text>
        </Pressable>
      )}
      {onViewAll && <ChevronRight size={16} color="#71717a" />}
    </View>
  );
}

export { ReminderHero };
