import * as React from 'react';
import { View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ReminderCard } from '@/components/reminders/ReminderCard';
import { EmptyState } from '@/components/ui/empty-state';
import { VehicleIdentityHeader } from '@/components/vehicle/VehicleIdentityHeader';
import { useAuthStore } from '@/store/useAuthStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { sortRemindersByUrgency, isReminderOverdue } from '@/lib/reminderUtils';

export default function RemindersListScreen() {
  const { user } = useAuthStore();
  const { reminders, fetchReminders } = useRemindersStore();
  const { activeVehicle, fetchVehicles } = useActiveVehicle();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      fetchVehicles(user.id);
      fetchReminders(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await Promise.all([fetchVehicles(user.id), fetchReminders(user.id)]);
    setRefreshing(false);
  };

  const now = Date.now();
  const filtered = sortRemindersByUrgency(
    reminders.filter((r) => !activeVehicle || r.vehicleId === activeVehicle.id),
  );

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="h1">Recordatorios</Text>
        <Button size="sm" onPress={() => router.push('/(app)/add/reminder')}>
          Nuevo
        </Button>
      </View>

      <VehicleIdentityHeader />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sin recordatorios"
          description="Configurá VTV, service y seguro para este vehículo"
          actionLabel="Configurar recordatorios"
          onAction={() => {
            if (activeVehicle) {
              router.push({
                pathname: '/(app)/vehicles/setup-reminders',
                params: { vehicleId: activeVehicle.id },
              });
            } else {
              router.push('/(app)/add/reminder');
            }
          }}
        />
      ) : (
        <View className="gap-3 mt-4">
          {filtered.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              isOverdue={isReminderOverdue(r, now)}
              onPress={() => router.push(`/(app)/reminders/${r.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
