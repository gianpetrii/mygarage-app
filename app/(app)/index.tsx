import * as React from 'react';
import { View, RefreshControl, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { AppEngineIcon } from '@/components/brand/AppEngineIcon';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { VehicleIdentityHeader } from '@/components/vehicle/VehicleIdentityHeader';
import { ReminderHero } from '@/components/reminders/ReminderHero';
import { ReminderCard } from '@/components/reminders/ReminderCard';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { SetupChecklist } from '@/components/home/SetupChecklist';
import { QuickActions } from '@/components/home/QuickActions';
import { useAuthStore } from '@/store/useAuthStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { useTimeline } from '@/hooks/useTimeline';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useExpensesStore } from '@/store/useExpensesStore';
import { sortRemindersByUrgency, isReminderOverdue } from '@/lib/reminderUtils';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { vehicles, activeVehicle, fetchVehicles } = useActiveVehicle();
  const { reminders, fetchReminders, completeReminder } = useRemindersStore();
  const { fetchRecords } = useMaintenanceStore();
  const { fetchEntries } = useFuelStore();
  const { fetchExpenses } = useExpensesStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!user) return;
    await Promise.all([
      fetchVehicles(user.id),
      fetchRecords(user.id),
      fetchReminders(user.id),
      fetchExpenses(user.id),
      fetchEntries(user.id),
    ]);
  }, [user, fetchVehicles, fetchRecords, fetchReminders, fetchExpenses, fetchEntries]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    (async () => {
      if (!user || vehicles.length > 0) return;
      const seen = await storage.get<boolean>(STORAGE_KEYS.ONBOARDING_SEEN);
      if (!seen) {
        router.push('/(app)/onboarding');
      }
    })();
  }, [user, vehicles.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const now = Date.now();

  const vehicleReminders = sortRemindersByUrgency(
    reminders.filter((r) => !activeVehicle || r.vehicleId === activeVehicle.id),
  );
  const heroReminder = vehicleReminders[0];
  const nextReminders = vehicleReminders.slice(1, 4);
  const hasReminders = vehicleReminders.length > 0;

  const { timeline } = useTimeline({
    vehicleId: activeVehicle?.id,
    limit: 3,
  });
  const hasHistory = timeline.length > 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleComplete = async (reminderId: string) => {
    const r = reminders.find((x) => x.id === reminderId);
    if (!r || !activeVehicle) return;
    await completeReminder(reminderId, Date.now(), activeVehicle.mileage);
  };

  const openSetupReminders = () => {
    if (!activeVehicle) return;
    router.push({
      pathname: '/(app)/vehicles/setup-reminders',
      params: { vehicleId: activeVehicle.id },
    });
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="gap-2 mb-1">
        <Text variant="muted">
          {greeting()}
          {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </Text>
        <Text variant="h1">Inicio</Text>
      </View>

      {vehicles.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-border p-8 items-center gap-3 mt-4">
          <AppEngineIcon size={48} />
          <Text variant="h3" className="text-center">Agregá tu primer vehículo</Text>
          <Text variant="muted" className="text-center text-sm">
            Centralizá services, comprobantes y recordatorios en un solo lugar
          </Text>
          <Text
            className="text-primary font-semibold mt-2"
            onPress={() => router.push('/(app)/vehicles/new')}
          >
            Agregar vehículo →
          </Text>
        </View>
      ) : (
        <View className="gap-5 mt-2">
          <VehicleIdentityHeader />

          {heroReminder ? (
            <ReminderHero
              reminder={heroReminder}
              isOverdue={isReminderOverdue(heroReminder, now)}
              onViewAll={() => router.push('/(app)/reminders')}
              onComplete={() => handleComplete(heroReminder.id)}
            />
          ) : (
            <View className="rounded-2xl border border-border bg-card p-5 gap-3">
              <View className="flex-row items-center gap-2">
                <Bell size={20} color="#71717a" />
                <Text variant="h3">Sin recordatorios activos</Text>
              </View>
              <Text variant="muted" className="text-sm">
                Configurá VTV, service y seguro para no olvidarte de nada
              </Text>
              <Button onPress={openSetupReminders} size="sm" className="self-start">
                Configurar recordatorios
              </Button>
            </View>
          )}

          <QuickActions />

          {activeVehicle && (
            <SetupChecklist
              vehicle={activeVehicle}
              hasReminders={hasReminders}
              hasHistory={hasHistory}
              onSetupReminders={openSetupReminders}
              onRegisterService={() =>
                router.push({
                  pathname: '/(app)/add/service',
                  params: { vehicleId: activeVehicle.id },
                })
              }
              onAddPhoto={() => router.push(`/(app)/vehicles/${activeVehicle.id}`)}
            />
          )}

          {nextReminders.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="h3">Próximos</Text>
                <Pressable onPress={() => router.push('/(app)/reminders')}>
                  <Text variant="small" className="text-primary">
                    Ver todos
                  </Text>
                </Pressable>
              </View>
              {nextReminders.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  isOverdue={isReminderOverdue(r, now)}
                  compact
                  onPress={() => router.push(`/(app)/reminders/${r.id}`)}
                />
              ))}
            </View>
          )}

          {timeline.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="h3">Última actividad</Text>
                <Pressable onPress={() => router.push('/(app)/history')}>
                  <Text variant="small" className="text-primary">
                    Ver historial
                  </Text>
                </Pressable>
              </View>
              {timeline.map((entry) => (
                <TimelineItem
                  key={`${entry.type}-${entry.id}`}
                  entry={entry}
                  onPress={() => router.push(`/(app)/history/${entry.type}/${entry.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}
