import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FormScreen } from '@/components/layout/FormScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { isReminderOverdue } from '@/lib/reminderUtils';

export default function ReminderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reminders, completeReminder, deleteReminder } = useRemindersStore();
  const { vehicles } = useVehiclesStore();
  const reminder = reminders.find((r) => r.id === id);
  const [loading, setLoading] = React.useState(false);

  if (!reminder) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="muted">Recordatorio no encontrado</Text>
      </View>
    );
  }

  const vehicle = vehicles.find((v) => v.id === reminder.vehicleId);
  const overdue = isReminderOverdue(reminder);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeReminder(id, Date.now(), vehicle?.mileage ?? 0);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Eliminar este recordatorio?', [
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
        className={`rounded-xl border p-4 gap-2 ${
          overdue ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-border bg-card'
        }`}
      >
        {overdue && (
          <Text className="text-red-600 dark:text-red-400 font-semibold text-sm">Vencido</Text>
        )}
        {reminder.targetDate && (
          <Text>
            Fecha: {format(reminder.targetDate, "d 'de' MMMM yyyy", { locale: es })}
          </Text>
        )}
        {reminder.targetMileage != null && (
          <Text>Kilometraje: {reminder.targetMileage.toLocaleString()} km</Text>
        )}
        {vehicle && (
          <Text variant="muted" className="text-sm">
            {vehicle.make} {vehicle.model}
          </Text>
        )}
        {reminder.description ? (
          <Text variant="muted" className="text-sm mt-2">{reminder.description}</Text>
        ) : null}
      </View>

      <Button onPress={handleComplete} loading={loading} size="lg">
        Marcar como hecho
      </Button>
      <Button variant="destructive" onPress={handleDelete}>
        Eliminar recordatorio
      </Button>
    </FormScreen>
  );
}
