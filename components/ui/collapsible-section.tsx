import * as React from 'react';
import { View, Pressable } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <View className="gap-3">
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between py-2"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text className="font-medium text-muted-foreground">{title}</Text>
        {open ? <ChevronUp size={18} color="#71717a" /> : <ChevronDown size={18} color="#71717a" />}
      </Pressable>
      {open && <View className="gap-4">{children}</View>}
    </View>
  );
}

export { CollapsibleSection };
