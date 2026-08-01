import * as React from 'react';
import { View, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from '@/constants/domain';
import type { Vehicle } from '@/types';

interface VehicleDetailsSummaryProps {
  vehicle: Vehicle;
  onEdit: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-2">
      <Text variant="muted" className="text-sm shrink-0">
        {label}
      </Text>
      <Text className="text-sm font-medium text-foreground text-right flex-1" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function VehicleDetailsSummary({ vehicle, onEdit }: VehicleDetailsSummaryProps) {
  const optionalRows: { label: string; value: string }[] = [];

  if (vehicle.color?.trim()) {
    optionalRows.push({ label: 'Color', value: vehicle.color.trim() });
  }
  if (vehicle.engine?.trim()) {
    optionalRows.push({ label: 'Motor', value: vehicle.engine.trim() });
  }
  if (vehicle.vin?.trim()) {
    optionalRows.push({ label: 'VIN', value: vehicle.vin.trim() });
  }
  if (vehicle.notes?.trim()) {
    optionalRows.push({ label: 'Notas', value: vehicle.notes.trim() });
  }

  return (
    <View className="rounded-xl border border-border bg-card px-4 py-3 gap-1">
      <Pressable
        onPress={onEdit}
        className="flex-row items-center justify-between mb-1 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Editar datos del vehículo"
      >
        <Text variant="h3">Datos del vehículo</Text>
        <View className="flex-row items-center gap-0.5">
          <Text className="text-sm font-medium text-primary">Editar</Text>
          <ChevronRight size={16} color="#71717a" />
        </View>
      </Pressable>

      <DetailRow label="Año" value={String(vehicle.year)} />
      {vehicle.trim?.trim() ? (
        <DetailRow label="Versión" value={vehicle.trim.trim()} />
      ) : null}
      <DetailRow label="Combustible" value={FUEL_TYPE_LABELS[vehicle.fuelType]} />
      <DetailRow label="Transmisión" value={TRANSMISSION_LABELS[vehicle.transmission]} />
      {optionalRows.map((row) => (
        <DetailRow key={row.label} label={row.label} value={row.value} />
      ))}
    </View>
  );
}

export { VehicleDetailsSummary };
