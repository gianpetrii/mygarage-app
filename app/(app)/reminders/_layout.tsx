import { Stack } from 'expo-router';
import { modalScreenOptions } from '@/constants/navigation';

export default function RemindersLayout() {
  return (
    <Stack screenOptions={{ ...modalScreenOptions, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-catalog" />
      <Stack.Screen name="custom" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
