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

export function isReminderMileageDue(
  reminder: ServiceReminder,
  currentMileage: number,
): boolean {
  return (
    reminder.targetMileage != null &&
    Number.isFinite(currentMileage) &&
    currentMileage >= reminder.targetMileage
  );
}

export const REMINDER_TEMPLATES = [
  { id: 'vtv', title: 'VTV', intervalMonths: 12, priority: 'high' as const },
  {
    id: 'oil',
    title: 'Cambio de aceite',
    intervalMonths: 6,
    intervalMileage: 10000,
    priority: 'medium' as const,
  },
  { id: 'insurance', title: 'Seguro', intervalMonths: 12, priority: 'medium' as const },
  { id: 'patent', title: 'Patente', intervalMonths: 12, priority: 'high' as const },
  {
    id: 'tires',
    title: 'Cubiertas',
    intervalMonths: 12,
    intervalMileage: 40000,
    priority: 'medium' as const,
  },
  { id: 'battery', title: 'Batería', intervalMonths: 24, priority: 'medium' as const },
  { id: 'brake_fluid', title: 'Líquido de frenos', intervalMonths: 24, priority: 'medium' as const },
  {
    id: 'alignment',
    title: 'Alineación y balanceo',
    intervalMileage: 15000,
    priority: 'low' as const,
  },
] as const;

export type ReminderTemplateId = (typeof REMINDER_TEMPLATES)[number]['id'];

export const TIRES_TEMPLATE_ID = 'tires' as const;
export const ALIGNMENT_TEMPLATE_ID = 'alignment' as const;

export type ReminderCatalogGroupId = 'essential' | 'maintenance';

export interface ReminderCatalogOption {
  templateId: ReminderTemplateId;
  label: string;
  description: string;
  group: ReminderCatalogGroupId;
}

export const REMINDER_CATALOG_GROUPS: { id: ReminderCatalogGroupId; title: string }[] = [
  { id: 'essential', title: 'Esenciales' },
  { id: 'maintenance', title: 'Mantenimiento' },
];

export const REMINDER_CATALOG_OPTIONS: ReminderCatalogOption[] = [
  {
    templateId: 'vtv',
    label: 'VTV',
    description: 'Verificación técnica vehicular',
    group: 'essential',
  },
  {
    templateId: 'oil',
    label: 'Service',
    description: 'Cambio de aceite y filtros',
    group: 'essential',
  },
  {
    templateId: 'insurance',
    label: 'Seguro',
    description: 'Renovación de póliza',
    group: 'essential',
  },
  {
    templateId: 'patent',
    label: 'Patente',
    description: 'Impuesto automotor y renovación',
    group: 'maintenance',
  },
  {
    templateId: 'tires',
    label: 'Cubiertas',
    description: 'Revisar desgaste y presión',
    group: 'maintenance',
  },
  {
    templateId: 'battery',
    label: 'Batería',
    description: 'Revisar carga y estado',
    group: 'maintenance',
  },
  {
    templateId: 'brake_fluid',
    label: 'Líquido de frenos',
    description: 'Cambio cada 2 años aprox.',
    group: 'maintenance',
  },
  {
    templateId: 'alignment',
    label: 'Alineación y balanceo',
    description: 'Recomendado al cambiar cubiertas',
    group: 'maintenance',
  },
];

/** @deprecated Usar REMINDER_CATALOG_OPTIONS */
export const SETUP_RECOMMENDED_REMINDER_OPTIONS = REMINDER_CATALOG_OPTIONS.filter(
  (o) => o.group === 'essential',
);
/** @deprecated Usar REMINDER_CATALOG_OPTIONS */
export const SETUP_OPTIONAL_REMINDER_OPTIONS = REMINDER_CATALOG_OPTIONS.filter(
  (o) => o.group === 'maintenance' && o.templateId !== 'brake_fluid' && o.templateId !== 'alignment',
);
/** @deprecated Usar REMINDER_CATALOG_OPTIONS */
export const SETUP_EXTRA_REMINDER_OPTIONS = REMINDER_CATALOG_OPTIONS.filter(
  (o) => o.templateId === 'brake_fluid' || o.templateId === 'alignment',
);
/** @deprecated Usar REMINDER_CATALOG_OPTIONS */
export const SETUP_REMINDER_OPTIONS = SETUP_RECOMMENDED_REMINDER_OPTIONS;

export const DEFAULT_SETUP_TEMPLATE_IDS: ReminderTemplateId[] = ['vtv', 'oil', 'insurance'];

export interface ReminderDraft {
  templateId: ReminderTemplateId;
  targetDate?: Date;
  targetMileage?: number;
}

export function getTemplateById(templateId: ReminderTemplateId) {
  return REMINDER_TEMPLATES.find((t) => t.id === templateId);
}

export function getReminderTypeForTemplate(templateId: ReminderTemplateId): ReminderType {
  const template = getTemplateById(templateId);
  if (!template) return 'time';
  const hasMonths = 'intervalMonths' in template && !!template.intervalMonths;
  const hasMileage = 'intervalMileage' in template && !!template.intervalMileage;
  if (hasMonths && hasMileage) return 'both';
  if (hasMileage) return 'mileage';
  return 'time';
}

