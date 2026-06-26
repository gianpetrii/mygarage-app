import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { addMonths } from 'date-fns';
import { FormScreen } from '@/components/layout/FormScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useAuthStore } from '@/store/useAuthStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { REMINDER_PRIORITY_LABELS } from '@/constants/domain';
import { REMINDER_TEMPLATES } from '@/lib/reminderUtils';
import { scheduleReminderNotification } from '@/lib/reminderScheduling';
import type { ReminderPriority, ReminderType } from '@/types';

const PRIORITY_OPTIONS = Object.entries(REMINDER_PRIORITY_LABELS).map(([value, label]) => ({
  label,
  value: value as ReminderPriority,
}));

const TYPE_OPTIONS = [
  { label: 'Por fecha', value: 'time' as ReminderType },
  { label: 'Por kilometraje', value: 'mileage' as ReminderType },
  { label: 'Ambos', value: 'both' as ReminderType },
];

export default function AddReminderScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const { user } = useAuthStore();
  const { addReminder } = useRemindersStore();
  const { vehicles, activeVehicle } = useActiveVehicle();
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model} (${v.year})`,
    value: v.id,
  }));

  const [vehicleId, setVehicleId] = React.useState(
    vehicleIdParam ?? activeVehicle?.id ?? vehicles[0]?.id ?? '',
  );
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState<ReminderType>('time');
  const [priority, setPriority] = React.useState<ReminderPriority>('medium');
  const [targetDate, setTargetDate] = React.useState(addMonths(new Date(), 6));
  const [targetMileage, setTargetMileage] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const applyTemplate = (templateId: string) => {
    const t = REMINDER_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setTitle(t.title);
    setPriority(t.priority);
    if (t.intervalMonths) {
      setTargetDate(addMonths(new Date(), t.intervalMonths));
      setType('time');
    }
    if ('intervalMileage' in t && t.intervalMileage && activeVehicle) {
      setTargetMileage(String(activeVehicle.mileage + t.intervalMileage));
      setType(t.intervalMonths ? 'both' : 'mileage');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if ((type === 'time' || type === 'both') && !targetDate) {
      newErrors.targetDate = 'Fecha requerida';
    }
    if ((type === 'mileage' || type === 'both') && (!targetMileage || isNaN(parseFloat(targetMileage)))) {
      newErrors.targetMileage = 'Kilometraje requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      const id = await addReminder({
        vehicleId,
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        type,
        targetDate: type !== 'mileage' ? targetDate.getTime() : undefined,
        targetMileage: type !== 'time' ? parseFloat(targetMileage) : undefined,
        priority,
        isCompleted: false,
        isActive: true,
      });

      if (type !== 'mileage') {
        await scheduleReminderNotification({
          id,
          vehicleId,
          userId: user.id,
          title: title.trim(),
          description: description.trim(),
          type,
          targetDate: targetDate.getTime(),
          priority,
          isCompleted: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el recordatorio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title="Nuevo recordatorio">
      <View className="flex-row flex-wrap gap-2">
        {REMINDER_TEMPLATES.map((t) => (
          <Button key={t.id} variant="outline" size="sm" onPress={() => applyTemplate(t.id)}>
            {t.title}
          </Button>
        ))}
      </View>

      <View className="gap-4">
        {vehicleOptions.length > 0 && (
          <Select
            label="Vehículo *"
            options={vehicleOptions}
            value={vehicleId}
            onChange={setVehicleId}
            error={errors.vehicleId}
          />
        )}

        <Input label="Título *" value={title} onChangeText={setTitle} error={errors.title} />

        <Select label="Tipo" options={TYPE_OPTIONS} value={type} onChange={setType} />

        <Select label="Prioridad" options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />

        {(type === 'time' || type === 'both') && (
          <DatePicker label="Fecha objetivo" value={targetDate} onChange={setTargetDate} />
        )}

        {(type === 'mileage' || type === 'both') && (
          <Input
            label="Kilometraje objetivo"
            value={targetMileage}
            onChangeText={setTargetMileage}
            keyboardType="numeric"
            error={errors.targetMileage}
          />
        )}

        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />
      </View>

      <Button onPress={handleSubmit} loading={isLoading} size="lg">
        Guardar recordatorio
      </Button>
    </FormScreen>
  );
}
