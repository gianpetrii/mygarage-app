import * as React from 'react';
import { View, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { FormScreen } from '@/components/layout/FormScreen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import {
  SETUP_REMINDER_OPTIONS,
  buildReminderFromTemplate,
  type ReminderTemplateId,
} from '@/lib/reminderUtils';
import { scheduleReminderNotification } from '@/lib/reminderScheduling';
import { cn } from '@/lib/utils';

const DEFAULT_SELECTED: ReminderTemplateId[] = ['vtv', 'oil', 'insurance'];

export default function SetupRemindersScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { user } = useAuthStore();
  const { vehicles } = useVehiclesStore();
  const { addReminder } = useRemindersStore();
  const [selected, setSelected] = React.useState<Set<ReminderTemplateId>>(
    () => new Set(DEFAULT_SELECTED),
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const toggle = (id: ReminderTemplateId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goHome = () => {
    router.replace('/(app)');
  };

  const handleCreate = async () => {
    if (!user || !vehicle) return;
    if (selected.size === 0) {
      goHome();
      return;
    }

    setIsLoading(true);
    try {
      for (const templateId of selected) {
        const data = buildReminderFromTemplate(
          templateId,
          vehicle.id,
          user.id,
          vehicle.mileage,
        );
        if (!data) continue;

        const id = await addReminder(data);

        if (data.targetDate) {
          await scheduleReminderNotification({
            ...data,
            id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
      goHome();
    } catch {
      Alert.alert('Error', 'No se pudieron crear los recordatorios. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <FormScreen title="Recordatorios">
        <Text variant="muted">Vehículo no encontrado</Text>
        <Button onPress={goHome}>Ir al inicio</Button>
      </FormScreen>
    );
  }

  return (
    <FormScreen title="¿Qué querés recordar?">
      <Text variant="muted" className="text-sm -mt-2 mb-2">
        {vehicle.make} {vehicle.model} {vehicle.year} — elegí los avisos que te sirven
      </Text>

      <View className="gap-3">
        {SETUP_REMINDER_OPTIONS.map((option) => {
          const isSelected = selected.has(option.templateId);
          return (
            <Pressable
              key={option.templateId}
              onPress={() => toggle(option.templateId)}
              className={cn(
                'flex-row items-center gap-4 rounded-xl border p-4',
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card',
              )}
            >
              <View
                className={cn(
                  'h-6 w-6 items-center justify-center rounded-md border',
                  isSelected ? 'border-primary bg-primary' : 'border-border bg-background',
                )}
              >
                {isSelected && <Check size={14} color="#fafafa" />}
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">{option.label}</Text>
                <Text variant="muted" className="text-xs mt-0.5">
                  {option.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text variant="muted" className="text-xs text-center">
        Podés ajustar fechas y kilometrajes después desde cada recordatorio
      </Text>

      <Button onPress={handleCreate} loading={isLoading} size="lg">
        {selected.size > 0 ? 'Crear recordatorios' : 'Continuar sin recordatorios'}
      </Button>
      <Button variant="ghost" onPress={goHome} disabled={isLoading}>
        Configurar después
      </Button>
    </FormScreen>
  );
}
