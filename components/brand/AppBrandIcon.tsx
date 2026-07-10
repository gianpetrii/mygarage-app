import * as React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/colors';
import { BRAND } from '@/constants/brand';
import { cn } from '@/lib/utils';

const BRAND_ICON = require('../../assets/brand-icon.png');

interface AppBrandIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: StyleProp<ImageStyle>;
}

function AppBrandIcon({ size = 40, color, className, style }: AppBrandIconProps) {
  const { resolvedScheme } = useColorScheme();
  const tint =
    color ?? (resolvedScheme === 'dark' ? Colors.dark.foreground : Colors.light.mutedForeground);

  return (
    <Image
      source={BRAND_ICON}
      accessibilityLabel={BRAND.name}
      className={cn(className)}
      style={[{ width: size, height: size, tintColor: tint }, style]}
      resizeMode="contain"
    />
  );
}

export { AppBrandIcon, BRAND_ICON };
