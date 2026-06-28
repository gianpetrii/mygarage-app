import * as React from 'react';
import { View, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Bell, Check, Plus } from 'lucide-react-native';
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
import { requestNotificationPermissions, scheduleReminderNotification } from '@/lib/reminderScheduling';
import { cn } from '@/lib/utils';

const DEFAULT_SELECTED: ReminderTemplateId[] = ['vtv', 'oil', 'insurance'];

type Step = 'permissions' | 'templates' | 'customize';

export default function SetupRemindersScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { user } = useAuthStore();
  const { vehicles } = useVehiclesStore();
  const { addReminder } = useRemindersStore();
  const [step, setStep] = React.useState<Step>('permissions');
  const [selected, setSelected] = React.useState<Set<ReminderTemplateId>>(
    () => new Set(DEFAULT_SELECTED),
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [createdCount, setCreatedCount] = React.useState(0);

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const goHome = () => {
    router.replace('/(app)');
  };

  const toggle = (id: ReminderTemplateId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createSelectedReminders = async (): Promise<number> => {
    if (!user || !vehicle || selected.size === 0) return 0;

    let count = 0;
    for (const templateId of selected) {
      const data = buildReminderFromTemplate(
        templateId,
        vehicle.id,
        user.id,
        vehicle.mileage,
      );
      if (!data) continue;

      const id = await addReminder(data);
      count += 1;

      if (data.targetDate) {
        await scheduleReminderNotification({
          ...data,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    return count;
  };

  const handlePermissionsContinue = async () => {
    await requestNotificationPermissions();
    setStep('templates');
  };

  const handleTemplatesContinue = async () => {
    if (!vehicle) return;

    setIsLoading(true);
    try {
      const count = await createSelectedReminders();
      setCreatedCount(count);
      setStep('customize');
    } catch {
      Alert.alert('Error', 'No se pudieron crear los recordatorios. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomReminder = () => {
    if (!vehicle) return;
    router.push({
      pathname: '/(app)/add/reminder',
      params: { vehicleId: vehicle.id },
    });
  };

  if (!vehicle) {
    return (
      <FormScreen title="Recordatorios" onClose={goHome}>
        <Text variant="muted">Vehículo no encontrado</Text>
        <Button onPress={goHome}>Ir al inicio</Button>
      </FormScreen>
    );
  }

  const vehicleLabel = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;

  if (step === 'permissions') {
    return (
      <FormScreen title="Avisos a tiempo" onClose={goHome}>
        <Text variant="muted" className="text-sm -mt-2">
          {vehicleLabel}
        </Text>

        <View className="items-center gap-4 rounded-2xl border border-border bg-card p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Bell size={28} color="#18181b" />
          </View>
          <Text className="text-center text-base font-medium text-foreground">
            Activá las notificaciones para que te avisemos antes de que venza la VTV, el service o el seguro.
          </Text>
        </View>

        <Button onPress={handlePermissionsContinue} size="lg">
          Activar notificaciones
        </Button>
        <Button variant="ghost" onPress={() => setStep('templates')}>
          Configurar sin notificaciones
        </Button>
      </FormScreen>
    );
  }

  if (step === 'templates') {
    return (
      <FormScreen title="Recordatorios recomendados" onClose={goHome}>
        <Text variant="muted" className="text-sm -mt-2 mb-2">
          {vehicleLabel} — elegí los avisos que te sirven
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

        <Button onPress={handleTemplatesContinue} loading={isLoading} size="lg">
          {selected.size > 0 ? 'Continuar' : 'Continuar sin recordatorios'}
        </Button>
        <Button variant="ghost" onPress={goHome} disabled={isLoading}>
          Configurar después
        </Button>
      </FormScreen>
    );
  }

  return (
    <FormScreen title="¿Algo más?" onClose={goHome}>
      <Text variant="muted" className="text-sm -mt-2">
        {createdCount > 0
          ? `Creaste ${createdCount} recordatorio${createdCount === 1 ? '' : 's'} para ${vehicle.make} ${vehicle.model}.`
          : `Todavía no hay recordatorios para ${vehicle.make} ${vehicle.model}.`}
      </Text>

      <Pressable
        onPress={openCustomReminder}
        className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 active:opacity-80"
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Plus size={20} color="#71717a" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-foreground">Agregar recordatorio personalizado</Text>
          <Text variant="muted" className="text-xs mt-0.5">
            Patente, cubiertas u otro aviso a medida
          </Text>
        </View>
      </Pressable>

      <Button onPress={goHome} size="lg">
        Listo
      </Button>
    </FormScreen>
  );
}
