import * as React from 'react';
import { View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/ui/vehicle-card';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';

export default function VehiclesListScreen() {
  const { user } = useAuthStore();
  const { vehicles, isLoading, fetchVehicles } = useVehiclesStore();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (user) fetchVehicles(user.id);
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) await fetchVehicles(user.id);
    setRefreshing(false);
  };

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-row items-center justify-between">
        <Text variant="h1">Mis vehículos</Text>
        <Button
          size="sm"
          onPress={() => router.push('/(app)/vehicles/new')}
          className="gap-1"
        >
          <Plus size={16} color="white" />
          Nuevo
        </Button>
      </View>

      {vehicles.length === 0 && !isLoading ? (
        <EmptyState
          brandIcon
          title="Sin vehículos"
          description="Agregá tu primer vehículo para comenzar a registrar servicios y gastos"
          actionLabel="Agregar vehículo"
          onAction={() => router.push('/(app)/vehicles/new')}
        />
      ) : (
        <View className="gap-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => {
                router.push(`/(app)/vehicles/${vehicle.id}`);
              }}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
