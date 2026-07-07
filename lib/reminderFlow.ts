import {
  ALIGNMENT_TEMPLATE_ID,
  TIRES_TEMPLATE_ID,
  getReminderTypeForTemplate,
  type ReminderDraft,
  type ReminderTemplateId,
} from '@/lib/reminderUtils';

export function buildSelectedTemplateIds(
  selected: Set<ReminderTemplateId>,
  includeAlignmentWithTires: boolean,
): ReminderTemplateId[] {
  const ids = [...selected];
  if (
    selected.has(TIRES_TEMPLATE_ID) &&
    includeAlignmentWithTires &&
    !ids.includes(ALIGNMENT_TEMPLATE_ID)
  ) {
    ids.push(ALIGNMENT_TEMPLATE_ID);
  }
  return ids;
}

export function validateDrafts(drafts: ReminderDraft[]): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const draft of drafts) {
    const type = getReminderTypeForTemplate(draft.templateId);

    if ((type === 'time' || type === 'both') && !draft.targetDate) {
      errors[`${draft.templateId}-date`] = 'Fecha requerida';
    }
    if ((type === 'mileage' || type === 'both') && draft.targetMileage == null) {
      errors[`${draft.templateId}-mileage`] = 'Kilometraje requerido';
    }
  }

  return errors;
}
