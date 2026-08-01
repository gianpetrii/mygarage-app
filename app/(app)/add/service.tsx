import * as React from 'react';
import { View, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FormScreen } from '@/components/layout/FormScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ImagePickerField } from '@/components/ui/image-picker';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { Text } from '@/components/ui/text';
import { MileageInput } from '@/components/vehicle/MileageInput';
import { useAuthStore } from '@/store/useAuthStore';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import {
  getMovementKindOption,
  MOVEMENT_KIND_OPTIONS,
  type MovementKind,
} from '@/lib/maintenanceForm';
import { parseGroupedInteger } from '@/lib/numberFormat';
import { cn } from '@/lib/utils';

export default function AddMovementScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const { user } = useAuthStore();
  const { addRecord } = useMaintenanceStore();
  const { vehicles, activeVehicle } = useActiveVehicle();
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model} (${v.year})`,
    value: v.id,
  }));

  const [vehicleId, setVehicleId] = React.useState(
    vehicleIdParam ?? activeVehicle?.id ?? vehicles[0]?.id ?? '',
  );
  const [kind, setKind] = React.useState<MovementKind>('repair');
  const [customTitle, setCustomTitle] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [mileage, setMileage] = React.useState(
    String(activeVehicle?.mileage ?? vehicles.find((v) => v.id === vehicleId)?.mileage ?? ''),
  );
  const [cost, setCost] = React.useState('');
  const [serviceProvider, setServiceProvider] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const kindOption = getMovementKindOption(kind);
  const resolvedTitle =
    kind === 'service'
      ? kindOption.defaultTitle
      : kind === 'other'
        ? customTitle.trim()
        : customTitle.trim() || kindOption.defaultTitle;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (kind === 'other' && !resolvedTitle) newErrors.title = 'El título es requerido';
    if (!mileage || !Number.isFinite(parseGroupedInteger(mileage))) {
      newErrors.mileage = 'Kilometraje inválido';
    }
    if (cost.trim() && Number.isNaN(parseFloat(cost))) {
      newErrors.cost = 'Monto inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      const parsedMileage = parseGroupedInteger(mileage);
      const parsedCost = cost.trim() ? parseFloat(cost) : undefined;

      await addRecord({
        vehicleId,
        userId: user.id,
        type: kindOption.type,
        title: resolvedTitle,
        description: '',
        date: date.getTime(),
        mileage: parsedMileage,
        cost: parsedCost != null && Number.isFinite(parsedCost) ? parsedCost : 0,
        serviceProvider: serviceProvider.trim() || undefined,
        parts: [],
        photos,
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title="Registrar movimiento">
      <Text variant="muted" className="text-sm -mt-2">
        Arreglos, services u otros trabajos que no vienen de un recordatorio
      </Text>

      <View className="gap-2">
        <Text className="text-sm font-medium text-foreground">¿Qué fue?</Text>
        <View className="flex-row flex-wrap gap-2">
          {MOVEMENT_KIND_OPTIONS.map((option) => {
            const selected = kind === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  setKind(option.id);
                  if (option.id !== 'other') setCustomTitle('');
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 active:opacity-80',
                  selected ? 'border-primary bg-primary/10' : 'border-border bg-card',
                )}
              >
                <Text
                  className={cn(
                    'text-sm',
                    selected ? 'font-semibold text-primary' : 'text-foreground',
                  )}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-4">
        {vehicleOptions.length > 0 && (
          <Select
            label="Vehículo"
            options={vehicleOptions}
            value={vehicleId}
            onChange={setVehicleId}
            error={errors.vehicleId}
          />
        )}

        {kind === 'other' && (
          <Input
            label="Título"
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="Ej: Cambio de correa"
            error={errors.title}
          />
        )}

        {kind === 'repair' && (
          <Input
            label="¿Qué arreglaste?"
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="Ej: Pastillas de freno"
            error={errors.title}
          />
        )}

        <DatePicker label="Fecha" value={date} onChange={setDate} maximumDate={new Date()} />

        <View className="flex-row gap-3">
          <MileageInput
            label="Kilometraje"
            value={mileage}
            onChangeValue={setMileage}
            error={errors.mileage}
            containerClassName="flex-1"
          />
          <Input
            label="Monto (opcional)"
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
            error={errors.cost}
            containerClassName="flex-1"
            placeholder="ARS"
          />
        </View>
      </View>

      <CollapsibleSection title="Información adicional (opcional)">
        <ImagePickerField
          label="Foto del comprobante"
          images={photos}
          onChange={setPhotos}
          maxImages={4}
          uploadConfig={
            user && vehicleId
              ? { userId: user.id, vehicleId, type: 'receipt' }
              : undefined
          }
        />
        <Input
          label="Taller o proveedor"
          value={serviceProvider}
          onChangeText={setServiceProvider}
          placeholder="Opcional"
        />
        <Input
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholder="Detalles, repuestos, etc."
        />
      </CollapsibleSection>

      <Button onPress={handleSubmit} loading={isLoading} size="lg">
        Guardar
      </Button>
    </FormScreen>
  );
}
