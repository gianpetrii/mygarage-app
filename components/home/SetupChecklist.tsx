import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Bell, Wrench, Camera, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import type { Vehicle } from '@/types';

interface SetupChecklistProps {
  vehicle: Vehicle;
  hasReminders: boolean;
  hasHistory: boolean;
  onSetupReminders: () => void;
  onRegisterService: () => void;
  onAddPhoto: () => void;
}

const ITEMS = [
  {
    key: 'reminders' as const,
    icon: Bell,
    title: 'Configurar recordatorios',
    description: 'VTV, service y seguro',
  },
  {
    key: 'history' as const,
    icon: Wrench,
    title: 'Registrar primer movimiento',
    description: 'Service o gasto',
  },
  {
    key: 'photo' as const,
    icon: Camera,
    title: 'Agregar foto del vehículo',
    description: 'Para identificarlo rápido',
  },
];

function SetupChecklist({
  vehicle,
  hasReminders,
  hasHistory,
  onSetupReminders,
  onRegisterService,
  onAddPhoto,
}: SetupChecklistProps) {
  const completed = {
    reminders: hasReminders,
    history: hasHistory,
    photo: (vehicle.photos?.length ?? 0) > 0,
  };

  const pending = ITEMS.filter((item) => !completed[item.key]);
  if (pending.length === 0) return null;

  const handlers = {
    reminders: onSetupReminders,
    history: onRegisterService,
    photo: onAddPhoto,
  };

  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text variant="h3">Para empezar</Text>
        <Text variant="muted" className="text-sm">
          {pending.length} {pending.length === 1 ? 'paso pendiente' : 'pasos pendientes'}
        </Text>
      </View>
      {pending.map((item) => {
        const Icon = item.icon;
        return (
          <Pressable
            key={item.key}
            onPress={handlers[item.key]}
            className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 active:opacity-80"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Icon size={20} color="#71717a" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">{item.title}</Text>
              <Text variant="muted" className="text-xs mt-0.5">
                {item.description}
              </Text>
            </View>
            <ChevronRight size={18} color="#71717a" />
          </Pressable>
        );
      })}
    </View>
  );
}

export { SetupChecklist };
