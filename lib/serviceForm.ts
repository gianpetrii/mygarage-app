import { addMonths } from 'date-fns';
import type { MaintenanceType } from '@/types';
import {
  getTemplateById,
  REMINDER_TEMPLATES,
  type ReminderTemplateId,
} from '@/lib/reminderUtils';

export type ServiceTemplateId = ReminderTemplateId | 'other';

export type ServiceScheduleMode = 'date' | 'mileage' | 'both';

const TEMPLATE_MAINTENANCE_TYPE: Record<ReminderTemplateId, MaintenanceType> = {
  vtv: 'inspection',
  oil: 'oil_change',
  insurance: 'other',
  patent: 'other',
  tires: 'tire_rotation',
  battery: 'other',
  brake_fluid: 'brake_service',
  alignment: 'tire_rotation',
};

export function getServiceScheduleMode(templateId: ServiceTemplateId): ServiceScheduleMode {
  if (templateId === 'other') return 'both';
  const template = getTemplateById(templateId);
  if (!template) return 'date';
  const hasDate = template.intervalMonths != null;
  const hasKm = 'intervalMileage' in template && template.intervalMileage != null;
  if (hasDate && hasKm) return 'both';
  if (hasKm) return 'mileage';
  return 'date';
}

export function getMaintenanceTypeForTemplate(templateId: ServiceTemplateId): MaintenanceType {
  if (templateId === 'other') return 'other';
  return TEMPLATE_MAINTENANCE_TYPE[templateId];
}

export function getServiceTemplateTitle(templateId: ServiceTemplateId): string {
  if (templateId === 'other') return '';
  return getTemplateById(templateId)?.title ?? '';
}

export function getNextScheduleLabels(templateId: ServiceTemplateId): {
  date?: string;
  mileage?: string;
  hint: string;
} {
  if (templateId === 'other') {
    return {
      date: 'Próximo vencimiento (fecha)',
      mileage: 'Próximo vencimiento (km)',
      hint: 'Opcional. Si completás fecha o km, se crea un recordatorio automático.',
    };
  }

  const mode = getServiceScheduleMode(templateId);
  const title = getServiceTemplateTitle(templateId).toLowerCase();

  if (mode === 'date') {
    return {
      date: `Próximo vencimiento de ${title}`,
      hint: 'Te sugerimos la fecha según el intervalo habitual. Podés ajustarla.',
    };
  }

  if (mode === 'mileage') {
    return {
      mileage: `Próximo ${title} (km)`,
      hint: 'Te sugerimos el km según el intervalo habitual. Podés ajustarlo.',
    };
  }

  return {
    date: `Próximo ${title} (fecha)`,
    mileage: `Próximo ${title} (km)`,
    hint: 'Te sugerimos fecha y km según el intervalo habitual. Podés ajustarlos.',
  };
}

export function buildSuggestedNextSchedule(
  templateId: ServiceTemplateId,
  currentMileage: number,
  fromDate = new Date(),
): { nextDate: Date | null; nextMileage: string } {
  if (templateId === 'other') {
    return { nextDate: null, nextMileage: '' };
  }

  const template = getTemplateById(templateId);
  if (!template) return { nextDate: null, nextMileage: '' };

  const nextDate =
    template.intervalMonths != null ? addMonths(fromDate, template.intervalMonths) : null;

  const intervalKm =
    'intervalMileage' in template && template.intervalMileage != null
      ? template.intervalMileage
      : null;

  const nextMileage =
    intervalKm != null && Number.isFinite(currentMileage)
      ? String(Math.floor(currentMileage + intervalKm))
      : '';

  return { nextDate, nextMileage };
}

export const SERVICE_QUICK_TEMPLATES = REMINDER_TEMPLATES;
