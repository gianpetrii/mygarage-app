import * as Notifications from 'expo-notifications';
import { BRAND } from '@/constants/brand';
import { useAuthStore } from '@/store/useAuthStore';
import type { ServiceReminder } from '@/types';

export function areReminderNotificationsEnabled(): boolean {
  const prefs = useAuthStore.getState().user?.preferences?.notifications;
  return prefs?.reminders !== false;
}

export async function scheduleReminderNotification(reminder: ServiceReminder): Promise<string | null> {
  if (!areReminderNotificationsEnabled()) {
    return null;
  }

  if (!reminder.targetDate || reminder.isCompleted || !reminder.isActive) {
    return null;
  }

  const triggerDate = new Date(reminder.targetDate);
  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Recordatorio — ${BRAND.name}`,
        body: reminder.title,
        data: { reminderId: reminder.id, vehicleId: reminder.vehicleId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return id;
  } catch {
    return null;
  }
}

export async function cancelReminderNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}

export async function cancelAllReminderNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
