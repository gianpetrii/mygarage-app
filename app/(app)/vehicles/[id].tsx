import * as React from 'react';
import {
  View,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Gauge,
  MoreVertical,
} from 'lucide-react-native';
import { VehiclePhotoGallery } from '@/components/vehicle/VehiclePhotoGallery';
import { VehicleSpecsPanel } from '@/components/vehicle/VehicleSpecsPanel';
import { VehicleManualCard } from '@/components/vehicle/VehicleManualCard';
import { KeyboardSheet } from '@/components/layout/KeyboardSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { MileageInput } from '@/components/vehicle/MileageInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useExpensesStore } from '@/store/useExpensesStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTimeline } from '@/hooks/useTimeline';
import { useVehicleManual } from '@/hooks/useVehicleManual';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { buildVehicleExportHtml, shareVehicleExport } from '@/lib/exportVehicleHistory';
import { parseGroupedInteger } from '@/lib/numberFormat';
import { Separator } from '@/components/ui/separator';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { vehicles, deleteVehicle, updateVehicle } = useVehiclesStore();
  const { records, fetchRecords } = useMaintenanceStore();
  const { entries, fetchEntries } = useFuelStore();
  const { expenses, fetchExpenses } = useExpensesStore();
  const { reminders, fetchReminders } = useRemindersStore();

  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [kmDialogOpen, setKmDialogOpen] = React.useState(false);
  const [kmValue, setKmValue] = React.useState('');
  const [isSavingKm, setIsSavingKm] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const { isDark } = useColorScheme();
  const iconColor = isDark ? '#fafafa' : '#18181b';

  const vehicle = vehicles.find((v) => v.id === id);
  const { manualResolved, manualLoading, openManual } = useVehicleManual(vehicle);
  const { setActiveVehicle } = useActiveVehicle();

  useFocusEffect(
    React.useCallback(() => {
      if (vehicle) {
        void setActiveVehicle(vehicle);
      }
    }, [vehicle, setActiveVehicle]),
  );

  React.useEffect(() => {
    if (!user || !id) return;
    fetchRecords(user.id, id);
    fetchEntries(user.id, id);
    fetchExpenses(user.id, id);
    fetchReminders(user.id, id);
  }, [user, id]);

  const { timeline: timelineEntries } = useTimeline({
    vehicleId: id,
    limit: 5,
  });

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text variant="muted">Vehículo no encontrado</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Eliminar vehículo',
      `¿Estás seguro de eliminar ${vehicle.make} ${vehicle.model}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteVehicle(id);
            router.back();
          },
        },
      ],
    );
  };

  const openKmDialog = () => {
    setKmValue(String(Math.floor(vehicle.mileage)));
    setKmDialogOpen(true);
  };

  const saveKm = async () => {
    const parsed = parseGroupedInteger(kmValue);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Error', 'Ingresá un kilometraje válido');
      return;
    }
    setIsSavingKm(true);
    try {
      await updateVehicle(id, { mileage: parsed });
      setKmDialogOpen(false);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el kilometraje');
    } finally {
      setIsSavingKm(false);
    }
  };

  const handleExport = async () => {
    setActionsOpen(false);
    setIsExporting(true);
    try {
      const html = buildVehicleExportHtml(
        vehicle,
        records,
        entries,
        expenses,
        reminders,
      );
      await shareVehicleExport(html, `${vehicle.make} ${vehicle.model}`);
    } catch {
      Alert.alert('Error', 'No se pudo generar el export');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePhotoChange = async (photos: string[]) => {
    if (!user) return;
    try {
      await updateVehicle(id, { photos });
    } catch {
      Alert.alert('Error', 'No se pudo guardar la foto del vehículo.');
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          accessibilityLabel="Volver"
        >
          <ArrowLeft size={22} color={iconColor} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="flex-1 text-center">
          {vehicle.make} {vehicle.model}
        </Text>
        <Pressable
          onPress={() => setActionsOpen(true)}
          className="h-10 w-10 items-center justify-center rounded-full"
          accessibilityLabel="Más opciones"
        >
          <MoreVertical size={22} color={iconColor} />
        </Pressable>
      </View>

      {user && (
        <VehiclePhotoGallery
          photos={vehicle.photos ?? []}
          userId={user.id}
          vehicleId={id}
          onPhotosChange={handlePhotoChange}
        />
      )}

      <View className="border-b border-border px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-0.5">
            <Text variant="h3">
              {vehicle.make} {vehicle.model}
            </Text>
            {vehicle.licensePlate && (
              <Text variant="muted" className="text-sm">
                {vehicle.licensePlate}
              </Text>
            )}
          </View>
          <Pressable
            onPress={openKmDialog}
            className="flex-row items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2"
            accessibilityLabel="Editar kilometraje"
          >
            <Gauge size={16} color="#71717a" />
            <Text className="font-semibold">{vehicle.mileage.toLocaleString()} km</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <VehicleManualCard
          resolved={manualResolved}
          isLoading={manualLoading}
          onOpen={openManual}
        />

        <VehicleSpecsPanel vehicle={vehicle} />

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text variant="h3">Actividad reciente</Text>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/(app)/history', params: { vehicleId: id } })
              }
            >
              <Text className="text-sm font-medium text-primary">Ver historial</Text>
            </Pressable>
          </View>
          {timelineEntries.length === 0 ? (
            <View className="rounded-xl border border-dashed border-border p-6 items-center">
              <Text variant="muted" className="text-center text-sm">
                Sin actividad registrada. Usá el botón + para agregar un service, carga o gasto.
              </Text>
            </View>
          ) : (
            timelineEntries.map((entry) => (
              <TimelineItem
                key={`${entry.type}-${entry.id}`}
                entry={entry}
                onPress={() =>
                  router.push(`/(app)/history/${entry.type}/${entry.id}`)
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      <Dialog open={kmDialogOpen} onOpenChange={setKmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar kilometraje</DialogTitle>
          </DialogHeader>
          <MileageInput
            label="Kilometraje actual"
            value={kmValue}
            onChangeValue={setKmValue}
          />
          <Button onPress={saveKm} loading={isSavingKm} className="mt-2">
            Guardar
          </Button>
        </DialogContent>
      </Dialog>

      <KeyboardSheet visible={actionsOpen} onClose={() => setActionsOpen(false)}>
        <Text variant="h3" className="mb-4">
          Opciones del vehículo
        </Text>
        <View className="gap-1">
          <ActionSheetRow
            icon={Edit}
            label="Editar vehículo"
            onPress={() => {
              setActionsOpen(false);
              router.push({ pathname: '/(app)/vehicles/edit', params: { id } });
            }}
          />
          <ActionSheetRow
            icon={Share2}
            label={isExporting ? 'Exportando...' : 'Exportar historial'}
            onPress={handleExport}
            disabled={isExporting}
          />
          <Separator className="my-2" />
          <ActionSheetRow
            icon={Trash2}
            label="Eliminar vehículo"
            destructive
            onPress={() => {
              setActionsOpen(false);
              handleDelete();
            }}
          />
        </View>
      </KeyboardSheet>
    </View>
  );
}

function ActionSheetRow({
  icon: Icon,
  label,
  onPress,
  destructive = false,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const { isDark } = useColorScheme();
  const iconColor = destructive ? '#ef4444' : isDark ? '#fafafa' : '#18181b';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-3 rounded-xl px-3 py-3.5 active:opacity-70 ${disabled ? 'opacity-50' : ''}`}
    >
      <Icon size={20} color={iconColor} />
      <Text className={`text-base font-medium ${destructive ? 'text-red-500' : 'text-foreground'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
