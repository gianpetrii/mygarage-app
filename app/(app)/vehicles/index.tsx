import * as React from 'react';
import { View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/ui/empty-state';
import { AddVehicleCard, VehicleSummaryCard } from '@/components/vehicle/VehicleSummaryCard';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';

export default function VehiclesListScreen() {
  const { user } = useAuthStore();
  const { vehicles, isLoading, fetchVehicles } = useVehiclesStore();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (user) fetchVehicles(user.id);
  }, [user, fetchVehicles]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) await fetchVehicles(user.id);
    setRefreshing(false);
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="gap-1 mb-4">
        <Text variant="h1">Vehículos</Text>
        <Text variant="muted" className="text-sm">
          {vehicles.length === 0
            ? 'Agregá tu primer auto para empezar'
            : `${vehicles.length} ${vehicles.length === 1 ? 'vehículo' : 'vehículos'}`}
        </Text>
      </View>

      {vehicles.length === 0 && !isLoading ? (
        <View className="gap-4">
          <EmptyState
            brandIcon
            title="Sin vehículos"
            description="Centralizá services, recordatorios y comprobantes por auto"
          />
          <AddVehicleCard onPress={() => router.push('/(app)/vehicles/new')} />
        </View>
      ) : (
        <View className="gap-3">
          {vehicles.map((vehicle) => (
            <VehicleSummaryCard
              key={vehicle.id}
              vehicle={vehicle}
              showPhoto
              onPress={() => router.push(`/(app)/vehicles/${vehicle.id}`)}
            />
          ))}
          <AddVehicleCard onPress={() => router.push('/(app)/vehicles/new')} />
        </View>
      )}
    </Screen>
  );
}
