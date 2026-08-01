import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { FormScreen } from '@/components/layout/FormScreen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ReminderCatalogSelect } from '@/components/reminders/ReminderCatalogSelect';
import { ReminderReviewList } from '@/components/reminders/ReminderReviewList';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import {
  DEFAULT_SETUP_TEMPLATE_IDS,
  buildDefaultDrafts,
  createRemindersFromDrafts,
  type ReminderDraft,
  type ReminderTemplateId,
} from '@/lib/reminderUtils';
import { buildSelectedTemplateIds, validateDrafts } from '@/lib/reminderFlow';
import { requestNotificationPermissions } from '@/lib/reminderScheduling';
import { auth } from '@/lib/firebase';

type Step = 'permissions' | 'select' | 'review';

export default function SetupRemindersScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId: string }>();
  const vehicleId = Array.isArray(vehicleIdParam) ? vehicleIdParam[0] : vehicleIdParam;
  const { user } = useAuthStore();
  const { vehicles } = useVehiclesStore();
  const { addReminder } = useRemindersStore();
  const [step, setStep] = React.useState<Step>('permissions');
  const [selected, setSelected] = React.useState<Set<ReminderTemplateId>>(
    () => new Set(DEFAULT_SETUP_TEMPLATE_IDS),
  );
  const [includeAlignmentWithTires, setIncludeAlignmentWithTires] = React.useState(true);
  const [drafts, setDrafts] = React.useState<ReminderDraft[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const goHome = () => {
    router.replace('/(app)');
  };

  const toggle = (id: ReminderTemplateId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (id === TIRES_TEMPLATE_ID) setIncludeAlignmentWithTires(false);
      } else {
        next.add(id);
        if (id === TIRES_TEMPLATE_ID) setIncludeAlignmentWithTires(true);
      }
      return next;
    });
  };

  const openCustomReminder = () => {
    if (!vehicle) return;
    router.push({
      pathname: '/(app)/setup-reminders/custom',
      params: { vehicleId: vehicle.id },
    });
  };

  const handlePermissionsContinue = async () => {
    await requestNotificationPermissions();
    setStep('select');
  };

  const handleSelectContinue = () => {
    if (!vehicle) return;

    const templateIds = buildSelectedTemplateIds(selected, includeAlignmentWithTires);
    if (templateIds.length === 0) {
      goHome();
      return;
    }

    setDrafts(buildDefaultDrafts(templateIds, vehicle.mileage));
    setErrors({});
    setStep('review');
  };

  const handleSave = async () => {
    if (!vehicle) return;

    const validationErrors = validateDrafts(drafts);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const userId = user?.id ?? auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'Tu sesión expiró. Cerrá sesión y volvé a entrar.');
      return;
    }

    setIsLoading(true);
    try {
      const { count, failed } = await createRemindersFromDrafts(
        drafts,
        vehicle.id,
        userId,
        addReminder,
      );

      if (count === 0 && drafts.length > 0) {
        Alert.alert(
          'Error',
          'No se pudieron guardar los recordatorios. Revisá tu conexión e intentá de nuevo.',
        );
        return;
      }

      if (failed.length > 0) {
        Alert.alert(
          'Algunos recordatorios no se guardaron',
          `Se crearon ${count} de ${drafts.length}. Podés agregar el resto después.`,
        );
      }

      router.replace('/(app)/reminders');
    } catch {
      Alert.alert('Error', 'No se pudieron crear los recordatorios. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <FormScreen title="Recordatorios" onClose={goHome}>
        <Text variant="muted">Vehículo no encontrado</Text>
        <Button onPress={goHome}>Ir al inicio</Button>
      </FormScreen>
    );
  }

  const vehicleLabel = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;

  if (step === 'permissions') {
    return (
      <FormScreen title="Avisos a tiempo" onClose={goHome}>
        <Text variant="muted" className="text-sm -mt-2">
          {vehicleLabel}
        </Text>

        <View className="items-center gap-4 rounded-2xl border border-border bg-card p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Bell size={28} color="#18181b" />
          </View>
          <Text className="text-center text-base font-medium text-foreground">
            Activá las notificaciones para que te avisemos antes de que venza la VTV, el service, la
            patente y otros mantenimientos.
          </Text>
        </View>

        <Button onPress={handlePermissionsContinue} size="lg">
          Activar notificaciones
        </Button>
        <Button variant="ghost" onPress={() => setStep('select')}>
          Configurar sin notificaciones
        </Button>
      </FormScreen>
    );
  }

  if (step === 'select') {
    return (
      <FormScreen title="Elegí tus avisos" onClose={goHome}>
        <Text variant="muted" className="text-sm -mt-2 mb-2">
          {vehicleLabel} — te sugerimos VTV, service y seguro; desmarcá lo que no uses
        </Text>

        <ReminderCatalogSelect
          selected={selected}
          onToggle={toggle}
          includeAlignmentWithTires={includeAlignmentWithTires}
          onToggleAlignmentWithTires={() => setIncludeAlignmentWithTires((prev) => !prev)}
          onAddCustom={openCustomReminder}
        />

        <Button onPress={handleSelectContinue} size="lg">
          {selected.size > 0 ? 'Revisar fechas' : 'Continuar sin recordatorios'}
        </Button>
        <Button variant="ghost" onPress={goHome}>
          Configurar después
        </Button>
      </FormScreen>
    );
  }

  return (
    <FormScreen title="Revisá y ajustá" onClose={() => setStep('select')}>
      <Text variant="muted" className="text-sm -mt-2 mb-2">
        Definí el próximo vencimiento de cada aviso para {vehicle.make} {vehicle.model}
      </Text>

      <ReminderReviewList drafts={drafts} onChange={setDrafts} errors={errors} />

      <Button onPress={handleSave} loading={isLoading} size="lg">
        Guardar {drafts.length} recordatorio{drafts.length === 1 ? '' : 's'}
      </Button>
      <Button variant="ghost" onPress={() => setStep('select')} disabled={isLoading}>
        Volver a la selección
      </Button>
    </FormScreen>
  );
}
