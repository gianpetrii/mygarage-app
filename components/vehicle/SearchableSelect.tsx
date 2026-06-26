import * as React from 'react';
import {
  View,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  type ViewProps,
} from 'react-native';
import { ChevronDown, Check, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

export interface SearchableSelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps extends ViewProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  error?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  /** Solo dígitos en el campo de búsqueda (ej. año). */
  numericSearch?: boolean;
}

function SearchableSelect({
  label,
  placeholder = 'Seleccioná una opción',
  value,
  options,
  onChange,
  error,
  searchPlaceholder = 'Buscar...',
  disabled = false,
  numericSearch = false,
  className,
  ...props
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const insets = useSafeAreaInsets();
  const selected = options.find((o) => o.value === value);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const handleSearchChange = (text: string) => {
    setQuery(numericSearch ? text.replace(/\D/g, '') : text);
  };

  const openModal = () => {
    if (disabled) return;
    setQuery('');
    setOpen(true);
  };

  return (
    <View className={cn('w-full gap-1.5', className)} {...props}>
      {label && (
        <Text variant="small" className="font-medium text-foreground">
          {label}
        </Text>
      )}
      <Pressable
        onPress={openModal}
        disabled={disabled}
        className={cn(
          'flex-row items-center min-h-12 rounded-lg border bg-transparent px-3',
          error ? 'border-destructive' : 'border-input',
          disabled && 'opacity-50',
        )}
      >
        <Text
          className={cn(
            'flex-1 text-base',
            selected ? 'text-foreground' : 'text-muted-foreground',
          )}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#71717a" />
      </Pressable>
      {error && (
        <Text variant="small" className="text-destructive">
          {error}
        </Text>
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/50" onPress={() => setOpen(false)} />
          <View
            className="bg-background rounded-t-3xl px-4 pt-4 max-h-[80%]"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
          >
            <View className="w-12 h-1 rounded-full bg-border self-center mb-4" />
            {label && <Text variant="h3" className="mb-3">{label}</Text>}

            <View className="flex-row items-center min-h-11 rounded-lg border border-input px-3 mb-3 gap-2">
              <Search size={18} color="#71717a" />
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder={searchPlaceholder}
                placeholderTextColor="#71717a"
                value={query}
                onChangeText={handleSearchChange}
                keyboardType={numericSearch ? 'number-pad' : 'default'}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text variant="muted" className="py-6 text-center">
                  Sin resultados
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  className="flex-row items-center py-3.5 px-2 border-b border-border/50"
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    className={cn(
                      'flex-1 text-base',
                      item.value === value ? 'text-primary font-semibold' : 'text-foreground',
                    )}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Check size={18} color="#18181b" />}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export { SearchableSelect };
