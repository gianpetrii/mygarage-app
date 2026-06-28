import * as React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Wrench, DollarSign, Bell, Plus } from 'lucide-react-native';
import { KeyboardSheet } from '@/components/layout/KeyboardSheet';
import { Text } from '@/components/ui/text';
import { useRegisterSheet } from '@/contexts/RegisterSheetContext';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { useColorScheme } from '@/hooks/useColorScheme';

const ACTIONS = [
  {
    id: 'service',
    label: 'Service',
    description: 'Mantenimiento o reparación',
    icon: Wrench,
    route: '/(app)/add/service',
  },
  {
    id: 'expense',
    label: 'Gasto',
    description: 'Seguro, patente, peajes...',
    icon: DollarSign,
    route: '/(app)/add/expense',
  },
  {
    id: 'reminder',
    label: 'Recordatorio',
    description: 'VTV, service, seguro',
    icon: Bell,
    route: '/(app)/add/reminder',
  },
] as const;

function QuickRegisterSheet() {
  const { isOpen, close } = useRegisterSheet();
  const { activeVehicle } = useActiveVehicle();
  const { isDark } = useColorScheme();
  const iconColor = isDark ? '#fafafa' : '#18181b';

  const handleAction = (route: string) => {
    close();
    const params = activeVehicle ? { vehicleId: activeVehicle.id } : undefined;
    router.push({ pathname: route as never, params });
  };

  return (
    <KeyboardSheet visible={isOpen} onClose={close}>
      <View className="gap-1 mb-4">
        <Text variant="h3">Registrar</Text>
        <Text variant="muted" className="text-sm">
          {activeVehicle
            ? `${activeVehicle.make} ${activeVehicle.model}`
            : 'Seleccioná un vehículo al guardar'}
        </Text>
      </View>

      <View className="gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.id}
              onPress={() => handleAction(action.route)}
              className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Icon size={22} color={iconColor} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">{action.label}</Text>
                <Text variant="muted" className="text-xs">
                  {action.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </KeyboardSheet>
  );
}

export { QuickRegisterSheet };
