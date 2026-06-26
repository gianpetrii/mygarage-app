import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FormScreen } from '@/components/layout/FormScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useAuthStore } from '@/store/useAuthStore';
import { useExpensesStore } from '@/store/useExpensesStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { EXPENSE_CATEGORY_LABELS } from '@/constants/domain';
import type { ExpenseCategory } from '@/types';

const CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
  label,
  value: value as ExpenseCategory,
}));

export default function AddExpenseScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const { user } = useAuthStore();
  const { addExpense } = useExpensesStore();
  const { vehicles, activeVehicle } = useActiveVehicle();
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model} (${v.year})`,
    value: v.id,
  }));

  const [vehicleId, setVehicleId] = React.useState(
    vehicleIdParam ?? activeVehicle?.id ?? vehicles[0]?.id ?? '',
  );
  const [category, setCategory] = React.useState<ExpenseCategory>('insurance');
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [vendor, setVendor] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if (!amount || isNaN(parseFloat(amount))) newErrors.amount = 'Monto inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      await addExpense({
        vehicleId,
        userId: user.id,
        category,
        title: title.trim(),
        amount: parseFloat(amount),
        date: date.getTime(),
        vendor: vendor.trim() || undefined,
        isRecurring: false,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el gasto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormScreen title="Nuevo gasto">
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

        <Select label="Categoría" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />

        <Input label="Título *" value={title} onChangeText={setTitle} error={errors.title} />

        <Input
          label="Monto *"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          error={errors.amount}
        />

        <DatePicker label="Fecha" value={date} onChange={setDate} maximumDate={new Date()} />

        <Input label="Proveedor" value={vendor} onChangeText={setVendor} />
      </View>

      <Button onPress={handleSubmit} loading={isLoading} size="lg">
        Guardar gasto
      </Button>
    </FormScreen>
  );
}
