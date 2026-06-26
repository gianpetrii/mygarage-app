import * as React from 'react';
import { View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAvoidingView,
  keyboardAvoidingBehavior,
} from '@/lib/keyboardController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';
import { AnimatedScreen } from './AnimatedScreen';

interface KeyboardViewProps {
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  scrollProps?: ScrollViewProps;
  bottomOffset?: number;
  animated?: boolean;
  /** Agrega px-5 al contenido scrollable. */
  padded?: boolean;
  /** Aplica insets superior e inferior (útil en modales full-screen). */
  safeArea?: boolean;
}

function KeyboardView({
  className,
  contentClassName,
  children,
  scrollable = true,
  scrollProps,
  bottomOffset = 16,
  animated = true,
  padded = false,
  safeArea = false,
}: KeyboardViewProps) {
  const insets = useSafeAreaInsets();
  const {
    contentContainerStyle: scrollContentStyle,
    contentContainerClassName: scrollContentClassName,
    ...restScrollProps
  } = scrollProps ?? {};

  const contentContainerStyle: StyleProp<ViewStyle> = [
    safeArea && {
      paddingTop: insets.top + 12,
      paddingBottom: Math.max(insets.bottom, 16) + 24,
    },
    scrollContentStyle,
  ];

  const contentContainerClassName = cn(
    'flex-grow',
    padded && 'px-5',
    contentClassName,
    scrollContentClassName,
  );

  const motion = (node: React.ReactNode) => (
    <AnimatedScreen disabled={!animated}>{node}</AnimatedScreen>
  );

  if (scrollable) {
    return motion(
      <KeyboardAwareScrollView
        className={cn('flex-1 bg-background', className)}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName={contentContainerClassName}
        contentContainerStyle={contentContainerStyle}
        bottomOffset={bottomOffset}
        showsVerticalScrollIndicator={false}
        {...restScrollProps}
      >
        {children}
      </KeyboardAwareScrollView>,
    );
  }

  return motion(
    <KeyboardAvoidingView
      className={cn('flex-1 bg-background', className)}
      behavior={keyboardAvoidingBehavior()}
    >
      {children}
    </KeyboardAvoidingView>,
  );
}

export { KeyboardView };
export type { KeyboardViewProps };
