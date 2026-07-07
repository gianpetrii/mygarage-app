import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { ReminderTemplateOption } from '@/components/reminders/ReminderTemplateOption';
import {
  ALIGNMENT_TEMPLATE_ID,
  REMINDER_CATALOG_GROUPS,
  REMINDER_CATALOG_OPTIONS,
  TIRES_TEMPLATE_ID,
  type ReminderCatalogOption,
  type ReminderTemplateId,
} from '@/lib/reminderUtils';

interface ReminderCatalogSelectProps {
  selected: Set<ReminderTemplateId>;
  onToggle: (id: ReminderTemplateId) => void;
  includeAlignmentWithTires: boolean;
  onToggleAlignmentWithTires: () => void;
  hiddenTemplateIds?: Set<ReminderTemplateId>;
  onAddCustom?: () => void;
  showCustomOption?: boolean;
}

function ReminderCatalogSelect({
  selected,
  onToggle,
  includeAlignmentWithTires,
  onToggleAlignmentWithTires,
  hiddenTemplateIds,
  onAddCustom,
  showCustomOption = true,
}: ReminderCatalogSelectProps) {
  const tiresSelected = selected.has(TIRES_TEMPLATE_ID);
  const alignmentHidden = hiddenTemplateIds?.has(ALIGNMENT_TEMPLATE_ID);

  const optionsByGroup = REMINDER_CATALOG_GROUPS.map((group) => ({
    ...group,
    options: REMINDER_CATALOG_OPTIONS.filter((option) => {
      if (option.group !== group.id) return false;
      if (hiddenTemplateIds?.has(option.templateId)) return false;
      if (option.templateId === ALIGNMENT_TEMPLATE_ID && alignmentHidden) return false;
      return true;
    }),
  }));

  const renderOption = (option: ReminderCatalogOption) => (
    <React.Fragment key={option.templateId}>
      <ReminderTemplateOption
        templateId={option.templateId}
        label={option.label}
        description={option.description}
        isSelected={selected.has(option.templateId)}
        onToggle={onToggle}
      />
      {option.templateId === TIRES_TEMPLATE_ID && tiresSelected && !alignmentHidden && (
        <ReminderTemplateOption
          templateId={ALIGNMENT_TEMPLATE_ID}
          label="Alineación y balanceo"
          description="Recomendado al cambiar cubiertas"
          isSelected={includeAlignmentWithTires}
          onToggle={() => onToggleAlignmentWithTires()}
          nested
        />
      )}
    </React.Fragment>
  );

  return (
    <View className="gap-4">
      {optionsByGroup.map(
        (group) =>
          group.options.length > 0 && (
            <View key={group.id} className="gap-2">
              <Text className="text-sm font-semibold text-foreground">{group.title}</Text>
              <View className="gap-3">{group.options.map(renderOption)}</View>
            </View>
          ),
      )}

      {showCustomOption && onAddCustom && (
        <Pressable
          onPress={onAddCustom}
          className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 active:opacity-80"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Plus size={20} color="#71717a" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-foreground">Recordatorio personalizado</Text>
            <Text variant="muted" className="text-xs mt-0.5">
              Otro aviso a medida para este vehículo
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

export { ReminderCatalogSelect };
