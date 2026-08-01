import { DEFAULT_CURRENCY } from '@/constants/currency';
import type { UserPreferences } from '@/types';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  currency: DEFAULT_CURRENCY,
  language: 'es',
  units: 'metric',
  notifications: {
    push: true,
    email: false,
    reminders: true,
  },
};

export function mergeUserPreferences(
  current?: UserPreferences,
): UserPreferences {
  return {
    ...DEFAULT_USER_PREFERENCES,
    ...current,
    notifications: {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...current?.notifications,
    },
  };
}
