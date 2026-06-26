import * as React from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Platform,
  ScrollView,
  type KeyboardAvoidingViewProps,
  type ScrollViewProps,
} from 'react-native';

type KeyboardProviderProps = {
  children: React.ReactNode;
  statusBarTranslucent?: boolean;
};

export type KeyboardAwareScrollViewProps = ScrollViewProps & {
  className?: string;
  contentContainerClassName?: string;
  bottomOffset?: number;
};

function FallbackProvider({ children }: KeyboardProviderProps) {
  return <>{children}</>;
}

const FallbackKeyboardAwareScrollView = React.forwardRef<
  ScrollView,
  KeyboardAwareScrollViewProps
>(function FallbackKeyboardAwareScrollView(
  { bottomOffset: _bottomOffset, contentContainerClassName, className, ...props },
  ref,
) {
  return (
    <ScrollView
      ref={ref}
      className={className}
      contentContainerClassName={contentContainerClassName}
      keyboardShouldPersistTaps="handled"
      {...props}
    />
  );
});

function loadKeyboardController() {
  try {
    // Carga diferida: si el binario nativo no incluye el módulo, usamos fallback RN.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-keyboard-controller');
    if (!mod?.KeyboardAwareScrollView || !mod?.KeyboardAvoidingView) {
      throw new Error('react-native-keyboard-controller incomplete');
    }
    return {
      linked: true as const,
      KeyboardProvider: (mod.KeyboardProvider ?? FallbackProvider) as React.ComponentType<KeyboardProviderProps>,
      KeyboardAwareScrollView:
        mod.KeyboardAwareScrollView as React.ComponentType<KeyboardAwareScrollViewProps>,
      KeyboardAvoidingView:
        mod.KeyboardAvoidingView as React.ComponentType<KeyboardAvoidingViewProps>,
    };
  } catch {
    if (__DEV__) {
      console.warn(
        '[keyboard] react-native-keyboard-controller no está enlazado. Usando fallback RN. ' +
          'Si usás dev client, rebuild: pnpm exec expo run:ios',
      );
    }
    return {
      linked: false as const,
      KeyboardProvider: FallbackProvider,
      KeyboardAwareScrollView: FallbackKeyboardAwareScrollView,
      KeyboardAvoidingView: RNKeyboardAvoidingView,
    };
  }
}

const keyboard = loadKeyboardController();

export const isKeyboardControllerLinked = keyboard.linked;
export const KeyboardProvider = keyboard.KeyboardProvider;
export const KeyboardAwareScrollView = keyboard.KeyboardAwareScrollView;
export const KeyboardAvoidingView = keyboard.KeyboardAvoidingView;

export function keyboardAvoidingBehavior(): KeyboardAvoidingViewProps['behavior'] {
  return Platform.OS === 'ios' ? 'padding' : 'height';
}
