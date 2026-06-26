import { addMonths } from 'date-fns';
import type { ReminderPriority, ReminderType, ServiceReminder } from '@/types';

export function sortRemindersByUrgency(reminders: ServiceReminder[]): ServiceReminder[] {
  const now = Date.now();
  return [...reminders]
    .filter((r) => r.isActive && !r.isCompleted)
    .sort((a, b) => {
      const aOverdue = a.targetDate != null && a.targetDate <= now;
      const bOverdue = b.targetDate != null && b.targetDate <= now;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      const aDate = a.targetDate ?? Number.MAX_SAFE_INTEGER;
      const bDate = b.targetDate ?? Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
}

export function isReminderOverdue(reminder: ServiceReminder, now = Date.now()): boolean {
  return reminder.targetDate != null && reminder.targetDate <= now;
}

export const REMINDER_TEMPLATES = [
  { id: 'vtv', title: 'VTV', intervalMonths: 12, priority: 'high' as const },
  { id: 'oil', title: 'Cambio de aceite', intervalMonths: 6, intervalMileage: 10000, priority: 'medium' as const },
  { id: 'insurance', title: 'Seguro', intervalMonths: 12, priority: 'medium' as const },
] as const;

export type ReminderTemplateId = (typeof REMINDER_TEMPLATES)[number]['id'];

export const SETUP_REMINDER_OPTIONS = [
  { templateId: 'vtv' as const, label: 'VTV', description: 'Verificación técnica vehicular' },
  { templateId: 'oil' as const, label: 'Service', description: 'Cambio de aceite y filtros' },
  { templateId: 'insurance' as const, label: 'Seguro', description: 'Renovación de póliza' },
];

export function buildReminderFromTemplate(
  templateId: ReminderTemplateId,
  vehicleId: string,
  userId: string,
  vehicleMileage: number,
): Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'> | null {
  const template = REMINDER_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return null;

  let type: ReminderType = 'time';
  let targetDate: number | undefined;
  let targetMileage: number | undefined;

  if (template.intervalMonths) {
    targetDate = addMonths(new Date(), template.intervalMonths).getTime();
  }
  if ('intervalMileage' in template && template.intervalMileage) {
    targetMileage = vehicleMileage + template.intervalMileage;
    type = template.intervalMonths ? 'both' : 'mileage';
  }

  return {
    vehicleId,
    userId,
    title: template.title,
    description: '',
    type,
    targetDate,
    targetMileage,
    priority: template.priority as ReminderPriority,
    isCompleted: false,
    isActive: true,
  };
}
