import { Stack } from 'expo-router';
import { modalScreenOptions } from '@/constants/navigation';

export default function AddLayout() {
  return (
    <Stack screenOptions={{ ...modalScreenOptions, headerShown: false }}>
      <Stack.Screen name="service" />
      <Stack.Screen name="fuel" />
      <Stack.Screen name="expense" />
      <Stack.Screen name="reminder" />
    </Stack>
  );
}
