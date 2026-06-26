import * as React from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Bell, FileText, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { requestNotificationPermissions } from '@/lib/reminderScheduling';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Bell,
    title: 'Recordatorios',
    description: 'VTV, service, seguro — te avisamos antes de que venza.',
  },
  {
    icon: FileText,
    title: 'Comprobantes ordenados',
    description: 'Fotos y historial de todo lo que le hiciste al auto, en un solo lugar.',
  },
  {
    icon: Share2,
    title: 'Listo para vender',
    description: 'Exportá el historial completo cuando quieras compartirlo con un comprador.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState(0);
  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;

  const finish = async () => {
    await storage.set(STORAGE_KEYS.ONBOARDING_SEEN, true);
    if (step === 0) {
      await requestNotificationPermissions();
    }
    router.replace('/(app)/vehicles/new');
  };

  const next = async () => {
    if (step === 0) {
      await requestNotificationPermissions();
    }
    if (isLast) {
      await storage.set(STORAGE_KEYS.ONBOARDING_SEEN, true);
      router.replace('/(app)/vehicles/new');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <View
      className="flex-1 bg-background px-6 justify-between"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
    >
      <Pressable onPress={finish} className="self-end">
        <Text variant="muted">Omitir</Text>
      </Pressable>

      <View className="items-center gap-6" style={{ minHeight: width * 0.6 }}>
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-muted">
          <Icon size={40} color="#18181b" />
        </View>
        <Text variant="h2" className="text-center">{slide.title}</Text>
        <Text variant="muted" className="text-center text-base px-4">
          {slide.description}
        </Text>
        <View className="flex-row gap-2 mt-4">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === step ? 'w-6 bg-primary' : 'w-2 bg-muted'}`}
            />
          ))}
        </View>
      </View>

      <Button size="lg" onPress={next}>
        {isLast ? 'Agregar mi vehículo' : 'Siguiente'}
      </Button>
    </View>
  );
}
