import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fonts, radii, spacing, type } from '../../src/theme';
import { useResurge, JournalEntry } from '../../src/state';
import { Card } from '../../src/components/Card';
import { PressableButton } from '../../src/components/PressableButton';

const MOOD_LABEL = ['', 'Heavy', 'Low', 'Steady', 'Bright', 'Soaring'];
const MOOD_COLOR = ['', '#D95D39', '#E27D60', '#A1A1AA', '#6B8F71', '#D4A373'];

const TAB_BAR_OFFSET = 96;

export default function Journal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { journal, relapses } = useResurge();

  return (
    <ScrollView
      testID="journal-screen"
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: TAB_BAR_OFFSET + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[type.label, { color: colors.primary }]}>journal</Text>
          <Text style={styles.title}>Your inner weather</Text>
        </View>
        <Pressable testID="add-journal-entry" onPress={() => router.push('/journal-entry')} style={styles.addBtn}>
          <Feather name="plus" size={20} color={colors.textInverse} />
        </Pressable>
      </View>

      <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.lg }]}>
        Notice patterns, name triggers, watch yourself grow. {journal.length} entries · {relapses.length} resets.
      </Text>

      {journal.length === 0 ? (
        <Animated.View>
          <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <View style={styles.emptyIcon}>
              <Feather name="book-open" size={26} color={colors.textSecondary} />
            </View>
            <Text style={[type.h3, { marginTop: spacing.md, textAlign: 'center' }]}>Start with one feeling</Text>
            <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg }]}>
              Three taps. Mood, trigger, a sentence. That&apos;s all.
            </Text>
            <PressableButton testID="empty-add-entry" label="Add first entry" onPress={() => router.push('/journal-entry')} />
          </Card>
        </Animated.View>
      ) : (
        journal.map((j, idx) => (
          <Animated.View key={j.id}>
            <EntryCard entry={j} />
          </Animated.View>
        ))
      )}

      {relapses.length > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <Text style={[type.label, { marginBottom: spacing.md }]}>resets</Text>
          {relapses.map((r) => (
            <View key={r.id} style={[styles.entry, { borderColor: 'rgba(217,93,57,0.18)', backgroundColor: 'rgba(217,93,57,0.05)' }]}>
              <View style={styles.entryHeader}>
                <Feather name="rotate-ccw" size={14} color={colors.emergency} />
                <Text style={[type.label, { color: colors.emergency, marginLeft: 6 }]}>reset · {new Date(r.at).toLocaleDateString()}</Text>
              </View>
              <Text style={[type.body, { marginTop: spacing.sm }]}>Trigger: {r.trigger || 'unspecified'}</Text>
              {r.note ? <Text style={[type.bodyMuted, { marginTop: 4 }]}>{r.note}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const EntryCard: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
  const dt = new Date(entry.at);
  const moodIdx = Math.max(1, Math.min(5, entry.mood));
  return (
    <View style={styles.entry}>
      <View style={styles.entryHeader}>
        <View style={[styles.moodDot, { backgroundColor: MOOD_COLOR[moodIdx] }]} />
        <Text style={[type.label, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
          {MOOD_LABEL[moodIdx]} · {dt.toLocaleDateString()} · {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {entry.triggers.length > 0 && (
        <View style={styles.tagsRow}>
          {entry.triggers.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      )}
      {entry.note ? <Text style={[type.body, { marginTop: spacing.sm }]}>{entry.note}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { ...type.h1, marginTop: 4 },
  addBtn: {
    width: 44, height: 44, borderRadius: radii.full, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyIcon: {
    width: 60, height: 60, borderRadius: radii.full, backgroundColor: colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  entry: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: spacing.sm,
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center' },
  moodDot: { width: 10, height: 10, borderRadius: 5 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  tag: { backgroundColor: colors.surfaceElevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full, borderWidth: 1, borderColor: colors.hairlineStrong },
  tagText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary },
});
