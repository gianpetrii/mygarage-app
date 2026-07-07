import { Stack } from 'expo-router';
import { modalScreenOptions } from '@/constants/navigation';

export default function SetupRemindersLayout() {
  return (
    <Stack screenOptions={{ ...modalScreenOptions, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="custom" />
    </Stack>
  );
}
