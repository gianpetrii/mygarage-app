import * as React from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FormScreen } from '@/components/layout/FormScreen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ReminderCatalogSelect } from '@/components/reminders/ReminderCatalogSelect';
import { ReminderReviewList } from '@/components/reminders/ReminderReviewList';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import {
  ALIGNMENT_TEMPLATE_ID,
  buildDefaultDrafts,
  createRemindersFromDrafts,
  getActiveTemplateIdsForVehicle,
  type ReminderDraft,
  type ReminderTemplateId,
} from '@/lib/reminderUtils';
import { buildSelectedTemplateIds, validateDrafts } from '@/lib/reminderFlow';
import { scheduleReminderNotification } from '@/lib/reminderScheduling';
import { auth } from '@/lib/firebase';

type Step = 'select' | 'review';

export default function AddRemindersCatalogScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicleId = Array.isArray(vehicleIdParam) ? vehicleIdParam[0] : vehicleIdParam;
  const { user } = useAuthStore();
  const { vehicles } = useVehiclesStore();
  const { reminders, addReminder, fetchReminders } = useRemindersStore();
  const [step, setStep] = React.useState<Step>('select');
  const [selected, setSelected] = React.useState<Set<ReminderTemplateId>>(() => new Set());
  const [includeAlignmentWithTires, setIncludeAlignmentWithTires] = React.useState(true);
  const [drafts, setDrafts] = React.useState<ReminderDraft[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0];

  React.useEffect(() => {
    const userId = user?.id ?? auth.currentUser?.uid;
    if (userId) fetchReminders(userId);
  }, [user, fetchReminders]);

  const goBack = () => {
    router.back();
  };

  const activeTemplateIds = vehicle
    ? new Set(getActiveTemplateIdsForVehicle(reminders, vehicle.id))
    : new Set<ReminderTemplateId>();

  const hiddenAlignment =
    activeTemplateIds.has(ALIGNMENT_TEMPLATE_ID) ||
    (selected.has('tires') && includeAlignmentWithTires);

  const hiddenTemplateIds = new Set(activeTemplateIds);
  if (hiddenAlignment) hiddenTemplateIds.add(ALIGNMENT_TEMPLATE_ID);

  const toggle = (id: ReminderTemplateId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (id === 'tires') setIncludeAlignmentWithTires(false);
      } else {
        next.add(id);
        if (id === 'tires') setIncludeAlignmentWithTires(true);
      }
      return next;
    });
  };

  const openCustomReminder = () => {
    if (!vehicle) return;
    router.push({
      pathname: '/(app)/reminders/custom',
      params: { vehicleId: vehicle.id, returnTo: 'reminders' },
    });
  };

  const handleSelectContinue = () => {
    if (!vehicle) return;

    const templateIds = buildSelectedTemplateIds(selected, includeAlignmentWithTires).filter(
      (id) => !activeTemplateIds.has(id),
    );

    if (templateIds.length === 0) {
      Alert.alert('Sin selección', 'Elegí al menos un recordatorio nuevo o usá el personalizado.');
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
        scheduleReminderNotification,
      );

      if (count === 0) {
        Alert.alert('Error', 'No se pudieron guardar los recordatorios.');
        return;
      }

      if (failed.length > 0) {
        Alert.alert(
          'Algunos no se guardaron',
          `Se agregaron ${count} de ${drafts.length}. Podés reintentar con los que faltan.`,
        );
      }

      router.back();
    } catch {
      Alert.alert('Error', 'No se pudieron crear los recordatorios.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <FormScreen title="Agregar recordatorio" onClose={goBack}>
        <Text variant="muted">No hay vehículos cargados</Text>
        <Button onPress={goBack}>Volver</Button>
      </FormScreen>
    );
  }

  const vehicleLabel = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
  const availableCount =
    buildSelectedTemplateIds(selected, includeAlignmentWithTires).filter(
      (id) => !activeTemplateIds.has(id),
    ).length;

  if (step === 'select') {
    return (
      <FormScreen title="Agregar recordatorio" onClose={goBack}>
        <Text variant="muted" className="text-sm -mt-2 mb-2">
          {vehicleLabel} — solo se muestran avisos que todavía no tenés activos
        </Text>

        <ReminderCatalogSelect
          selected={selected}
          onToggle={toggle}
          includeAlignmentWithTires={includeAlignmentWithTires}
          onToggleAlignmentWithTires={() => setIncludeAlignmentWithTires((prev) => !prev)}
          hiddenTemplateIds={hiddenTemplateIds}
          onAddCustom={openCustomReminder}
        />

        <Button onPress={handleSelectContinue} size="lg" disabled={availableCount === 0}>
          {availableCount > 0 ? 'Revisar fechas' : 'Elegí un recordatorio'}
        </Button>
      </FormScreen>
    );
  }

  return (
    <FormScreen title="Revisá y ajustá" onClose={() => setStep('select')}>
      <Text variant="muted" className="text-sm -mt-2 mb-2">
        Definí el próximo vencimiento antes de guardar
      </Text>

      <ReminderReviewList drafts={drafts} onChange={setDrafts} errors={errors} />

      <Button onPress={handleSave} loading={isLoading} size="lg">
        Agregar {drafts.length} recordatorio{drafts.length === 1 ? '' : 's'}
      </Button>
      <Button variant="ghost" onPress={() => setStep('select')} disabled={isLoading}>
        Volver
      </Button>
    </FormScreen>
  );
}
