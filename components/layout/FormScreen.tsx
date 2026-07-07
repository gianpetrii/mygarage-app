import * as React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { KeyboardView } from '@/components/layout/KeyboardView';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface FormScreenProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  contentClassName?: string;
  footer?: React.ReactNode;
  animated?: boolean;
}

function FormScreen({
  title,
  children,
  onClose,
  contentClassName,
  footer,
  animated = true,
}: FormScreenProps) {
  const handleClose = onClose ?? (() => router.back());

  return (
    <View className="flex-1 bg-background">
      <KeyboardView padded safeArea animated={animated} contentClassName={cn('gap-6', contentClassName)}>
        <View className="flex-row items-center justify-between">
          <Text variant="h2">{title}</Text>
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <X size={18} color="#71717a" />
          </Pressable>
        </View>
        {children}
        {footer}
      </KeyboardView>
    </View>
  );
}

export { FormScreen };
export type { FormScreenProps };
