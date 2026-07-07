import { useLocalSearchParams } from 'expo-router';
import { CustomReminderForm } from '@/components/reminders/CustomReminderForm';

export default function RemindersCustomScreen() {
  const { vehicleId: vehicleIdParam, returnTo } = useLocalSearchParams<{
    vehicleId?: string;
    returnTo?: 'reminders';
  }>();
  const vehicleId = Array.isArray(vehicleIdParam) ? vehicleIdParam[0] : vehicleIdParam;
  const resolvedReturnTo = Array.isArray(returnTo) ? returnTo[0] : returnTo;

  return (
    <CustomReminderForm
      vehicleId={vehicleId}
      returnTo={resolvedReturnTo === 'reminders' ? 'reminders' : undefined}
    />
  );
}
