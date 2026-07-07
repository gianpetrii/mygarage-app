import * as React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/colors';

interface CenterTabButtonProps extends ViewProps {
  onPress?: (event: unknown) => void;
}

function CenterTabButton({ onPress, ...viewProps }: CenterTabButtonProps) {
  const { resolvedScheme } = useColorScheme();
  const colors = Colors[resolvedScheme];

  return (
    <View className="flex-1 items-center justify-center" {...viewProps}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Nuevo service"
        className="items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          marginTop: -20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Plus size={28} color={colors.primaryForeground} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

export { CenterTabButton };
