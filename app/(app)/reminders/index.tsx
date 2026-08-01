import * as React from 'react';
import { View, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
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
import {
  partitionRemindersForList,
  isReminderOverdue,
  filterRemindersForActiveVehicle,
} from '@/lib/reminderUtils';

export default function RemindersListScreen() {
  const { user } = useAuthStore();
  const { reminders, fetchReminders } = useRemindersStore();
  const { vehicles, activeVehicle, fetchVehicles } = useActiveVehicle();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      fetchVehicles(user.id);
    }
  }, [user, fetchVehicles]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchReminders(user.id);
      }
    }, [user, fetchReminders]),
  );

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

  const vehicleReminders = filterRemindersForActiveVehicle(
    reminders,
    vehicles,
    activeVehicle?.id,
  );
  const { active, inactive, completed } = partitionRemindersForList(vehicleReminders);
  const hasAny = vehicleReminders.length > 0;
  const now = Date.now();

  const renderSection = (title: string, items: typeof active) =>
    items.length > 0 ? (
      <View className="gap-3">
        <Text className="text-sm font-semibold text-muted-foreground">{title}</Text>
        {items.map((r) => (
          <ReminderCard
            key={r.id}
            reminder={r}
            isOverdue={isReminderOverdue(r, now)}
            currentMileage={activeVehicle?.mileage}
            onPress={() => router.push(`/(app)/reminders/${r.id}`)}
          />
        ))}
      </View>
    ) : null;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="h1">Recordatorios</Text>
        {activeVehicle && (
          <Button size="sm" onPress={openAdd}>
            Agregar
          </Button>
        )}
      </View>

      <VehicleIdentityHeader />

      {hasAny ? (
        <Text variant="muted" className="text-xs mt-2 leading-5">
          Todos los avisos son opcionales. Tocá uno para editarlo, desactivarlo o eliminarlo.
        </Text>
      ) : null}

      {vehicles.length === 0 ? (
        <View className="mt-4">
          <EmptyState
            icon={Bell}
            title="Agregá un vehículo primero"
            description="Los recordatorios se configuran por auto"
            actionLabel="Agregar vehículo"
            onAction={() => router.push('/(app)/vehicles/new')}
          />
        </View>
      ) : !activeVehicle ? (
        <View className="mt-4">
          <EmptyState
            icon={Bell}
            title="Elegí un vehículo"
            description="Seleccioná el auto para ver y configurar sus recordatorios"
            actionLabel="Ver vehículos"
            onAction={() => router.push('/(app)/vehicles')}
          />
        </View>
      ) : !hasAny ? (
        <View className="mt-4">
          <EmptyState
            icon={Bell}
            title="Sin recordatorios"
            description="Configurá los avisos que te sirven para este vehículo"
            actionLabel="Empezar configuración"
            onAction={openSetup}
          />
        </View>
      ) : (
        <View className="gap-6 mt-4">
          {renderSection('Activos', active)}
          {renderSection('Desactivados', inactive)}
          {renderSection('Completados', completed)}
        </View>
      )}
    </Screen>
  );
}
