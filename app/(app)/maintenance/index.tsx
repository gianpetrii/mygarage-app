import { Redirect } from 'expo-router';

export default function MaintenanceIndexRedirect() {
  return <Redirect href="/(app)/history?filter=maintenance" />;
}