export function getDefaultDraft(
  templateId: ReminderTemplateId,
  vehicleMileage: number,
): ReminderDraft {
  const template = getTemplateById(templateId);
  const mileage = Number.isFinite(vehicleMileage) ? vehicleMileage : 0;
  const draft: ReminderDraft = { templateId };

  if (template && 'intervalMonths' in template && template.intervalMonths) {
    draft.targetDate = addMonths(new Date(), template.intervalMonths);
  }
  if (template && 'intervalMileage' in template && template.intervalMileage) {
    draft.targetMileage = mileage + template.intervalMileage;
  }

  return draft;
}

export function buildDefaultDrafts(
  templateIds: ReminderTemplateId[],
  vehicleMileage: number,
): ReminderDraft[] {
  return templateIds.map((id) => getDefaultDraft(id, vehicleMileage));
}

export function reminderMatchesTemplate(
  reminder: ServiceReminder,
  templateId: ReminderTemplateId,
): boolean {
  const template = getTemplateById(templateId);
  if (!template) return false;
  return reminder.title === template.title && reminder.isActive && !reminder.isCompleted;
}

export function getActiveTemplateIdsForVehicle(
  reminders: ServiceReminder[],
  vehicleId: string,
): ReminderTemplateId[] {
  return REMINDER_TEMPLATES.filter((t) =>
    reminders.some((r) => r.vehicleId === vehicleId && reminderMatchesTemplate(r, t.id)),
  ).map((t) => t.id);
}

export function buildReminderFromDraft(
  draft: ReminderDraft,
  vehicleId: string,
  userId: string,
): Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'> | null {
  const template = getTemplateById(draft.templateId);
  if (!template) return null;

  const type = getReminderTypeForTemplate(draft.templateId);
  const targetDate =
    type !== 'mileage' && draft.targetDate ? draft.targetDate.getTime() : undefined;
  const targetMileage =
    type !== 'time' && draft.targetMileage != null ? draft.targetMileage : undefined;

  return {
    vehicleId,
    userId,
    title: template.title,
    description: '',
    type,
    ...(targetDate != null ? { targetDate } : {}),
    ...(targetMileage != null ? { targetMileage } : {}),
    ...('intervalMonths' in template && template.intervalMonths
      ? { intervalMonths: template.intervalMonths }
      : {}),
    ...('intervalMileage' in template && template.intervalMileage
      ? { intervalMileage: template.intervalMileage }
      : {}),
    priority: template.priority as ReminderPriority,
    isCompleted: false,
    isActive: true,
  };
}

/** @deprecated Usar buildReminderFromDraft */
export function buildReminderFromTemplate(
  templateId: ReminderTemplateId,
  vehicleId: string,
  userId: string,
  vehicleMileage: number,
): Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'> | null {
  return buildReminderFromDraft(getDefaultDraft(templateId, vehicleMileage), vehicleId, userId);
}

export function recalculateAfterComplete(
  reminder: ServiceReminder,
  completedDate: number,
  completedMileage: number,
): Partial<Omit<ServiceReminder, 'id' | 'userId' | 'createdAt'>> {
  const updates: Partial<Omit<ServiceReminder, 'id' | 'userId' | 'createdAt'>> = {
    isCompleted: false,
    isActive: true,
    lastCompletedDate: completedDate,
    lastCompletedMileage: completedMileage,
  };

  if (reminder.intervalMonths) {
    updates.targetDate = addMonths(new Date(completedDate), reminder.intervalMonths).getTime();
  }
  if (reminder.intervalMileage != null) {
    updates.targetMileage = completedMileage + reminder.intervalMileage;
  }

  if (!reminder.intervalMonths && !reminder.intervalMileage) {
    updates.isCompleted = true;
    updates.isActive = false;
  }

  return updates;
}

export async function createRemindersFromDrafts(
  drafts: ReminderDraft[],
  vehicleId: string,
  userId: string,
  addReminder: (
    data: Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<string>,
  scheduleNotification: (reminder: ServiceReminder) => Promise<string | null>,
): Promise<{ count: number; failed: ReminderTemplateId[] }> {
  let count = 0;
  const failed: ReminderTemplateId[] = [];

  for (const draft of drafts) {
    const data = buildReminderFromDraft(draft, vehicleId, userId);
    if (!data) {
      failed.push(draft.templateId);
      continue;
    }

    try {
      const id = await addReminder(data);
      count += 1;

      if (data.targetDate) {
        try {
          await scheduleNotification({
            ...data,
            id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        } catch {
          // El recordatorio queda guardado aunque falle la notificación local.
        }
      }
    } catch {
      failed.push(draft.templateId);
    }
  }

  return { count, failed };
}

/** @deprecated Usar createRemindersFromDrafts */
export async function createRemindersFromTemplates(
  templateIds: ReminderTemplateId[],
  vehicleId: string,
  userId: string,
  vehicleMileage: number,
  addReminder: (
    data: Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<string>,
  scheduleNotification: (reminder: ServiceReminder) => Promise<string | null>,
): Promise<{ count: number; failed: ReminderTemplateId[] }> {
  return createRemindersFromDrafts(
    buildDefaultDrafts(templateIds, vehicleMileage),
    vehicleId,
    userId,
    addReminder,
    scheduleNotification,
  );
}
