import * as React from 'react';
import { View, Pressable } from 'react-native';
import { SearchableSelect } from '@/components/vehicle/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { OTHER_VARIANT_VALUE } from '@/constants/vehicles';
import { getTrimOptions, isKnownTrim } from '@/lib/vehicleCatalog';

interface VehicleTrimFieldProps {
  make: string;
  model: string;
  trim: string;
  onTrimChange: (trim: string) => void;
}

function VehicleTrimField({ make, model, trim, onTrimChange }: VehicleTrimFieldProps) {
  const variants = React.useMemo(
    () => (make && model ? getTrimOptions(make, model) : []),
    [make, model],
  );
  const hasCatalog = variants.length > 0;

  const [mode, setMode] = React.useState<'catalog' | 'custom'>(() =>
    trim && make && model && !isKnownTrim(make, model, trim) ? 'custom' : 'catalog',
  );
  const [selectValue, setSelectValue] = React.useState(() => {
    if (!trim || !make || !model) return '';
    return variants.find((v) => v.toLowerCase() === trim.toLowerCase()) ?? '';
  });

  const prevMakeModel = React.useRef({ make: '', model: '' });

  React.useEffect(() => {
    const changed =
      prevMakeModel.current.make !== make || prevMakeModel.current.model !== model;
    if (changed && (prevMakeModel.current.make || prevMakeModel.current.model)) {
      setMode('catalog');
      setSelectValue('');
      onTrimChange('');
    }
    prevMakeModel.current = { make, model };
  }, [make, model, onTrimChange]);

  if (!make.trim() || !model.trim()) {
    return (
      <Input
        label="Versión (opcional)"
        placeholder="Seleccioná marca y modelo primero"
        value=""
        editable={false}
        hint="Ej: XEI, LTZ, Highline"
      />
    );
  }

  if (!hasCatalog) {
    return (
      <Input
        label="Versión (opcional)"
        placeholder="Ej: XEI, LTZ, Highline"
        value={trim}
        onChangeText={onTrimChange}
        autoCapitalize="words"
        hint="No hay lista para este modelo; podés escribir la versión"
      />
    );
  }

  const options = [
    ...variants.map((v) => ({ label: v, value: v })),
    { label: 'Otra versión (escribir manualmente)', value: OTHER_VARIANT_VALUE },
  ];

  const handleSelect = (value: string) => {
    if (value === OTHER_VARIANT_VALUE) {
      setMode('custom');
      setSelectValue('');
      onTrimChange('');
      return;
    }
    setMode('catalog');
    setSelectValue(value);
    onTrimChange(value);
  };

  return (
    <View className="gap-2">
      {mode === 'catalog' ? (
        <SearchableSelect
          label="Versión (opcional)"
          placeholder="Seleccioná la versión"
          value={selectValue || undefined}
          options={options}
          onChange={handleSelect}
          searchPlaceholder="Buscar versión..."
        />
      ) : (
        <Input
          label="Versión (opcional)"
          placeholder="Ej: XEI, LTZ, Highline"
          value={trim}
          onChangeText={onTrimChange}
          autoCapitalize="words"
        />
      )}
      {mode === 'custom' && (
        <Pressable
          onPress={() => {
            setMode('catalog');
            onTrimChange('');
          }}
        >
          <Text className="text-sm font-medium text-primary">Elegir de la lista</Text>
        </Pressable>
      )}
    </View>
  );
}

export { VehicleTrimField };
