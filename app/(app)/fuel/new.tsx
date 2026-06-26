import { Redirect, useLocalSearchParams } from 'expo-router';

export default function NewFuelEntryScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  return (
    <Redirect
      href={{
        pathname: '/(app)/add/fuel',
        params: vehicleId ? { vehicleId } : {},
      }}
    />
  );
}
