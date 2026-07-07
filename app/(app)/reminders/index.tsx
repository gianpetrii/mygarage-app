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

  const openSetup = () => {
    if (!activeVehicle) return;
    router.push({
      pathname: '/(app)/setup-reminders',
      params: { vehicleId: activeVehicle.id },
    });
  };

  const openAdd = () => {
    if (!activeVehicle) return;
    router.push({
      pathname: '/(app)/reminders/add-catalog',
      params: { vehicleId: activeVehicle.id },
    });
  };

  const now = Date.now();
  const filtered = sortRemindersByUrgency(
    reminders.filter((r) => !activeVehicle || r.vehicleId === activeVehicle.id),
  );
  const hasReminders = filtered.length > 0;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="h1">Recordatorios</Text>
        {activeVehicle && hasReminders && (
          <Button size="sm" onPress={openAdd}>
            Agregar
          </Button>
        )}
      </View>

      <VehicleIdentityHeader />

      {filtered.length === 0 ? (
        <View className="mt-4">
          <EmptyState
            icon={Bell}
            title="Sin recordatorios activos"
            description="Configurá los avisos que te sirven para este vehículo"
            actionLabel="Empezar configuración"
            onAction={openSetup}
          />
        </View>
      ) : (
        <View className="gap-3 mt-4">
          {filtered.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              isOverdue={isReminderOverdue(r, now)}
              currentMileage={activeVehicle?.mileage}
              onPress={() => router.push(`/(app)/reminders/${r.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
