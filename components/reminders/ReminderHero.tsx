import * as React from 'react';
import { View, Pressable } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import type { ServiceReminder } from '@/types';

interface ReminderHeroProps {
  reminder: ServiceReminder;
  isOverdue: boolean;
  onViewAll?: () => void;
  onComplete?: () => void;
}

function ReminderHero({ reminder, isOverdue, onViewAll, onComplete }: ReminderHeroProps) {
  return (
    <View
      className={`rounded-2xl border p-5 gap-3 ${
        isOverdue
          ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950'
          : 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950'
      }`}
    >
      <View className="flex-row items-center gap-2">
        <AlertTriangle size={22} color={isOverdue ? '#ef4444' : '#f59e0b'} />
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {isOverdue ? 'Vencido' : 'Próximo vencimiento'}
        </Text>
      </View>
      <Text variant="h3" className={isOverdue ? 'text-red-900 dark:text-red-100' : ''}>
        {reminder.title}
      </Text>
      {reminder.targetDate && (
        <Text className={isOverdue ? 'text-red-700 dark:text-red-300' : 'text-amber-800 dark:text-amber-200'}>
          {isOverdue ? 'Venció el ' : 'Vence el '}
          {format(reminder.targetDate, "EEEE d 'de' MMMM", { locale: es })}
        </Text>
      )}
      {reminder.targetMileage != null && (
        <Text variant="muted" className="text-sm">
          Kilometraje objetivo: {reminder.targetMileage.toLocaleString()} km
        </Text>
      )}
      <View className="flex-row gap-2 mt-1">
        {onComplete && (
          <Pressable onPress={onComplete} className="flex-1 rounded-xl bg-primary py-3 items-center">
            <Text className="font-semibold text-primary-foreground">Marcar hecho</Text>
          </Pressable>
        )}
        {onViewAll && (
          <Pressable
            onPress={onViewAll}
            className="flex-1 rounded-xl border border-border bg-background py-3 items-center"
          >
            <Text className="font-semibold text-foreground">Ver todos</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export { ReminderHero };
