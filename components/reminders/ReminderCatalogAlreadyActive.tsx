import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import {
  REMINDER_CATALOG_OPTIONS,
  getActiveTemplateIdsForVehicle,
  reminderMatchesTemplate,
} from '@/lib/reminderUtils';
import type { ServiceReminder } from '@/types';

interface ReminderCatalogAlreadyActiveProps {
  reminders: ServiceReminder[];
  vehicleId: string;
  onOpenReminder: (reminderId: string) => void;
}

function ReminderCatalogAlreadyActive({
  reminders,
  vehicleId,
  onOpenReminder,
}: ReminderCatalogAlreadyActiveProps) {
  const activeIds = getActiveTemplateIdsForVehicle(reminders, vehicleId);
  if (activeIds.length === 0) return null;

  const rows = REMINDER_CATALOG_OPTIONS.filter((option) => activeIds.includes(option.templateId));

  return (
    <View className="gap-2 rounded-xl border border-border bg-muted/40 p-4">
      <Text className="text-sm font-semibold text-foreground">Ya en tu lista</Text>
      <Text variant="muted" className="text-xs leading-5">
        No son obligatorios: solo no aparecen abajo porque ya los tenés. Para sacarlos o cambiarlos,
        abrilos desde acá o desde Recordatorios.
      </Text>
      <View className="gap-2 mt-1">
        {rows.map((option) => {
          const reminder = reminders.find(
            (r) =>
              r.vehicleId === vehicleId && reminderMatchesTemplate(r, option.templateId),
          );
          if (!reminder) return null;

          return (
            <Pressable
              key={option.templateId}
              onPress={() => onOpenReminder(reminder.id)}
              className="flex-row items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 active:opacity-80"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Check size={16} color="#18181b" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">{option.label}</Text>
                <Text variant="muted" className="text-[11px]">
                  Gestionar · eliminar o desactivar
                </Text>
              </View>
              <ChevronRight size={16} color="#71717a" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export type { ReminderCatalogAlreadyActiveProps };
export { ReminderCatalogAlreadyActive };
