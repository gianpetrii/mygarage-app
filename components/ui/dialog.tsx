import * as React from 'react';
import {
  Modal,
  View,
  Pressable,
  Platform,
  type ModalProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/colors';
import { cn } from '@/lib/utils';
import { Text } from './text';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  modalProps?: Omit<ModalProps, 'visible' | 'onRequestClose' | 'transparent' | 'animationType'>;
}

interface DialogContentProps extends ViewProps {
  children: React.ReactNode;
}

interface DialogHeaderProps extends ViewProps {
  children: React.ReactNode;
}

interface DialogTitleProps extends React.ComponentPropsWithoutRef<typeof Text> {}

interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof Text> {}

interface DialogFooterProps extends ViewProps {
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => null,
});

function Dialog({ open, onOpenChange, children, modalProps }: DialogProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    if (open) {
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.05)) });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.95, { duration: 150 });
    }
  }, [open, opacity, scale]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => onOpenChange(false)}
        statusBarTranslucent
        {...modalProps}
      >
        <Animated.View
          className="flex-1 items-center justify-center px-4"
          style={[{ backgroundColor: 'rgba(0,0,0,0.55)' }, { opacity }]}
        >
          <Pressable
            className="absolute inset-0"
            onPress={() => onOpenChange(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar diálogo"
          />
          <View className="w-full max-w-sm" pointerEvents="box-none">
            {children}
          </View>
        </Animated.View>
      </Modal>
    </DialogContext.Provider>
  );
}

function DialogContent({ className, children, style, ...props }: DialogContentProps) {
  const { open } = React.useContext(DialogContext);
  const { resolvedScheme } = useColorScheme();
  const colors = Colors[resolvedScheme];
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    if (open) {
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.05)) });
    }
  }, [open, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const surfaceStyle: ViewStyle = {
    backgroundColor: resolvedScheme === 'dark' ? colors.secondary : colors.card,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: resolvedScheme === 'dark' ? 0.35 : 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  };

  return (
    <Animated.View
      className={cn('w-full rounded-2xl p-6 overflow-hidden', className)}
      style={[animatedStyle, surfaceStyle, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <View className={cn('mb-4 gap-1.5', className)} {...props}>
      {children}
    </View>
  );
}

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <Text variant="h4" className={cn('text-card-foreground', className)} {...props} />;
}

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <Text variant="muted" className={cn(className)} {...props} />;
}

function DialogFooter({ className, children, ...props }: DialogFooterProps) {
  return (
    <View className={cn('mt-6 flex-row justify-end gap-3', className)} {...props}>
      {children}
    </View>
  );
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
export type { DialogProps };
