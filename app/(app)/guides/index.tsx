import * as React from 'react';
import { View, TextInput } from 'react-native';
import { router } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { GUIDES, GUIDE_CATEGORIES } from '@/constants/guides';
import { Pressable } from 'react-native';

export default function GuidesListScreen() {
  const [query, setQuery] = React.useState('');

  const filtered = GUIDES.filter(
    (g) =>
      g.title.toLowerCase().includes(query.toLowerCase()) ||
      g.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Screen>
      <Text variant="h1" className="mb-2">Guías</Text>
      <Text variant="muted" className="text-sm mb-4">
        Instructivos básicos para el día a día
      </Text>

      <TextInput
        className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground mb-4"
        placeholder="Buscar guía..."
        placeholderTextColor="#71717a"
        value={query}
        onChangeText={setQuery}
      />

      {GUIDE_CATEGORIES.map((cat) => {
        const items = filtered.filter((g) => g.category === cat);
        if (items.length === 0) return null;
        return (
          <View key={cat} className="gap-3 mb-6">
            <Text variant="h3">{cat}</Text>
            {items.map((guide) => (
              <Pressable
                key={guide.id}
                onPress={() => router.push(`/(app)/guides/${guide.id}`)}
                className="flex-row items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <BookOpen size={20} color="#71717a" />
                <View className="flex-1">
                  <Text className="font-semibold">{guide.title}</Text>
                  <Text variant="muted" className="text-sm mt-0.5">{guide.summary}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        );
      })}
    </Screen>
  );
}
