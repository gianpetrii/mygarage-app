import { Stack } from 'expo-router';
import { modalScreenOptions } from '@/constants/navigation';

export default function VehiclesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" options={modalScreenOptions} />
      <Stack.Screen name="edit" options={modalScreenOptions} />
    </Stack>
  );
}
