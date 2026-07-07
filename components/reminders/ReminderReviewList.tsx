import * as React from 'react';
import { View } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Text } from '@/components/ui/text';
import { DatePicker } from '@/components/ui/date-picker';
import { MileageInput } from '@/components/vehicle/MileageInput';
import { parseGroupedInteger } from '@/lib/numberFormat';
import {
  getReminderTypeForTemplate,
  getTemplateById,
  REMINDER_CATALOG_OPTIONS,
  type ReminderDraft,
} from '@/lib/reminderUtils';

interface ReminderReviewListProps {
  drafts: ReminderDraft[];
  onChange: (drafts: ReminderDraft[]) => void;
  errors?: Record<string, string>;
}

function getLabel(templateId: ReminderDraft['templateId']): string {
  return (
    REMINDER_CATALOG_OPTIONS.find((o) => o.templateId === templateId)?.label ??
    getTemplateById(templateId)?.title ??
    templateId
  );
}

function ReminderReviewList({ drafts, onChange, errors = {} }: ReminderReviewListProps) {
  const updateDraft = (index: number, patch: Partial<ReminderDraft>) => {
    const next = drafts.map((draft, i) => (i === index ? { ...draft, ...patch } : draft));
    onChange(next);
  };

  return (
    <View className="gap-4">
      {drafts.map((draft, index) => {
        const type = getReminderTypeForTemplate(draft.templateId);
        const template = getTemplateById(draft.templateId);
        const dateKey = `${draft.templateId}-date`;
        const mileageKey = `${draft.templateId}-mileage`;

        return (
          <View key={`${draft.templateId}-${index}`} className="rounded-xl border border-border bg-card p-4 gap-3">
            <Text className="font-semibold text-foreground">{getLabel(draft.templateId)}</Text>

            {(type === 'time' || type === 'both') && draft.targetDate && (
              <DatePicker
                label="Próximo vencimiento"
                value={draft.targetDate}
                onChange={(date) => updateDraft(index, { targetDate: date })}
                error={errors[dateKey]}
              />
            )}

            {(type === 'mileage' || type === 'both') && (
              <MileageInput
                label="Kilometraje objetivo"
                value={
                  draft.targetMileage != null ? String(Math.floor(draft.targetMileage)) : ''
                }
                onChangeValue={(raw) => {
                  const parsed = parseGroupedInteger(raw);
                  updateDraft(index, {
                    targetMileage: raw ? parsed : undefined,
                  });
                }}
                error={errors[mileageKey]}
              />
            )}

            {template && (
              <Text variant="muted" className="text-xs">
                {type === 'both' && draft.targetDate
                  ? `Intervalo: cada ${template.intervalMonths} meses o ${template.intervalMileage?.toLocaleString()} km`
                  : type === 'mileage' && template.intervalMileage
                    ? `Intervalo: cada ${template.intervalMileage.toLocaleString()} km`
                    : template.intervalMonths
                      ? `Intervalo: cada ${template.intervalMonths} meses`
                      : null}
                {draft.targetDate && type !== 'mileage'
                  ? ` · Vence el ${format(draft.targetDate, "d 'de' MMMM yyyy", { locale: es })}`
                  : ''}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

export { ReminderReviewList };
