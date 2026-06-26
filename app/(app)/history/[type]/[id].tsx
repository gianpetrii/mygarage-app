import * as React from 'react';
import { View, ScrollView, Image, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, Wrench, DollarSign, Calendar, Fuel } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useExpensesStore } from '@/store/useExpensesStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { MAINTENANCE_TYPE_LABELS, EXPENSE_CATEGORY_LABELS } from '@/constants/domain';
import type { TimelineEntryType } from '@/types';

export default function HistoryDetailScreen() {
  const { type, id } = useLocalSearchParams<{ type: TimelineEntryType; id: string }>();
  const insets = useSafeAreaInsets();
  const { records, deleteRecord } = useMaintenanceStore();
  const { entries, deleteEntry } = useFuelStore();
  const { expenses, deleteExpense } = useExpensesStore();
  const { vehicles } = useVehiclesStore();

  if (type === 'maintenance') {
    const record = records.find((r) => r.id === id);
    const vehicle = vehicles.find((v) => v.id === record?.vehicleId);
    if (!record) return <NotFound />;
    return (
      <DetailShell
        title={record.title}
        insets={insets}
        onDelete={() =>
          confirmDelete('registro', () => deleteRecord(id).then(() => router.back()))
        }
      >
        <InfoCard
          icon={Wrench}
          subtitle={MAINTENANCE_TYPE_LABELS[record.type]}
          chips={[
            format(record.date, "d MMM yyyy", { locale: es }),
            `${record.mileage.toLocaleString()} km`,
            `$${record.cost.toLocaleString('es-AR')}`,
          ]}
          vehicle={vehicle ? `${vehicle.make} ${vehicle.model}` : undefined}
        />
        {record.description ? <Section title="Descripción" body={record.description} /> : null}
        {record.serviceProvider ? <Section title="Taller" body={record.serviceProvider} /> : null}
        {record.photos.length > 0 && <PhotoGrid photos={record.photos} />}
        {record.notes ? <Section title="Notas" body={record.notes} /> : null}
      </DetailShell>
    );
  }

  if (type === 'fuel') {
    const entry = entries.find((e) => e.id === id);
    const vehicle = vehicles.find((v) => v.id === entry?.vehicleId);
    if (!entry) return <NotFound />;
    return (
      <DetailShell
        title="Carga de combustible"
        insets={insets}
        onDelete={() =>
          confirmDelete('carga', () => deleteEntry(id).then(() => router.back()))
        }
      >
        <InfoCard
          icon={Fuel}
          subtitle={entry.gasStation ?? 'Combustible'}
          chips={[
            format(entry.date, "d MMM yyyy", { locale: es }),
            `${entry.liters} L`,
            `$${entry.totalCost.toLocaleString('es-AR')}`,
          ]}
          vehicle={vehicle ? `${vehicle.make} ${vehicle.model}` : undefined}
        />
        <Section title="Detalle" body={`${entry.mileage.toLocaleString()} km · $${entry.pricePerLiter}/L · ${entry.isFullTank ? 'Tanque lleno' : 'Carga parcial'}`} />
        {entry.notes ? <Section title="Notas" body={entry.notes} /> : null}
      </DetailShell>
    );
  }

  if (type === 'expense') {
    const expense = expenses.find((e) => e.id === id);
    const vehicle = vehicles.find((v) => v.id === expense?.vehicleId);
    if (!expense) return <NotFound />;
    return (
      <DetailShell
        title={expense.title}
        insets={insets}
        onDelete={() =>
          confirmDelete('gasto', () => deleteExpense(id).then(() => router.back()))
        }
      >
        <InfoCard
          icon={DollarSign}
          subtitle={EXPENSE_CATEGORY_LABELS[expense.category]}
          chips={[
            format(expense.date, "d MMM yyyy", { locale: es }),
            `$${expense.amount.toLocaleString('es-AR')}`,
          ]}
          vehicle={vehicle ? `${vehicle.make} ${vehicle.model}` : undefined}
        />
        {expense.vendor ? <Section title="Proveedor" body={expense.vendor} /> : null}
        {expense.description ? <Section title="Descripción" body={expense.description} /> : null}
      </DetailShell>
    );
  }

  return <NotFound />;
}

function NotFound() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text variant="muted">Registro no encontrado</Text>
    </View>
  );
}

function confirmDelete(label: string, onConfirm: () => void) {
  Alert.alert('Eliminar', `¿Eliminar este ${label}?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

function DetailShell({
  title,
  insets,
  onDelete,
  children,
}: {
  title: string;
  insets: { top: number };
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full">
          <ArrowLeft size={22} color="#71717a" />
        </Pressable>
        <Text variant="h3" className="flex-1 text-center" numberOfLines={1}>
          {title}
        </Text>
        <Pressable onPress={onDelete} className="h-10 w-10 items-center justify-center rounded-full">
          <Trash2 size={20} color="#ef4444" />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

function InfoCard({
  icon: Icon,
  subtitle,
  chips,
  vehicle,
}: {
  icon: React.ElementType;
  subtitle: string;
  chips: string[];
  vehicle?: string;
}) {
  return (
    <View className="rounded-xl border border-border bg-card p-4 gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-muted">
          <Icon size={20} color="#71717a" />
        </View>
        <View className="flex-1">
          <Text variant="muted" className="text-xs">{subtitle}</Text>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {chips.map((c) => (
          <View key={c} className="flex-row items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5">
            <Calendar size={12} color="#71717a" />
            <Text className="text-xs text-muted-foreground">{c}</Text>
          </View>
        ))}
      </View>
      {vehicle && (
        <Text variant="muted" className="text-xs border-t border-border pt-2">
          Vehículo: {vehicle}
        </Text>
      )}
    </View>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View className="rounded-xl border border-border bg-card p-4 gap-2">
      <Text variant="h3">{title}</Text>
      <Text variant="muted">{body}</Text>
    </View>
  );
}

function PhotoGrid({ photos }: { photos: string[] }) {
  return (
    <View className="gap-2">
      <Text variant="h3">Comprobantes</Text>
      <View className="flex-row flex-wrap gap-2">
        {photos.map((uri, i) => (
          <Image key={i} source={{ uri }} className="h-28 w-28 rounded-lg" resizeMode="cover" />
        ))}
      </View>
    </View>
  );
}
