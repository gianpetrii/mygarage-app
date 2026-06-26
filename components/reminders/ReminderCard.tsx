import * as React from 'react';
import { View, Pressable } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { REMINDER_PRIORITY_COLORS } from '@/constants/domain';
import type { ServiceReminder } from '@/types';
import { cn } from '@/lib/utils';

interface ReminderCardProps {
  reminder: ServiceReminder;
  isOverdue?: boolean;
  onPress?: () => void;
  onComplete?: () => void;
  compact?: boolean;
}

function ReminderCard({
  reminder,
  isOverdue = false,
  onPress,
  onComplete,
  compact = false,
}: ReminderCardProps) {
  const priorityColor = REMINDER_PRIORITY_COLORS[reminder.priority];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        'rounded-xl border p-4 gap-2',
        isOverdue
          ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950'
          : 'border-border bg-card',
        compact && 'p-3',
      )}
    >
      <View className="flex-row items-start gap-2">
        <AlertTriangle size={18} color={isOverdue ? '#ef4444' : priorityColor} />
        <View className="flex-1">
          <Text className="font-semibold text-foreground" numberOfLines={2}>
            {reminder.title}
          </Text>
          {reminder.targetDate && (
            <Text variant="muted" className="text-xs mt-0.5">
              {isOverdue ? 'Venció el ' : 'Vence el '}
              {format(reminder.targetDate, "d 'de' MMMM yyyy", { locale: es })}
            </Text>
          )}
          {reminder.targetMileage != null && (
            <Text variant="muted" className="text-xs">
              A los {reminder.targetMileage.toLocaleString()} km
            </Text>
          )}
        </View>
        {onPress && <ChevronRight size={16} color="#71717a" />}
      </View>
      {onComplete && (
        <Pressable
          onPress={onComplete}
          className="self-start mt-1 rounded-lg bg-primary px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-primary-foreground">Marcar hecho</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export { ReminderCard };
