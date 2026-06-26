import { Redirect, useLocalSearchParams } from 'expo-router';

export default function NewMaintenanceScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  return (
    <Redirect
      href={{
        pathname: '/(app)/add/service',
        params: vehicleId ? { vehicleId } : {},
      }}
    />
  );
}
