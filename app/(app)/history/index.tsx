import * as React from 'react';
import { View, RefreshControl, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { VehicleSwitcher } from '@/components/vehicle/VehicleSwitcher';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { useAuthStore } from '@/store/useAuthStore';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { useTimeline } from '@/hooks/useTimeline';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useExpensesStore } from '@/store/useExpensesStore';
import type { TimelineEntryType } from '@/types';
import { cn } from '@/lib/utils';
import { History } from 'lucide-react-native';

type FilterType = 'all' | 'maintenance';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'maintenance', label: 'Service' },
];

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { activeVehicle, fetchVehicles } = useActiveVehicle();
  const { fetchRecords } = useMaintenanceStore();
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
      fetchExpenses(user.id),
    ]);
  }, [user, fetchVehicles, fetchRecords, fetchExpenses]);

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
          Services y mantenimientos del vehículo
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
        <View className="mt-6 items-center gap-4 rounded-xl border border-dashed border-border p-6">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-muted">
            <History size={24} color="#71717a" />
          </View>
          <View className="items-center gap-1">
            <Text className="font-semibold text-foreground">Sin registros todavía</Text>
            <Text variant="muted" className="text-center text-sm">
              Marcá un recordatorio como hecho o usá el botón + para registrar un arreglo
            </Text>
          </View>
        </View>
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
