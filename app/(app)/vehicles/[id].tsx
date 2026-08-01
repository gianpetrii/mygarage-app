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
import { VehicleDetailsSummary } from '@/components/vehicle/VehicleDetailsSummary';
import { VehicleActivityEmpty } from '@/components/vehicle/VehicleActivityEmpty';
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
import { useRemindersStore } from '@/store/useRemindersStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTimeline } from '@/hooks/useTimeline';
import { useVehicleManual } from '@/hooks/useVehicleManual';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import { VehicleExportSheet } from '@/components/vehicle/VehicleExportSheet';
import {
  buildVehicleExportHtml,
  buildVehicleExportTitle,
  shareVehicleExport,
  VehicleExportError,
  type VehicleExportSections,
} from '@/lib/exportVehicleHistory';
import { hasTechnicalSpecsForVehicle } from '@/lib/exportVehicleSpecsHtml';
import { parseGroupedInteger } from '@/lib/numberFormat';
import { Separator } from '@/components/ui/separator';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { vehicles, deleteVehicle, updateVehicle } = useVehiclesStore();
  const { records, fetchRecords } = useMaintenanceStore();
  const { reminders, fetchReminders } = useRemindersStore();

  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [exportSheetOpen, setExportSheetOpen] = React.useState(false);
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
    fetchReminders(user.id, id);
  }, [user, id]);

  const { timeline: timelineEntries } = useTimeline({
    vehicleId: id,
    limit: 5,
  });

  const exportAvailability = React.useMemo(
    () => ({
      hasManual: Boolean(vehicle?.manualUrl ?? manualResolved?.url),
      hasVehiclePhotos: (vehicle?.photos?.length ?? 0) > 0,
      hasReceiptPhotos: vehicle
        ? records.some((r) => r.vehicleId === vehicle.id && r.photos.length > 0)
        : false,
      hasTechnicalSpecs: vehicle ? hasTechnicalSpecsForVehicle(vehicle) : false,
    }),
    [vehicle, manualResolved?.url, records],
  );

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
            router.replace('/(app)/vehicles');
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

  const openExportSheet = () => {
    setActionsOpen(false);
    setExportSheetOpen(true);
  };

  const handleExport = async (sections: VehicleExportSections) => {
    setIsExporting(true);
    try {
      const manualUrl = vehicle.manualUrl ?? manualResolved?.url;
      const html = buildVehicleExportHtml(vehicle, records, { manualUrl, sections });
      await shareVehicleExport(html, buildVehicleExportTitle(vehicle));
      setExportSheetOpen(false);
    } catch (error) {
      const message =
        error instanceof VehicleExportError
          ? error.message
          : 'No se pudo generar el PDF. Recompilá la app nativa (expo run:ios) si acabás de actualizar dependencias.';
      Alert.alert('Exportar historial', message);
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

  const goToEdit = () => {
    router.push({ pathname: '/(app)/vehicles/edit', params: { id } });
  };

  const identitySubtitle = [
    String(vehicle.year),
    vehicle.licensePlate,
    vehicle.trim?.trim(),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => router.replace('/(app)/vehicles')}
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
            {identitySubtitle ? (
              <Text variant="muted" className="text-sm">
                {identitySubtitle}
              </Text>
            ) : null}
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

        <VehicleDetailsSummary vehicle={vehicle} onEdit={goToEdit} />

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
            <VehicleActivityEmpty vehicleId={id} />
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
              goToEdit();
            }}
          />
          <ActionSheetRow
            icon={Share2}
            label="Exportar historial"
            onPress={openExportSheet}
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

      <VehicleExportSheet
        visible={exportSheetOpen}
        onClose={() => !isExporting && setExportSheetOpen(false)}
        onExport={handleExport}
        isExporting={isExporting}
        availability={exportAvailability}
      />
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
