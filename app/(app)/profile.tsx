import * as React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { router } from 'expo-router';
import { Moon, Sun, Monitor, LogOut, ChevronRight, Bell, BookOpen } from 'lucide-react-native';
import { AppEngineIcon } from '@/components/brand/AppEngineIcon';
import { FLATICON_BRAND_ICON, FLATICON_ATTRIBUTION_LABEL } from '@/constants/attribution';
import { Screen } from '@/components/layout/Screen';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/colors';
import { cn } from '@/lib/utils';
import type { ColorScheme } from '@/types';

const themeOptions: { value: ColorScheme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuthStore();
  const { colorScheme, setColorScheme } = useThemeStore();
  const { resolvedScheme } = useColorScheme();
  const colors = Colors[resolvedScheme];
  const [themeDialogOpen, setThemeDialogOpen] = React.useState(false);

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
              icon={BookOpen}
              label="Guías prácticas"
              onPress={() => router.push('/(app)/guides')}
            />
            <Separator />
            <SettingRow
              icon={Bell}
              label="Notificaciones"
              onPress={() => {}}
            />
            <Separator />
            <SettingRow
              icon={Sun}
              label="Apariencia"
              value={themeOptions.find((t) => t.value === colorScheme)?.label}
              onPress={() => setThemeDialogOpen(true)}
            />
            <Separator />
            <SettingRow
              icon={Monitor}
              label="Moneda"
              value={user?.preferences?.currency ?? 'ARS'}
              onPress={() => {}}
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
    </Screen>
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
  return (
    <Pressable
      className="flex-row items-center gap-3 py-3 active:opacity-70"
      onPress={onPress}
    >
      <Icon size={20} color="#71717a" />
      <Text variant="p" className="flex-1">
        {label}
      </Text>
      {value && <Text variant="muted">{value}</Text>}
      <ChevronRight size={18} color="#71717a" />
    </Pressable>
  );
}
