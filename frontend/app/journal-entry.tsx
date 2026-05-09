import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { useResurge } from '../src/state';
import { PressableButton } from '../src/components/PressableButton';

const TRIGGERS = ['Stress', 'Boredom', 'Loneliness', 'Late night', 'Social media', 'Anger', 'Sadness', 'Tired', 'Phone scrolling', 'Argument', 'Other'];
const MOOD_LABELS = ['Heavy', 'Low', 'Steady', 'Bright', 'Soaring'];

export default function JournalEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addJournal } = useResurge();
  const [mood, setMood] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const toggle = (t: string) => setTags((arr) => arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]);

  const submit = async () => {
    await addJournal({ mood, triggers: tags, note: note.trim() });
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]} testID="journal-entry-screen">
        <View style={styles.header}>
          <Pressable testID="journal-close" onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={20} color={colors.textSecondary} />
          </Pressable>
          <Text style={[type.label, { color: colors.primary }]}>new entry</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Animated.View>
              <Text style={styles.title}>How is right now?</Text>

              <Text style={styles.section}>Mood</Text>
              <View style={styles.moodRow}>
                {[1, 2, 3, 4, 5].map((m) => (
                  <Pressable
                    key={m}
                    testID={`je-mood-${m}`}
                    onPress={() => setMood(m)}
                    style={[styles.moodPill, mood === m && styles.moodPillActive]}
                  >
                    <Text style={[styles.moodNum, mood === m && styles.moodNumActive]}>{m}</Text>
                    <Text style={[styles.moodLabel, mood === m && styles.moodLabelActive]}>{MOOD_LABELS[m - 1]}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.section}>Triggers (optional)</Text>
              <View style={styles.tagRow}>
                {TRIGGERS.map((t) => (
                  <Pressable
                    key={t}
                    testID={`je-tag-${t}`}
                    onPress={() => toggle(t)}
                    style={[styles.tag, tags.includes(t) && styles.tagActive]}
                  >
                    <Text style={[styles.tagText, tags.includes(t) && styles.tagTextActive]}>{t}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.section}>One sentence (optional)</Text>
              <TextInput
                testID="je-note"
                value={note}
                onChangeText={setNote}
                placeholder="What's underneath the feeling?"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={280}
                style={styles.input}
              />

              <PressableButton testID="je-save" label="Save entry" onPress={submit} fullWidth style={{ marginTop: spacing.xl }} />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: {
    width: 40, height: 40, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  title: { ...type.h1 },
  section: { ...type.label, marginTop: spacing.xl, marginBottom: spacing.md },
  moodRow: { flexDirection: 'row', gap: spacing.xs },
  moodPill: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radii.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  moodPillActive: { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  moodNum: { fontFamily: fonts.headingExtraBold, fontSize: 18, color: colors.textSecondary },
  moodNumActive: { color: colors.primary },
  moodLabel: { ...type.caption, fontSize: 11, marginTop: 2 },
  moodLabelActive: { color: colors.primary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong },
  tagActive: { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  tagText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  tagTextActive: { color: colors.primary },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong, borderRadius: radii.md,
    padding: spacing.md, fontFamily: fonts.body, fontSize: 16, color: colors.text, minHeight: 100, textAlignVertical: 'top',
  },
});
