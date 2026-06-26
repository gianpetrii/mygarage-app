import * as Notifications from 'expo-notifications';
import type { ServiceReminder } from '@/types';

export async function scheduleReminderNotification(reminder: ServiceReminder): Promise<string | null> {
  if (!reminder.targetDate || reminder.isCompleted || !reminder.isActive) {
    return null;
  }

  const triggerDate = new Date(reminder.targetDate);
  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio — CarLogger',
      body: reminder.title,
      data: { reminderId: reminder.id, vehicleId: reminder.vehicleId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return id;
}

export async function cancelReminderNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
