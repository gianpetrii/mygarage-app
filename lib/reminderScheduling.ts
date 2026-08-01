import * as Notifications from 'expo-notifications';
import { BRAND } from '@/constants/brand';
import type { ServiceReminder } from '@/types';

export async function scheduleReminderNotification(
  reminder: ServiceReminder,
  remindersEnabled = true,
): Promise<string | null> {
  if (!remindersEnabled) {
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

export async function cancelNotificationsForReminder(reminderId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.content.data?.reminderId === reminderId)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // Sin permisos o plataforma sin soporte.
  }
}

export async function rescheduleReminderNotification(
  reminder: ServiceReminder,
  remindersEnabled = true,
): Promise<void> {
  await cancelNotificationsForReminder(reminder.id);
  await scheduleReminderNotification(reminder, remindersEnabled);
}

export async function syncAllReminderNotifications(
  reminders: ServiceReminder[],
  remindersEnabled = true,
): Promise<void> {
  if (!remindersEnabled) return;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
  } catch {
    return;
  }

  await cancelAllReminderNotifications();

  for (const reminder of reminders) {
    if (!reminder.isActive || reminder.isCompleted || !reminder.targetDate) continue;
    const triggerDate = new Date(reminder.targetDate);
    if (triggerDate.getTime() <= Date.now()) continue;
    await scheduleReminderNotification(reminder, remindersEnabled);
  }
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
