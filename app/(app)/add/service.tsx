import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { addMonths } from 'date-fns';
import { FormScreen } from '@/components/layout/FormScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ImagePickerField } from '@/components/ui/image-picker';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/useAuthStore';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { MAINTENANCE_TYPE_LABELS } from '@/constants/domain';
import { REMINDER_TEMPLATES } from '@/lib/reminderUtils';
import { scheduleReminderNotification } from '@/lib/reminderScheduling';
import type { MaintenanceType } from '@/types';

const TYPE_OPTIONS = Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => ({
  label,
  value: value as MaintenanceType,
}));

export default function AddServiceScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const { user } = useAuthStore();
  const { addRecord } = useMaintenanceStore();
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
  const [type, setType] = React.useState<MaintenanceType>('oil_change');
  const [title, setTitle] = React.useState(MAINTENANCE_TYPE_LABELS.oil_change);
  const [date, setDate] = React.useState(new Date());
  const [mileage, setMileage] = React.useState(
    String(activeVehicle?.mileage ?? vehicles.find((v) => v.id === vehicleId)?.mileage ?? ''),
  );
  const [cost, setCost] = React.useState('');
  const [nextServiceMileage, setNextServiceMileage] = React.useState('');
  const [nextServiceDate, setNextServiceDate] = React.useState<Date | null>(null);
  const [description, setDescription] = React.useState('');
  const [serviceProvider, setServiceProvider] = React.useState('');
  const [parts, setParts] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setTitle(MAINTENANCE_TYPE_LABELS[type]);
  }, [type]);

  const applyTemplate = (templateId: string) => {
    const t = REMINDER_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setTitle(t.title);
    if (t.intervalMonths) {
      setNextServiceDate(addMonths(new Date(), t.intervalMonths));
    }
    if ('intervalMileage' in t && t.intervalMileage && mileage) {
      setNextServiceMileage(String(parseFloat(mileage) + t.intervalMileage));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if (!mileage || isNaN(parseFloat(mileage))) newErrors.mileage = 'Kilometraje inválido';
    if (!cost || isNaN(parseFloat(cost))) newErrors.cost = 'Costo inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      await addRecord({
        vehicleId,
        userId: user.id,
        type,
        title: title.trim(),
        description: description.trim(),
        date: date.getTime(),
        mileage: parseFloat(mileage),
        cost: parseFloat(cost),
        serviceProvider: serviceProvider.trim() || undefined,
        nextServiceMileage: nextServiceMileage ? parseFloat(nextServiceMileage) : undefined,
        nextServiceDate: nextServiceDate?.getTime(),
        parts: parts.trim() ? parts.split(',').map((p) => p.trim()).filter(Boolean) : [],
        photos,
        notes: notes.trim() || undefined,
      });

      if (nextServiceMileage || nextServiceDate) {
        const reminderId = await addReminder({
          vehicleId,
          userId: user.id,
          title: `Próximo: ${title.trim()}`,
          description: `Recordatorio generado desde service del ${date.toLocaleDateString('es-AR')}`,
          type: nextServiceMileage && nextServiceDate ? 'both' : nextServiceMileage ? 'mileage' : 'time',
          targetMileage: nextServiceMileage ? parseFloat(nextServiceMileage) : undefined,
          targetDate: nextServiceDate?.getTime(),
          priority: 'medium',
          isCompleted: false,
          isActive: true,
        });
        if (nextServiceDate) {
          await scheduleReminderNotification({
            id: reminderId,
            vehicleId,
            userId: user.id,
            title: `Próximo: ${title.trim()}`,
            description: '',
            type: 'time',
            targetDate: nextServiceDate.getTime(),
            priority: 'medium',
            isCompleted: false,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }

      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title="Nuevo service">
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

        <Select label="Tipo" options={TYPE_OPTIONS} value={type} onChange={setType} />

        <Input
          label="Título *"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />

        <DatePicker label="Fecha" value={date} onChange={setDate} maximumDate={new Date()} />

        <View className="flex-row gap-3">
          <Input
            label="Kilometraje *"
            value={mileage}
            onChangeText={setMileage}
            keyboardType="numeric"
            error={errors.mileage}
            containerClassName="flex-1"
          />
          <Input
            label="Costo *"
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
            error={errors.cost}
            containerClassName="flex-1"
          />
        </View>

        <Input
          label="Próximo service (km)"
          value={nextServiceMileage}
          onChangeText={setNextServiceMileage}
          keyboardType="numeric"
          placeholder="60000"
        />

        <DatePicker
          label="Próximo service (fecha)"
          value={nextServiceDate ?? new Date()}
          onChange={(d) => setNextServiceDate(d)}
        />
        <Text variant="muted" className="text-xs -mt-2">
          Si completás km o fecha, se crea un recordatorio automático.
        </Text>
      </View>

      <CollapsibleSection title="Más detalles">
        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />
        <Input
          label="Taller"
          value={serviceProvider}
          onChangeText={setServiceProvider}
        />
        <Input
          label="Repuestos"
          value={parts}
          onChangeText={setParts}
          placeholder="Separados por coma"
          multiline
        />
        <ImagePickerField
          label="Comprobantes"
          images={photos}
          onChange={setPhotos}
          maxImages={4}
          uploadConfig={
            user && vehicleId
              ? { userId: user.id, vehicleId, type: 'receipt' }
              : undefined
          }
        />
        <Input label="Notas" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />
      </CollapsibleSection>

      <Button onPress={handleSubmit} loading={isLoading} size="lg">
        Guardar service
      </Button>
    </FormScreen>
  );
}
