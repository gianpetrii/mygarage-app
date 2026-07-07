import * as React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { addMonths } from 'date-fns';
import { FormScreen } from '@/components/layout/FormScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { MileageInput } from '@/components/vehicle/MileageInput';
import { parseGroupedInteger } from '@/lib/numberFormat';
import { useAuthStore } from '@/store/useAuthStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { REMINDER_PRIORITY_LABELS } from '@/constants/domain';
import { scheduleReminderNotification } from '@/lib/reminderScheduling';
import { useToast } from '@/components/ui/toast';
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

interface CustomReminderFormProps {
  vehicleId?: string;
  onClose?: () => void;
  /** Tras guardar, navegar a esta pantalla en lugar de solo volver atrás. */
  returnTo?: 'reminders';
}

function CustomReminderForm({ vehicleId: vehicleIdProp, onClose, returnTo }: CustomReminderFormProps) {
  const { user } = useAuthStore();
  const { addReminder } = useRemindersStore();
  const { vehicles, activeVehicle } = useActiveVehicle();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model} (${v.year})`,
    value: v.id,
  }));

  const [vehicleId, setVehicleId] = React.useState(
    vehicleIdProp ?? activeVehicle?.id ?? vehicles[0]?.id ?? '',
  );
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState<ReminderType>('time');
  const [priority, setPriority] = React.useState<ReminderPriority>('medium');
  const [targetDate, setTargetDate] = React.useState(addMonths(new Date(), 6));
  const [targetMileage, setTargetMileage] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (vehicleIdProp) setVehicleId(vehicleIdProp);
  }, [vehicleIdProp]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if ((type === 'time' || type === 'both') && !targetDate) {
      newErrors.targetDate = 'Fecha requerida';
    }
    if ((type === 'mileage' || type === 'both') && !parseGroupedInteger(targetMileage)) {
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
        targetMileage: type !== 'time' ? parseGroupedInteger(targetMileage) : undefined,
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

      toast({
        message: 'Recordatorio guardado',
        description: title.trim(),
        variant: 'success',
      });

      if (returnTo === 'reminders') {
        router.replace('/(app)/reminders');
        return;
      }

      if (onClose) onClose();
      else router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el recordatorio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title="Recordatorio personalizado" onClose={onClose} animated={false}>
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
          <DatePicker label="Próximo vencimiento" value={targetDate} onChange={setTargetDate} />
        )}

        {(type === 'mileage' || type === 'both') && (
          <MileageInput
            label="Kilometraje objetivo"
            value={targetMileage}
            onChangeValue={setTargetMileage}
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

export { CustomReminderForm };
