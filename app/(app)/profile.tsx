import * as React from 'react';
import { View, Pressable, Linking, Switch } from 'react-native';
import { router } from 'expo-router';
import { Moon, Sun, Monitor, LogOut, ChevronRight, Bell, BookOpen, Shield, LifeBuoy } from 'lucide-react-native';
import { LEGAL_URLS } from '@/constants/legal';
import { AppEngineIcon } from '@/components/brand/AppEngineIcon';
import { FLATICON_BRAND_ICON, FLATICON_ATTRIBUTION_LABEL } from '@/constants/attribution';
import { Screen } from '@/components/layout/Screen';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import { Colors } from '@/constants/colors';
import { cancelAllReminderNotifications, syncAllReminderNotifications } from '@/lib/reminderScheduling';
import { areReminderNotificationsEnabled } from '@/lib/notificationPreferences';
import { useRemindersStore } from '@/store/useRemindersStore';
import { cn } from '@/lib/utils';
import type { ColorScheme } from '@/types';

const themeOptions: { value: ColorScheme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

export default function ProfileScreen() {
  const { user, logout, isLoading, updatePreferences } = useAuthStore();
  const { colorScheme, setColorScheme } = useThemeStore();
  const { resolvedScheme } = useColorScheme();
  const colors = Colors[resolvedScheme];
  const { requestPermissions } = useNotifications();
  const { toast } = useToast();

  const [themeDialogOpen, setThemeDialogOpen] = React.useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = React.useState(false);
  const [prefsLoading, setPrefsLoading] = React.useState(false);

  const notifications = user?.preferences?.notifications;
  const pushEnabled = notifications?.push !== false;
  const remindersEnabled = notifications?.reminders !== false;

  const handlePushToggle = async (enabled: boolean) => {
    if (!user) return;
    setPrefsLoading(true);
    try {
      if (enabled) {
        const granted = await requestPermissions(user.id);
        if (!granted) {
          toast({
            message: 'Permisos denegados',
            description: 'Activá las notificaciones desde Ajustes del sistema.',
            variant: 'error',
          });
          return;
        }
      }
      await updatePreferences({
        notifications: { ...notifications, push: enabled },
      });
    } finally {
      setPrefsLoading(false);
    }
  };

  const handleRemindersToggle = async (enabled: boolean) => {
    setPrefsLoading(true);
    try {
      if (!enabled) {
        await cancelAllReminderNotifications();
      } else {
        await syncAllReminderNotifications(
          useRemindersStore.getState().reminders,
          areReminderNotificationsEnabled({ ...notifications, reminders: true }),
        );
      }
      await updatePreferences({
        notifications: { ...notifications, reminders: enabled },
      });
    } finally {
      setPrefsLoading(false);
    }
  };

  const notificationsSummary = [
    pushEnabled ? 'Push' : null,
    remindersEnabled ? 'Recordatorios' : null,
  ]
    .filter(Boolean)
    .join(' · ') || 'Desactivadas';

  return (
    <Screen>
      <View className="gap-6 pt-4">
        <View className="items-center gap-3 py-4">
          <Avatar
            src={user?.avatarUrl}
            fallback={user?.name ?? user?.email}
            size="xl"
          />
          <View className="items-center">
            <Text variant="h3">{user?.name ?? 'Usuario'}</Text>
            <Text variant="muted">{user?.email}</Text>
          </View>
        </View>

        <Card>
          <CardContent className="pt-6 gap-0">
            <SettingRow
              icon={Shield}
              label="Política de privacidad"
              onPress={() => Linking.openURL(LEGAL_URLS.privacy)}
            />
            <Separator />
            <SettingRow
              icon={LifeBuoy}
              label="Soporte"
              onPress={() => Linking.openURL(LEGAL_URLS.support)}
            />
            <Separator />
            <SettingRow
              icon={BookOpen}
              label="Guías prácticas"
              onPress={() => router.push('/(app)/guides')}
            />
            <Separator />
            <SettingRow
              icon={Bell}
              label="Notificaciones"
              value={notificationsSummary}
              onPress={() => setNotificationsDialogOpen(true)}
            />
            <Separator />
            <SettingRow
              icon={Sun}
              label="Apariencia"
              value={themeOptions.find((t) => t.value === colorScheme)?.label}
              onPress={() => setThemeDialogOpen(true)}
            />
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          size="lg"
          loading={isLoading}
          onPress={logout}
        >
          <View className="flex-row items-center gap-2">
            <LogOut size={18} color="white" />
            <Text className="text-base font-semibold text-white">Cerrar sesión</Text>
          </View>
        </Button>

        <View className="items-center gap-2 pt-2">
          <AppEngineIcon size={28} />
          <Pressable onPress={() => Linking.openURL(FLATICON_BRAND_ICON.iconUrl)}>
            <Text variant="muted" className="text-xs text-center underline">
              {FLATICON_ATTRIBUTION_LABEL}
            </Text>
          </Pressable>
        </View>
      </View>

      <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apariencia</DialogTitle>
          </DialogHeader>
          <View className="gap-1">
            {themeOptions.map(({ value, label, icon: Icon }) => {
              const selected = colorScheme === value;
              return (
                <Pressable
                  key={value}
                  className={cn(
                    'flex-row items-center gap-3 rounded-xl px-3 py-3',
                    selected ? 'bg-accent' : 'bg-transparent',
                  )}
                  onPress={() => {
                    setColorScheme(value);
                    setThemeDialogOpen(false);
                  }}
                >
                  <Icon
                    size={20}
                    color={selected ? colors.accentForeground : colors.mutedForeground}
                  />
                  <Text
                    variant="p"
                    className={selected ? 'font-semibold text-foreground' : 'text-muted-foreground'}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </DialogContent>
      </Dialog>

      <Dialog open={notificationsDialogOpen} onOpenChange={setNotificationsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
          </DialogHeader>
          <View className="gap-4">
            <PreferenceToggle
              label="Notificaciones push"
              description="Avisos en el celular cuando la app está cerrada"
              value={pushEnabled}
              disabled={prefsLoading}
              onValueChange={handlePushToggle}
            />
            <Separator />
            <PreferenceToggle
              label="Recordatorios locales"
              description="Alertas por fecha de vencimiento (VTV, service, seguro…)"
              value={remindersEnabled}
              disabled={prefsLoading}
              onValueChange={handleRemindersToggle}
            />
          </View>
        </DialogContent>
      </Dialog>
    </Screen>
  );
}

function PreferenceToggle({
  label,
  description,
  value,
  disabled,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1 gap-0.5">
        <Text className="font-medium text-foreground">{label}</Text>
        <Text variant="muted" className="text-xs">
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: '#d4d4d8', true: '#22c55e' }}
      />
    </View>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
  onPress,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  const { resolvedScheme } = useColorScheme();
  const iconColor = Colors[resolvedScheme].mutedForeground;

  return (
    <Pressable
      className="flex-row items-center gap-3 py-3 active:opacity-70"
      onPress={onPress}
    >
      <Icon size={20} color={iconColor} />
      <Text variant="p" className="flex-1">
        {label}
      </Text>
      {value && (
        <Text variant="muted" className="max-w-[45%] text-right" numberOfLines={1}>
          {value}
        </Text>
      )}
      <ChevronRight size={18} color={iconColor} />
    </Pressable>
  );
}
