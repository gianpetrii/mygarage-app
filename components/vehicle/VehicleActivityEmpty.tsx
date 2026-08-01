import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface VehicleActivityEmptyProps {
  vehicleId?: string;
}

function VehicleActivityEmpty(_props: VehicleActivityEmptyProps) {
  return (
    <View className="rounded-xl border border-dashed border-border p-5 gap-3 items-center">
      <Text className="font-semibold text-foreground">Sin actividad registrada</Text>
      <Text variant="muted" className="text-center text-sm">
        Los movimientos aparecen cuando marcás un recordatorio como hecho o registrás un arreglo con
        el botón + del tab bar.
      </Text>
    </View>
  );
}

export { VehicleActivityEmpty };
