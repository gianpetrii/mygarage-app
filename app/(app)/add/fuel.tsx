import * as React from 'react';
import { View, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FormScreen } from '@/components/layout/FormScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/useAuthStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';

export default function AddFuelScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const { user } = useAuthStore();
  const { addEntry } = useFuelStore();
  const { vehicles, activeVehicle } = useActiveVehicle();
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model} (${v.year})`,
    value: v.id,
  }));

  const [vehicleId, setVehicleId] = React.useState(
    vehicleIdParam ?? activeVehicle?.id ?? vehicles[0]?.id ?? '',
  );
  const [date, setDate] = React.useState(new Date());
  const [mileage, setMileage] = React.useState(String(activeVehicle?.mileage ?? ''));
  const [liters, setLiters] = React.useState('');
  const [pricePerLiter, setPricePerLiter] = React.useState('');
  const [gasStation, setGasStation] = React.useState('');
  const [isFullTank, setIsFullTank] = React.useState(true);
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const totalCost = React.useMemo(() => {
    const l = parseFloat(liters);
    const p = parseFloat(pricePerLiter);
    return !isNaN(l) && !isNaN(p) ? l * p : 0;
  }, [liters, pricePerLiter]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (!mileage || isNaN(parseFloat(mileage))) newErrors.mileage = 'Kilometraje inválido';
    if (!liters || isNaN(parseFloat(liters)) || parseFloat(liters) <= 0) newErrors.liters = 'Litros inválidos';
    if (!pricePerLiter || isNaN(parseFloat(pricePerLiter))) newErrors.pricePerLiter = 'Precio inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      await addEntry({
        vehicleId,
        userId: user.id,
        date: date.getTime(),
        mileage: parseFloat(mileage),
        liters: parseFloat(liters),
        pricePerLiter: parseFloat(pricePerLiter),
        totalCost,
        gasStation: gasStation.trim() || undefined,
        isFullTank,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la carga.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title="Cargar nafta">
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

        <DatePicker label="Fecha" value={date} onChange={setDate} maximumDate={new Date()} />

        <Input
          label="Kilometraje *"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
          error={errors.mileage}
        />

        <View className="flex-row gap-3">
          <Input
            label="Litros *"
            value={liters}
            onChangeText={setLiters}
            keyboardType="decimal-pad"
            error={errors.liters}
            containerClassName="flex-1"
          />
          <Input
            label="Precio/L *"
            value={pricePerLiter}
            onChangeText={setPricePerLiter}
            keyboardType="decimal-pad"
            error={errors.pricePerLiter}
            containerClassName="flex-1"
          />
        </View>

        {totalCost > 0 && (
          <View className="rounded-xl bg-muted px-4 py-3">
            <Text variant="muted" className="text-xs">Total</Text>
            <Text className="text-lg font-bold">
              ${totalCost.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </Text>
          </View>
        )}

        <Input label="Estación" value={gasStation} onChangeText={setGasStation} />

        <Pressable onPress={() => setIsFullTank(!isFullTank)} className="flex-row items-center gap-3">
          <View
            className={`h-5 w-5 rounded border-2 items-center justify-center ${
              isFullTank ? 'bg-primary border-primary' : 'border-input'
            }`}
          >
            {isFullTank && <Text className="text-primary-foreground text-xs font-bold">✓</Text>}
          </View>
          <Text>Tanque lleno</Text>
        </Pressable>

        <Input label="Notas" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />
      </View>

      <Button onPress={handleSubmit} loading={isLoading} size="lg">
        Guardar carga
      </Button>
    </FormScreen>
  );
}
