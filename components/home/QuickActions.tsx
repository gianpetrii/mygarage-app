import * as React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Wrench, Bell } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { useColorScheme } from '@/hooks/useColorScheme';

const ACTIONS = [
  { id: 'service', label: 'Service', icon: Wrench, route: '/(app)/add/service' },
  { id: 'reminder', label: 'Recordatorio', icon: Bell, route: '/(app)/add/reminder' },
] as const;

function QuickActions() {
  const { activeVehicle } = useActiveVehicle();
  const { isDark } = useColorScheme();
  const iconColor = isDark ? '#fafafa' : '#18181b';

  const navigate = (route: string) => {
    const params = activeVehicle ? { vehicleId: activeVehicle.id } : undefined;
    router.push({ pathname: route as never, params });
  };

  return (
    <View className="flex-row gap-2">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Pressable
            key={action.id}
            onPress={() => navigate(action.route)}
            className="flex-1 items-center gap-2 rounded-xl border border-border bg-card py-3 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Icon size={18} color={iconColor} />
            </View>
            <Text className="text-xs font-medium text-foreground">{action.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { QuickActions };
