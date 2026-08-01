export type UserNotificationPrefs = {
  push?: boolean;
  reminders?: boolean;
};

export function areReminderNotificationsEnabled(
  notifications?: UserNotificationPrefs | null,
): boolean {
  return notifications?.reminders !== false;
}
