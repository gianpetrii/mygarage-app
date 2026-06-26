import * as React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { FormScreen } from '@/components/layout/FormScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImagePickerField } from '@/components/ui/image-picker';
import { Text } from '@/components/ui/text';
import { VehicleMakeModelFields } from '@/components/vehicle/VehicleMakeModelFields';
import { VehicleYearSelect } from '@/components/vehicle/VehicleYearSelect';
import { MileageInput } from '@/components/vehicle/MileageInput';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { uploadVehiclePhoto } from '@/lib/uploads';
import { VehicleTrimField } from '@/components/vehicle/VehicleTrimField';
import { normalizeMake, normalizeModel, normalizeTrim } from '@/lib/vehicleCatalog';
import { parseGroupedInteger } from '@/lib/numberFormat';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';

export default function NewVehicleScreen() {
  const { user } = useAuthStore();
  const { addVehicle, updateVehicle } = useVehiclesStore();
  const { setActiveVehicle } = useActiveVehicle();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const [make, setMake] = React.useState('');
  const [model, setModel] = React.useState('');
  const [trim, setTrim] = React.useState('');
  const [year, setYear] = React.useState(String(new Date().getFullYear()));
  const [mileage, setMileage] = React.useState('');
  const [licensePlate, setLicensePlate] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!make.trim()) newErrors.make = 'La marca es requerida';
    if (!model.trim()) newErrors.model = 'El modelo es requerido';
    const yearNum = parseInt(year, 10);
    if (!year || isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      newErrors.year = 'Año inválido';
    }
    const mileageNum = parseGroupedInteger(mileage);
    if (!mileage || isNaN(mileageNum) || mileageNum < 0) {
      newErrors.mileage = 'Kilometraje inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (skipOptional = false) => {
    if (!validateStep1() || !user) return;
    setIsLoading(true);
    try {
      const normalizedMake = normalizeMake(make);
      const normalizedModel = normalizeModel(model, normalizedMake);
      const normalizedTrim = normalizeTrim(trim);
      const vehicleId = await addVehicle({
        userId: user.id,
        make: normalizedMake,
        model: normalizedModel,
        trim: normalizedTrim || undefined,
        year: parseInt(year, 10),
        mileage: parseGroupedInteger(mileage),
        fuelType: 'gasoline',
        transmission: 'manual',
        licensePlate: skipOptional ? undefined : licensePlate.trim().toUpperCase() || undefined,
        photos: [],
      });
      if (!skipOptional && photos.length > 0) {
        const remotePhotos = await Promise.all(
          photos.map((uri) => uploadVehiclePhoto(user.id, vehicleId, uri)),
        );
        await updateVehicle(vehicleId, { photos: remotePhotos });
      }
      const newVehicle = useVehiclesStore.getState().vehicles.find((v) => v.id === vehicleId);
      if (newVehicle) await setActiveVehicle(newVehicle);
      router.replace({
        pathname: '/(app)/vehicles/setup-reminders',
        params: { vehicleId },
      });
    } catch {
      Alert.alert('Error', 'No se pudo guardar el vehículo. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title={step === 1 ? 'Nuevo vehículo' : 'Datos opcionales'}>
      {step === 1 ? (
        <>
          <Text variant="muted" className="text-sm -mt-2 mb-2">
            Paso 1 de 2 — lo esencial para empezar
          </Text>
          <View className="gap-4">
            <VehicleMakeModelFields
              make={make}
              model={model}
              onMakeChange={setMake}
              onModelChange={setModel}
              errors={{ make: errors.make, model: errors.model }}
            />
            <VehicleTrimField make={make} model={model} trim={trim} onTrimChange={setTrim} />
            <View className="flex-row gap-3">
              <VehicleYearSelect
                value={year}
                onChange={setYear}
                error={errors.year}
                className="flex-1"
              />
              <MileageInput
                label="Kilometraje *"
                value={mileage}
                onChangeValue={setMileage}
                error={errors.mileage}
                containerClassName="flex-1"
              />
            </View>
          </View>
          <Button onPress={handleNext} size="lg" className="mt-2">
            Continuar
          </Button>
        </>
      ) : (
        <>
          <Text variant="muted" className="text-sm -mt-2 mb-2">
            Paso 2 de 2 — podés completarlo después desde el detalle
          </Text>
          <Input
            label="Patente"
            placeholder="AB123CD"
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
          />
          <ImagePickerField
            label="Foto del vehículo"
            images={photos}
            onChange={setPhotos}
            maxImages={1}
          />
          <Button onPress={() => handleSubmit(false)} loading={isLoading} size="lg" className="mt-2">
            Guardar vehículo
          </Button>
          <Button
            variant="ghost"
            onPress={() => handleSubmit(true)}
            loading={isLoading}
            className="mt-1"
          >
            Omitir y guardar
          </Button>
        </>
      )}
    </FormScreen>
  );
}
