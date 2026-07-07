import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import type { ReminderTemplateId } from '@/lib/reminderUtils';
import { cn } from '@/lib/utils';

interface ReminderTemplateOptionProps {
  templateId: ReminderTemplateId;
  label: string;
  description: string;
  isSelected: boolean;
  onToggle: (id: ReminderTemplateId) => void;
  className?: string;
  nested?: boolean;
}

function ReminderTemplateOption({
  templateId,
  label,
  description,
  isSelected,
  onToggle,
  className,
  nested = false,
}: ReminderTemplateOptionProps) {
  return (
    <Pressable
      onPress={() => onToggle(templateId)}
      className={cn(
        'flex-row items-center gap-4 rounded-xl border p-4',
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card',
        nested && 'ml-4 border-dashed',
        className,
      )}
    >
      <View
        className={cn(
          'h-6 w-6 items-center justify-center rounded-md border',
          isSelected ? 'border-primary bg-primary' : 'border-border bg-background',
        )}
      >
        {isSelected && <Check size={14} color="#fafafa" />}
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-foreground">{label}</Text>
        <Text variant="muted" className="text-xs mt-0.5">
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

export { ReminderTemplateOption };
