import * as React from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppEngineIcon } from '@/components/brand/AppEngineIcon';
import { Text } from './text';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  /** Usa el icono de marca (motor) en lugar de Lucide. */
  brandIcon?: boolean;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({
  icon: Icon,
  brandIcon = false,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8 gap-4">
      <View className="w-20 h-20 rounded-full bg-muted items-center justify-center">
        {brandIcon ? (
          <AppEngineIcon size={40} />
        ) : Icon ? (
          <Icon size={36} className="text-muted-foreground" color="#71717a" />
        ) : null}
      </View>
      <View className="items-center gap-1">
        <Text variant="h3" className="text-center">{title}</Text>
        {description && (
          <Text variant="muted" className="text-center">{description}</Text>
        )}
      </View>
      {actionLabel && onAction && (
        <Button onPress={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

export { EmptyState };
