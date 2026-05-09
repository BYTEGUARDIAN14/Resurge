import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fonts, radii, spacing, type } from '../../src/theme';

const TAB_BAR_OFFSET = 96;

interface Tool {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  tint: string;
  to: string;
  testID: string;
}

const TOOLS: Tool[] = [
  { id: 'urge', title: 'Urge surf', subtitle: 'Box breathing 4·4·4·4 — ride the wave', icon: 'wind', tint: '#4FD1C5', to: '/urge-surf', testID: 'tool-urge' },
  { id: 'sos', title: 'Emergency SOS', subtitle: 'Cold shower, pushups, breath — fast', icon: 'alert-circle', tint: '#F25C54', to: '/emergency', testID: 'tool-sos' },
  { id: 'timeline', title: 'Brain timeline', subtitle: 'See what healing does to your mind', icon: 'cpu', tint: '#9B7BFF', to: '/timeline', testID: 'tool-timeline' },
  { id: 'quotes', title: 'Quotes library', subtitle: 'Words for when yours run out', icon: 'book', tint: '#6FA0FF', to: '/quotes-library', testID: 'tool-quotes' },
  { id: 'journal', title: 'Log a moment', subtitle: 'Mood, trigger, one sentence', icon: 'edit-3', tint: '#9AA8C7', to: '/journal-entry', testID: 'tool-log' },
];

export default function Tools() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      testID="tools-screen"
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: TAB_BAR_OFFSET + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[type.label, { color: colors.primary }]}>tools</Text>
      <Text style={styles.title}>When the wave rises</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        Reach for these the moment you feel the pull. Practice them when calm.
      </Text>

      {TOOLS.map((t, idx) => (
        <Animated.View key={t.id}>
          <Pressable testID={t.testID} onPress={() => router.push(t.to as any)} style={styles.tile}>
            <View style={[styles.icon, { backgroundColor: `${t.tint}1A`, borderColor: `${t.tint}55` }]}>
              <Feather name={t.icon} size={22} color={t.tint} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.tileTitle}>{t.title}</Text>
              <Text style={styles.tileSub}>{t.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg },
  title: { ...type.h1, marginTop: 4 },
  tile: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline, marginBottom: spacing.md,
  },
  icon: { width: 52, height: 52, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  tileTitle: { fontFamily: fonts.headingSemiBold, fontSize: 18, color: colors.text },
  tileSub: { ...type.caption, marginTop: 2 },
});
