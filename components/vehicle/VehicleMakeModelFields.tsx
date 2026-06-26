import * as React from 'react';
import { View, Pressable } from 'react-native';
import { SearchableSelect } from '@/components/vehicle/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  VEHICLE_MAKES,
  OTHER_MAKE_VALUE,
  OTHER_MODEL_VALUE,
} from '@/constants/vehicles';
import {
  getModelsForMake,
  isKnownMake,
  isKnownModel,
} from '@/lib/vehicleCatalog';

interface VehicleMakeModelFieldsProps {
  make: string;
  model: string;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  errors?: { make?: string; model?: string };
}

function resolveMakeSelectValue(make: string): string {
  if (!make || !isKnownMake(make)) return '';
  return VEHICLE_MAKES.find((m) => m.toLowerCase() === make.toLowerCase()) ?? '';
}

function resolveModelSelectValue(make: string, model: string): string {
  if (!model || !isKnownModel(make, model)) return '';
  const models = getModelsForMake(make);
  return models.find((m) => m.toLowerCase() === model.toLowerCase()) ?? '';
}

function VehicleMakeModelFields({
  make,
  model,
  onMakeChange,
  onModelChange,
  errors,
}: VehicleMakeModelFieldsProps) {
  const [makeMode, setMakeMode] = React.useState<'catalog' | 'custom'>(() =>
    make && !isKnownMake(make) ? 'custom' : 'catalog',
  );
  const [makeSelectValue, setMakeSelectValue] = React.useState(() =>
    resolveMakeSelectValue(make),
  );

  const models = makeSelectValue ? getModelsForMake(makeSelectValue) : [];
  const [modelMode, setModelMode] = React.useState<'catalog' | 'custom'>(() =>
    model && make && !isKnownModel(make, model) ? 'custom' : 'catalog',
  );
  const [modelSelectValue, setModelSelectValue] = React.useState(() =>
    resolveModelSelectValue(make, model),
  );

  const makeOptions = React.useMemo(
    () => [
      ...VEHICLE_MAKES.map((m) => ({ label: m, value: m })),
      { label: 'Otra marca (escribir manualmente)', value: OTHER_MAKE_VALUE },
    ],
    [],
  );

  const modelOptions = React.useMemo(
    () => [
      ...models.map((m) => ({ label: m, value: m })),
      { label: 'Otro modelo (escribir manualmente)', value: OTHER_MODEL_VALUE },
    ],
    [models],
  );

  const handleMakeSelect = (value: string) => {
    if (value === OTHER_MAKE_VALUE) {
      setMakeMode('custom');
      setMakeSelectValue('');
      onMakeChange('');
      onModelChange('');
      setModelMode('custom');
      setModelSelectValue('');
      return;
    }
    setMakeMode('catalog');
    setMakeSelectValue(value);
    onMakeChange(value);
    onModelChange('');
    setModelMode('catalog');
    setModelSelectValue('');
  };

  const handleModelSelect = (value: string) => {
    if (value === OTHER_MODEL_VALUE) {
      setModelMode('custom');
      setModelSelectValue('');
      onModelChange('');
      return;
    }
    setModelMode('catalog');
    setModelSelectValue(value);
    onModelChange(value);
  };

  const showModelCatalog = makeMode === 'catalog' && !!makeSelectValue && models.length > 0;

  return (
    <View className="gap-4">
      {makeMode === 'catalog' ? (
        <SearchableSelect
          label="Marca *"
          placeholder="Seleccioná la marca"
          value={makeSelectValue || undefined}
          options={makeOptions}
          onChange={handleMakeSelect}
          error={errors?.make}
          searchPlaceholder="Buscar marca..."
        />
      ) : (
        <Input
          label="Marca *"
          placeholder="Ej. Toyota"
          value={make}
          onChangeText={(text) => {
            onMakeChange(text);
            onModelChange('');
          }}
          error={errors?.make}
          autoCapitalize="words"
        />
      )}

      {makeMode === 'custom' && (
        <Pressable
          onPress={() => {
            setMakeMode('catalog');
            onMakeChange('');
            onModelChange('');
          }}
          className="-mt-2"
        >
          <Text className="text-sm font-medium text-primary">Elegir de la lista</Text>
        </Pressable>
      )}

      {showModelCatalog && modelMode === 'catalog' ? (
        <SearchableSelect
          label="Modelo *"
          placeholder="Seleccioná el modelo"
          value={modelSelectValue || undefined}
          options={modelOptions}
          onChange={handleModelSelect}
          error={errors?.model}
          searchPlaceholder="Buscar modelo..."
        />
      ) : (
        <Input
          label="Modelo *"
          placeholder="Ej. Corolla"
          value={model}
          onChangeText={onModelChange}
          error={errors?.model}
          autoCapitalize="words"
          editable={!!make.trim() || makeMode === 'custom'}
          hint={
            !make.trim() && makeMode === 'catalog'
              ? 'Seleccioná una marca primero'
              : undefined
          }
        />
      )}

      {showModelCatalog && modelMode === 'custom' && (
        <Pressable
          onPress={() => {
            setModelMode('catalog');
            onModelChange('');
          }}
          className="-mt-2"
        >
          <Text className="text-sm font-medium text-primary">Elegir de la lista</Text>
        </Pressable>
      )}
    </View>
  );
}

export { VehicleMakeModelFields };
