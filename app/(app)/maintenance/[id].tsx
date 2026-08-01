import * as React from 'react';
import { View, ScrollView, Image, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, Wrench, DollarSign, Calendar, MapPin } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { MAINTENANCE_TYPE_LABELS } from '@/constants/domain';
import { useCurrency } from '@/hooks/useCurrency';

export default function MaintenanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { formatMoney } = useCurrency();
  const { records, deleteRecord } = useMaintenanceStore();
  const { vehicles } = useVehiclesStore();

  const record = records.find((r) => r.id === id);
  const vehicle = vehicles.find((v) => v.id === record?.vehicleId);

  if (!record) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="muted">Registro no encontrado</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Eliminar registro',
      '¿Eliminar este registro de mantenimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteRecord(id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
          <ArrowLeft size={22} color="#18181b" />
        </Pressable>
        <Text variant="h3" className="flex-1 text-center" numberOfLines={1}>{record.title}</Text>
        <Pressable onPress={handleDelete} className="w-10 h-10 items-center justify-center rounded-full">
          <Trash2 size={20} color="#ef4444" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View className="rounded-xl border border-border bg-card p-4 gap-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
              <Wrench size={20} color="#71717a" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-foreground">{record.title}</Text>
              <Text variant="muted" className="text-xs">{MAINTENANCE_TYPE_LABELS[record.type]}</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <InfoChip icon={Calendar} text={format(record.date, "d 'de' MMMM yyyy", { locale: es })} />
            <InfoChip icon={Wrench} text={`${record.mileage.toLocaleString()} km`} />
            <InfoChip icon={DollarSign} text={formatMoney(record.cost)} />
          </View>

          {vehicle && (
            <View className="pt-2 border-t border-border/50">
              <Text variant="muted" className="text-xs">Vehículo: {vehicle.make} {vehicle.model} {vehicle.year}</Text>
            </View>
          )}
        </View>

        {record.description ? (
          <View className="rounded-xl border border-border bg-card p-4 gap-2">
            <Text variant="h3">Descripción</Text>
            <Text variant="muted">{record.description}</Text>
          </View>
        ) : null}

        {record.serviceProvider && (
          <View className="rounded-xl border border-border bg-card p-4 gap-2">
            <Text variant="h3">Taller</Text>
            <Text variant="muted">{record.serviceProvider}</Text>
          </View>
        )}

        {record.parts.length > 0 && (
          <View className="rounded-xl border border-border bg-card p-4 gap-2">
            <Text variant="h3">Repuestos</Text>
            {record.parts.map((part, i) => (
              <Text key={i} variant="muted" className="text-sm">• {part}</Text>
            ))}
          </View>
        )}

        {record.nextServiceMileage && (
          <View className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 p-4 gap-1">
            <Text className="font-semibold text-amber-800 dark:text-amber-300">Próximo service</Text>
            <Text className="text-amber-700 dark:text-amber-400 text-sm">
              {record.nextServiceMileage.toLocaleString()} km
            </Text>
          </View>
        )}

        {record.photos.length > 0 && (
          <View className="gap-3">
            <Text variant="h3">Fotos</Text>
            <View className="flex-row flex-wrap gap-2">
              {record.photos.map((uri, i) => (
                <Image key={i} source={{ uri }} className="w-28 h-28 rounded-lg" resizeMode="cover" />
              ))}
            </View>
          </View>
        )}

        {record.notes && (
          <View className="rounded-xl border border-border bg-card p-4 gap-2">
            <Text variant="h3">Notas</Text>
            <Text variant="muted">{record.notes}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoChip({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <View className="flex-row items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
      <Icon size={13} color="#71717a" />
      <Text className="text-xs text-muted-foreground">{text}</Text>
    </View>
  );
}
