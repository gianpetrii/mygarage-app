import { Stack } from 'expo-router';
import { modalScreenOptions } from '@/constants/navigation';

export default function RemindersLayout() {
  return (
    <Stack screenOptions={{ ...modalScreenOptions, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
