import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FormScreen } from '@/components/layout/FormScreen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { MileageInput } from '@/components/vehicle/MileageInput';
import { Input } from '@/components/ui/input';
import { ImagePickerField } from '@/components/ui/image-picker';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { parseGroupedInteger } from '@/lib/numberFormat';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useAuthStore } from '@/store/useAuthStore';
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
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { reminders, updateReminder, completeReminder, deleteReminder } = useRemindersStore();
  const { user } = useAuthStore();
  const { vehicles } = useVehiclesStore();
  const reminder = reminders.find((r) => r.id === id);
  const [loading, setLoading] = React.useState(false);
  const [targetDate, setTargetDate] = React.useState<Date | undefined>();
  const [targetMileage, setTargetMileage] = React.useState('');
  const [priority, setPriority] = React.useState<ReminderPriority>('medium');
  const [completedDate, setCompletedDate] = React.useState(new Date());
  const [completedMileage, setCompletedMileage] = React.useState('');
  const [completedCost, setCompletedCost] = React.useState('');
  const [completedServiceProvider, setCompletedServiceProvider] = React.useState('');
  const [completedPhotos, setCompletedPhotos] = React.useState<string[]>([]);
  const [completedNotes, setCompletedNotes] = React.useState('');
  const [showCompleteForm, setShowCompleteForm] = React.useState(false);

  React.useEffect(() => {
    if (!reminder) return;
    setTargetDate(reminder.targetDate ? new Date(reminder.targetDate) : undefined);
    setTargetMileage(
      reminder.targetMileage != null ? String(Math.floor(reminder.targetMileage)) : '',
    );
    setPriority(reminder.priority);
    const vehicle = vehicles.find((v) => v.id === reminder.vehicleId);
    const defaultMileage =
      reminder.targetMileage ?? vehicle?.mileage ?? reminder.lastCompletedMileage ?? 0;
    setCompletedMileage(String(Math.floor(defaultMileage)));
  }, [reminder, vehicles]);

  if (!reminder || !id) {
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

      Alert.alert('Guardado', 'Los cambios se guardaron correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await updateReminder(id, { isActive: true, isCompleted: false });
      if (reminder.targetDate) {
        await scheduleReminderNotification({
          ...reminder,
          isActive: true,
          isCompleted: false,
        });
      }
      Alert.alert('Listo', 'El recordatorio volvió a estar activo.');
    } catch {
      Alert.alert('Error', 'No se pudo reactivar el recordatorio.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    Alert.alert(
      'Desactivar',
      '¿Desactivar este recordatorio? Seguirá en la lista pero no te avisará hasta que lo reactives.',
      [
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
      const parsedCost = completedCost.trim() ? parseFloat(completedCost) : undefined;
      if (completedCost.trim() && !Number.isFinite(parsedCost)) {
        Alert.alert('Error', 'Ingresá un monto válido.');
        setLoading(false);
        return;
      }

      await completeReminder(id, completedDate.getTime(), mileage, {
        cost: parsedCost,
        photos: completedPhotos,
        notes: completedNotes.trim() || undefined,
        serviceProvider: completedServiceProvider.trim() || undefined,
      });

      const message = hasRecurringInterval
        ? 'Marcamos el mantenimiento como hecho y programamos el próximo vencimiento.'
        : 'Quedó registrado en el historial del vehículo.';
      Alert.alert('Listo', message, [{ text: 'OK', onPress: () => router.back() }]);
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
          if (!id) return;
          try {
            await deleteReminder(id);
            router.back();
          } catch {
            Alert.alert(
              'Error',
              'No se pudo eliminar en la nube. Revisá tu conexión e intentá de nuevo.',
            );
          }
        },
      },
    ]);
  };

  return (
    <FormScreen title={reminder.title} contentClassName="pb-10">
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

      {reminder.isActive && !reminder.isCompleted && !showCompleteForm ? (
        <Button variant="outline" onPress={() => setShowCompleteForm(true)}>
          Marcar como hecho
        </Button>
      ) : null}

      {reminder.isActive && !reminder.isCompleted && showCompleteForm ? (
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
          <View className="flex-row gap-3">
            <MileageInput
              label="Kilometraje al momento"
              value={completedMileage}
              onChangeValue={setCompletedMileage}
              containerClassName="flex-1"
            />
            <Input
              label="Monto (opcional)"
              value={completedCost}
              onChangeText={setCompletedCost}
              keyboardType="decimal-pad"
              placeholder="ARS"
              containerClassName="flex-1"
            />
          </View>
          <CollapsibleSection title="Información adicional (opcional)">
            {user ? (
              <ImagePickerField
                label="Foto del comprobante"
                images={completedPhotos}
                onChange={setCompletedPhotos}
                maxImages={4}
                uploadConfig={{
                  userId: user.id,
                  vehicleId: reminder.vehicleId,
                  type: 'receipt',
                }}
              />
            ) : null}
            <Input
              label="Taller o proveedor"
              value={completedServiceProvider}
              onChangeText={setCompletedServiceProvider}
              placeholder="Opcional"
            />
            <Input
              label="Notas"
              value={completedNotes}
              onChangeText={setCompletedNotes}
              multiline
              numberOfLines={3}
              placeholder="Detalles, repuestos, etc."
            />
          </CollapsibleSection>
          <Button onPress={handleComplete} loading={loading}>
            Confirmar
          </Button>
          <Button variant="ghost" onPress={() => setShowCompleteForm(false)}>
            Cancelar
          </Button>
        </View>
      ) : null}

      {!reminder.isActive || reminder.isCompleted ? (
        <Button variant="outline" onPress={handleReactivate} loading={loading}>
          Reactivar recordatorio
        </Button>
      ) : (
        <Button variant="outline" onPress={handleDeactivate}>
          Desactivar recordatorio
        </Button>
      )}
      <Button variant="destructive" onPress={handleDelete}>
        Eliminar
      </Button>
    </FormScreen>
  );
}
