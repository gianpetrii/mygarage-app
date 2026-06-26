import * as React from 'react';
import { View, RefreshControl, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { VehicleSwitcher } from '@/components/vehicle/VehicleSwitcher';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthStore } from '@/store/useAuthStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { useTimeline } from '@/hooks/useTimeline';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useExpensesStore } from '@/store/useExpensesStore';
import { TIMELINE_TYPE_LABELS } from '@/lib/timeline';
import type { TimelineEntryType } from '@/types';
import { cn } from '@/lib/utils';
import { History } from 'lucide-react-native';
import { useRegisterSheet } from '@/contexts/RegisterSheetContext';

type FilterType = TimelineEntryType | 'all';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'maintenance', label: 'Service' },
  { key: 'fuel', label: 'Nafta' },
  { key: 'expense', label: 'Gastos' },
];

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { activeVehicle, fetchVehicles } = useActiveVehicle();
  const { open: openRegister } = useRegisterSheet();
  const { fetchRecords } = useMaintenanceStore();
  const { fetchEntries } = useFuelStore();
  const { fetchExpenses } = useExpensesStore();
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [refreshing, setRefreshing] = React.useState(false);
  const [filterVehicleId, setFilterVehicleId] = React.useState<string | null>(
    activeVehicle?.id ?? null,
  );

  React.useEffect(() => {
    if (activeVehicle?.id) setFilterVehicleId(activeVehicle.id);
  }, [activeVehicle?.id]);

  const { timeline } = useTimeline({
    vehicleId: filterVehicleId,
    type: filter,
  });

  const loadData = React.useCallback(async () => {
    if (!user) return;
    await Promise.all([
      fetchVehicles(user.id),
      fetchRecords(user.id),
      fetchEntries(user.id),
      fetchExpenses(user.id),
    ]);
  }, [user, fetchVehicles, fetchRecords, fetchEntries, fetchExpenses]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openDetail = (entry: { type: TimelineEntryType; id: string }) => {
    router.push(`/(app)/history/${entry.type}/${entry.id}`);
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="gap-1 mb-2">
        <Text variant="h1">Historial</Text>
        <Text variant="muted" className="text-sm">
          Services, cargas y gastos en un solo lugar
        </Text>
      </View>

      <VehicleSwitcher
        showAllOption
        onSelect={(v) => setFilterVehicleId(v?.id ?? null)}
      />

      <View className="flex-row flex-wrap gap-2 mt-2">
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3 py-1.5 border',
              filter === f.key ? 'bg-primary border-primary' : 'border-border bg-card',
            )}
          >
            <Text
              className={cn(
                'text-xs font-medium',
                filter === f.key ? 'text-primary-foreground' : 'text-foreground',
              )}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {timeline.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin registros todavía"
          description="Empezá con un service, una carga de nafta o un gasto"
          actionLabel="Registrar ahora"
          onAction={openRegister}
        />
      ) : (
        <View className="gap-3 mt-2">
          {timeline.map((entry) => (
            <TimelineItem
              key={`${entry.type}-${entry.id}`}
              entry={entry}
              onPress={() => openDetail(entry)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
