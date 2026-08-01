import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { KeyboardSheet } from '@/components/layout/KeyboardSheet';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  DEFAULT_VEHICLE_EXPORT_SECTIONS,
  type VehicleExportSections,
} from '@/lib/exportVehicleHistory';
import { cn } from '@/lib/utils';

const SECTION_OPTIONS: {
  key: keyof VehicleExportSections;
  label: string;
  description: string;
  unavailableDescription: string;
}[] = [
  {
    key: 'vehicleData',
    label: 'Datos del vehículo',
    description: 'Marca, patente, km, motor, VIN',
    unavailableDescription: '',
  },
  {
    key: 'vehiclePhotos',
    label: 'Fotos del vehículo',
    description: 'Imágenes cargadas en el perfil del auto',
    unavailableDescription: 'No hay fotos del vehículo',
  },
  {
    key: 'technicalSpecs',
    label: 'Ficha técnica',
    description: 'Características del modelo según catálogo',
    unavailableDescription: 'No hay ficha para este modelo',
  },
  {
    key: 'activityHistory',
    label: 'Historial de actividades',
    description: 'Services, arreglos y trabajos hechos',
    unavailableDescription: '',
  },
  {
    key: 'receiptPhotos',
    label: 'Comprobantes',
    description: 'Fotos de facturas o trabajos del historial',
    unavailableDescription: 'No hay comprobantes cargados',
  },
  {
    key: 'manual',
    label: 'Manual del vehículo',
    description: 'Enlace al manual si está disponible',
    unavailableDescription: 'No hay manual cargado',
  },
];

export interface VehicleExportAvailability {
  hasManual: boolean;
  hasVehiclePhotos: boolean;
  hasReceiptPhotos: boolean;
  hasTechnicalSpecs: boolean;
}

interface VehicleExportSheetProps {
  visible: boolean;
  onClose: () => void;
  onExport: (sections: VehicleExportSections) => void;
  isExporting: boolean;
  availability: VehicleExportAvailability;
}

function buildDefaultSections(availability: VehicleExportAvailability): VehicleExportSections {
  return {
    vehicleData: true,
    activityHistory: true,
    vehiclePhotos: availability.hasVehiclePhotos,
    receiptPhotos: availability.hasReceiptPhotos,
    technicalSpecs: availability.hasTechnicalSpecs,
    manual: availability.hasManual,
  };
}

function isSectionDisabled(
  key: keyof VehicleExportSections,
  availability: VehicleExportAvailability,
): boolean {
  switch (key) {
    case 'manual':
      return !availability.hasManual;
    case 'vehiclePhotos':
      return !availability.hasVehiclePhotos;
    case 'receiptPhotos':
      return !availability.hasReceiptPhotos;
    case 'technicalSpecs':
      return !availability.hasTechnicalSpecs;
    default:
      return false;
  }
}

function VehicleExportSheet({
  visible,
  onClose,
  onExport,
  isExporting,
  availability,
}: VehicleExportSheetProps) {
  const [sections, setSections] = React.useState<VehicleExportSections>(
    DEFAULT_VEHICLE_EXPORT_SECTIONS,
  );

  React.useEffect(() => {
    if (visible) {
      setSections(buildDefaultSections(availability));
    }
  }, [visible, availability]);

  const toggle = (key: keyof VehicleExportSections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(sections).filter(Boolean).length;
  const canExport = selectedCount > 0;

  return (
    <KeyboardSheet visible={visible} onClose={onClose}>
      <Text variant="h3" className="mb-1">
        Exportar para comprador
      </Text>
      <Text variant="muted" className="mb-4 text-sm">
        Elegí qué incluir en el PDF para compartir
      </Text>

      <View className="gap-2">
        {SECTION_OPTIONS.map((option) => {
          const disabled = isSectionDisabled(option.key, availability);
          const checked = sections[option.key];
          return (
            <Pressable
              key={option.key}
              onPress={() => !disabled && toggle(option.key)}
              disabled={disabled || isExporting}
              className={cn(
                'flex-row items-center gap-3 rounded-xl border border-border bg-card p-4',
                disabled && 'opacity-50',
              )}
              accessibilityRole="checkbox"
              accessibilityState={{ checked, disabled }}
            >
              <View
                className={cn(
                  'h-6 w-6 items-center justify-center rounded-md border',
                  checked ? 'border-primary bg-primary' : 'border-border bg-background',
                )}
              >
                {checked ? <Check size={14} color="white" /> : null}
              </View>
              <View className="flex-1">
                <Text className="font-medium">{option.label}</Text>
                <Text variant="muted" className="text-xs">
                  {disabled ? option.unavailableDescription : option.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button
        className="mt-5"
        onPress={() => onExport(sections)}
        loading={isExporting}
        disabled={!canExport || isExporting}
      >
        Generar PDF
      </Button>
    </KeyboardSheet>
  );
}

export { VehicleExportSheet };
