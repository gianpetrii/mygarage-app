import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FormScreen } from '@/components/layout/FormScreen';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ImagePickerField } from '@/components/ui/image-picker';
import { VehicleMakeModelFields } from '@/components/vehicle/VehicleMakeModelFields';
import { VehicleYearSelect } from '@/components/vehicle/VehicleYearSelect';
import { MileageInput } from '@/components/vehicle/MileageInput';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { VehicleTrimField } from '@/components/vehicle/VehicleTrimField';
import { normalizeMake, normalizeModel, normalizeTrim } from '@/lib/vehicleCatalog';
import { parseGroupedInteger } from '@/lib/numberFormat';
import type { FuelType, Transmission } from '@/types';

const FUEL_OPTIONS = [
  { label: 'Nafta', value: 'gasoline' as FuelType },
  { label: 'Diesel', value: 'diesel' as FuelType },
  { label: 'Eléctrico', value: 'electric' as FuelType },
  { label: 'Híbrido', value: 'hybrid' as FuelType },
];

const TRANSMISSION_OPTIONS = [
  { label: 'Manual', value: 'manual' as Transmission },
  { label: 'Automático', value: 'automatic' as Transmission },
  { label: 'CVT', value: 'cvt' as Transmission },
];

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vehicles, updateVehicle } = useVehiclesStore();
  const vehicle = vehicles.find((v) => v.id === id);
  const [isLoading, setIsLoading] = React.useState(false);

  const [make, setMake] = React.useState(vehicle?.make ?? '');
  const [model, setModel] = React.useState(vehicle?.model ?? '');
  const [trim, setTrim] = React.useState(vehicle?.trim ?? '');
  const [year, setYear] = React.useState(String(vehicle?.year ?? ''));
  const [color, setColor] = React.useState(vehicle?.color ?? '');
  const [licensePlate, setLicensePlate] = React.useState(vehicle?.licensePlate ?? '');
  const [vin, setVin] = React.useState(vehicle?.vin ?? '');
  const [mileage, setMileage] = React.useState(
    vehicle?.mileage != null ? String(Math.floor(vehicle.mileage)) : '',
  );
  const [fuelType, setFuelType] = React.useState<FuelType>(vehicle?.fuelType ?? 'gasoline');
  const [engine, setEngine] = React.useState(vehicle?.engine ?? '');
  const [transmission, setTransmission] = React.useState<Transmission>(vehicle?.transmission ?? 'manual');
  const [photos, setPhotos] = React.useState<string[]>(vehicle?.photos ?? []);
  const [notes, setNotes] = React.useState(vehicle?.notes ?? '');

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="muted">Vehículo no encontrado</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const normalizedMake = normalizeMake(make);
      const normalizedModel = normalizeModel(model, normalizedMake);
      const normalizedTrim = normalizeTrim(trim);
      await updateVehicle(id, {
        make: normalizedMake,
        model: normalizedModel,
        trim: normalizedTrim || undefined,
        year: parseInt(year, 10),
        color: color.trim() || undefined,
        licensePlate: licensePlate.trim().toUpperCase() || undefined,
        vin: vin.trim() || undefined,
        mileage: parseGroupedInteger(mileage),
        fuelType,
        engine: engine.trim() || undefined,
        transmission,
        photos,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title="Editar vehículo">
      <ImagePickerField label="Fotos" images={photos} onChange={setPhotos} maxImages={6} />

      <View className="gap-4">
        <VehicleMakeModelFields
          make={make}
          model={model}
          onMakeChange={setMake}
          onModelChange={setModel}
        />
        <VehicleTrimField make={make} model={model} trim={trim} onTrimChange={setTrim} />

        <View className="flex-row gap-3">
          <VehicleYearSelect value={year} onChange={setYear} className="flex-1" />
          <Input label="Color" value={color} onChangeText={setColor} containerClassName="flex-1" />
        </View>

        <View className="flex-row gap-3">
          <Input label="Patente" value={licensePlate} onChangeText={setLicensePlate} autoCapitalize="characters" containerClassName="flex-1" />
          <MileageInput
            label="Kilometraje *"
            value={mileage}
            onChangeValue={setMileage}
            containerClassName="flex-1"
          />
        </View>

        <Select label="Combustible" options={FUEL_OPTIONS} value={fuelType} onChange={setFuelType} />

        <View className="flex-row gap-3">
          <Input label="Motor" value={engine} onChangeText={setEngine} containerClassName="flex-1" />
          <Select label="Transmisión" options={TRANSMISSION_OPTIONS} value={transmission} onChange={setTransmission} className="flex-1" />
        </View>

        <Input label="VIN" value={vin} onChangeText={setVin} autoCapitalize="characters" />

        <Input
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          className="min-h-[88px] py-3"
        />
      </View>

      <Button onPress={handleSubmit} loading={isLoading} size="lg" className="mt-2">
        Guardar cambios
      </Button>
    </FormScreen>
  );
}
