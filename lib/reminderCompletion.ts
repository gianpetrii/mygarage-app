import { getMaintenanceTypeForTemplate } from '@/lib/serviceForm';
import { REMINDER_TEMPLATES } from '@/lib/reminderUtils';
import type { MaintenanceRecord, MaintenanceType, ServiceReminder } from '@/types';

export interface ReminderCompleteExtras {
  cost?: number;
  photos?: string[];
  notes?: string;
  serviceProvider?: string;
}

function getMaintenanceTypeForReminderTitle(title: string): MaintenanceType {
  const template = REMINDER_TEMPLATES.find((t) => t.title === title);
  if (!template) return 'other';
  return getMaintenanceTypeForTemplate(template.id);
}

export function buildMaintenanceFromReminderComplete(
  reminder: ServiceReminder,
  completedDate: number,
  completedMileage: number,
  extras?: ReminderCompleteExtras,
): Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> {
  const cost = extras?.cost;
  const photos = extras?.photos ?? [];
  const notes = extras?.notes?.trim();
  const serviceProvider = extras?.serviceProvider?.trim();

  return {
    vehicleId: reminder.vehicleId,
    userId: reminder.userId,
    type: getMaintenanceTypeForReminderTitle(reminder.title),
    title: reminder.title,
    description: reminder.description,
    date: completedDate,
    mileage: completedMileage,
    cost: cost != null && Number.isFinite(cost) ? cost : 0,
    parts: [],
    photos,
    ...(serviceProvider ? { serviceProvider } : {}),
    ...(notes ? { notes } : {}),
  };
}
