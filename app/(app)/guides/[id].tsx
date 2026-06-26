import * as React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { getGuideById } from '@/constants/guides';

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const guide = getGuideById(id ?? '');

  if (!guide) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="muted">Guía no encontrada</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3 gap-3">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <ArrowLeft size={22} color="#71717a" />
        </Pressable>
        <Text variant="h3" className="flex-1">{guide.title}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text variant="muted">{guide.summary}</Text>

        {guide.safetyTips && guide.safetyTips.length > 0 && (
          <View className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-4 gap-2">
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={18} color="#f59e0b" />
              <Text className="font-semibold text-amber-900 dark:text-amber-100">Seguridad</Text>
            </View>
            {guide.safetyTips.map((tip) => (
              <Text key={tip} className="text-sm text-amber-800 dark:text-amber-200">
                • {tip}
              </Text>
            ))}
          </View>
        )}

        {guide.steps.map((step, i) => (
          <View key={step.title} className="rounded-xl border border-border bg-card p-4 gap-2">
            <Text className="font-semibold">
              {i + 1}. {step.title}
            </Text>
            <Text variant="muted">{step.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
