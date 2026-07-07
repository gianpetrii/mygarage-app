import { useLocalSearchParams } from 'expo-router';
import { CustomReminderForm } from '@/components/reminders/CustomReminderForm';

export default function SetupCustomReminderScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicleId = Array.isArray(vehicleIdParam) ? vehicleIdParam[0] : vehicleIdParam;

  return <CustomReminderForm vehicleId={vehicleId} />;
}
