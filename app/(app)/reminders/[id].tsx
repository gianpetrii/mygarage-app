import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FormScreen } from '@/components/layout/FormScreen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { MileageInput } from '@/components/vehicle/MileageInput';
import { parseGroupedInteger } from '@/lib/numberFormat';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { isReminderOverdue } from '@/lib/reminderUtils';
import { REMINDER_PRIORITY_LABELS } from '@/constants/domain';
import { scheduleReminderNotification } from '@/lib/reminderScheduling';
import type { ReminderPriority } from '@/types';

const PRIORITY_OPTIONS = Object.entries(REMINDER_PRIORITY_LABELS).map(([value, label]) => ({
  label,
  value: value as ReminderPriority,
}));

export default function ReminderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reminders, updateReminder, completeReminder, deleteReminder } = useRemindersStore();
  const { vehicles } = useVehiclesStore();
  const reminder = reminders.find((r) => r.id === id);
  const [loading, setLoading] = React.useState(false);
  const [targetDate, setTargetDate] = React.useState<Date | undefined>();
  const [targetMileage, setTargetMileage] = React.useState('');
  const [priority, setPriority] = React.useState<ReminderPriority>('medium');
  const [completedDate, setCompletedDate] = React.useState(new Date());
  const [completedMileage, setCompletedMileage] = React.useState('');
  const [showCompleteForm, setShowCompleteForm] = React.useState(false);

  React.useEffect(() => {
    if (!reminder) return;
    setTargetDate(reminder.targetDate ? new Date(reminder.targetDate) : undefined);
    setTargetMileage(
      reminder.targetMileage != null ? String(Math.floor(reminder.targetMileage)) : '',
    );
    setPriority(reminder.priority);
    const vehicle = vehicles.find((v) => v.id === reminder.vehicleId);
    setCompletedMileage(
      String(Math.floor(vehicle?.mileage ?? reminder.lastCompletedMileage ?? 0)),
    );
  }, [reminder, vehicles]);

  if (!reminder) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="muted">Recordatorio no encontrado</Text>
      </View>
    );
  }

  const vehicle = vehicles.find((v) => v.id === reminder.vehicleId);
  const overdue = isReminderOverdue(reminder);
  const hasRecurringInterval = !!(reminder.intervalMonths || reminder.intervalMileage);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        priority,
        ...(reminder.type !== 'mileage' && targetDate
          ? { targetDate: targetDate.getTime() }
          : {}),
        ...(reminder.type !== 'time'
          ? { targetMileage: parseGroupedInteger(targetMileage) }
          : {}),
      };
      await updateReminder(id, updates);

      if (updates.targetDate) {
        await scheduleReminderNotification({
          ...reminder,
          ...updates,
          targetDate: updates.targetDate,
        });
      }

      Alert.alert('Guardado', 'Los cambios se guardaron correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    Alert.alert('Desactivar', '¿Desactivar este recordatorio? Podés volver a crearlo después.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desactivar',
        style: 'destructive',
        onPress: async () => {
          await updateReminder(id, { isActive: false });
          router.back();
        },
      },
    ]);
  };

  const handleComplete = async () => {
    const mileage = parseGroupedInteger(completedMileage);
    if (!Number.isFinite(mileage)) {
      Alert.alert('Error', 'Ingresá un kilometraje válido.');
      return;
    }

    setLoading(true);
    try {
      await completeReminder(id, completedDate.getTime(), mileage);

      if (hasRecurringInterval) {
        Alert.alert(
          'Listo',
          'Marcamos el mantenimiento como hecho y programamos el próximo vencimiento.',
        );
      }
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo completar el recordatorio.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Eliminar este recordatorio permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteReminder(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <FormScreen title={reminder.title}>
      <View
        className={`rounded-xl border p-4 gap-1 ${
          overdue ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-border bg-card'
        }`}
      >
        {overdue && (
          <Text className="text-red-600 dark:text-red-400 font-semibold text-sm">Vencido</Text>
        )}
        {vehicle && (
          <Text variant="muted" className="text-sm">
            {vehicle.make} {vehicle.model} {vehicle.year}
          </Text>
        )}
        {reminder.description ? (
          <Text variant="muted" className="text-sm mt-1">{reminder.description}</Text>
        ) : null}
      </View>

      <Text className="text-sm font-semibold text-foreground mt-2">Editar vencimiento</Text>

      {(reminder.type === 'time' || reminder.type === 'both') && targetDate && (
        <DatePicker label="Próximo vencimiento" value={targetDate} onChange={setTargetDate} />
      )}

      {(reminder.type === 'mileage' || reminder.type === 'both') && (
        <MileageInput
          label="Kilometraje objetivo"
          value={targetMileage}
          onChangeValue={setTargetMileage}
        />
      )}

      <Select label="Prioridad" options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />

      <Button onPress={handleSave} loading={loading} size="lg">
        Guardar cambios
      </Button>

      {!showCompleteForm ? (
        <Button variant="outline" onPress={() => setShowCompleteForm(true)}>
          Marcar como hecho
        </Button>
      ) : (
        <View className="gap-3 rounded-xl border border-border bg-card p-4">
          <Text className="font-semibold text-foreground">
            {hasRecurringInterval ? 'Registrar mantenimiento' : 'Completar recordatorio'}
          </Text>
          <Text variant="muted" className="text-xs">
            {hasRecurringInterval
              ? 'Usamos esta fecha y km para calcular el próximo vencimiento.'
              : 'Este recordatorio no tiene intervalo; se marcará como completado.'}
          </Text>
          <DatePicker label="Fecha en que lo hiciste" value={completedDate} onChange={setCompletedDate} />
          <MileageInput
            label="Kilometraje al momento"
            value={completedMileage}
            onChangeValue={setCompletedMileage}
          />
          <Button onPress={handleComplete} loading={loading}>
            Confirmar
          </Button>
          <Button variant="ghost" onPress={() => setShowCompleteForm(false)}>
            Cancelar
          </Button>
        </View>
      )}

      <Button variant="outline" onPress={handleDeactivate}>
        Desactivar recordatorio
      </Button>
      <Button variant="destructive" onPress={handleDelete}>
        Eliminar
      </Button>
    </FormScreen>
  );
}
