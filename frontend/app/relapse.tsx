import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { useResurge } from '../src/state';
import { PressableButton } from '../src/components/PressableButton';

const TRIGGERS = ['Stress', 'Boredom', 'Loneliness', 'Late night', 'Social media', 'Anger', 'Sadness', 'Tired', 'Argument', 'Phone scrolling', 'Argument', 'Other'];

const MOOD_LABELS = ['Heavy', 'Low', 'Steady', 'Bright', 'Soaring'];

export default function Relapse() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logRelapse } = useResurge();

  const [mood, setMood] = useState(2);
  const [trigger, setTrigger] = useState<string>('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'compose' | 'confirm' | 'done'>('compose');

  const submit = async () => {
    await logRelapse({ mood, trigger, note: note.trim() });
    setStep('done');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]} testID="relapse-screen">
        <LinearGradient colors={[colors.bg, '#0E0E14']} style={StyleSheet.absoluteFill} />

        <View style={styles.header}>
          <Pressable testID="relapse-close" onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={20} color={colors.textSecondary} />
          </Pressable>
          <Text style={[type.label, { color: colors.warning }]}>gentle reset</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {step === 'compose' && (
              <Animated.View>
                <Text style={styles.title}>A slip is not a fall.</Text>
                <Text style={[type.bodyLg, { marginTop: spacing.md, color: colors.textSecondary }]}>
                  Stand up. Brush off. The data you collect now becomes your defense tomorrow.
                </Text>

                <Text style={styles.section}>How are you feeling?</Text>
                <View style={styles.moodRow}>
                  {[1, 2, 3, 4, 5].map((m) => (
                    <Pressable
                      key={m}
                      testID={`mood-${m}`}
                      onPress={() => setMood(m)}
                      style={[styles.moodPill, mood === m && styles.moodPillActive]}
                    >
                      <Text style={[styles.moodNum, mood === m && styles.moodNumActive]}>{m}</Text>
                      <Text style={[styles.moodLabel, mood === m && styles.moodLabelActive]}>{MOOD_LABELS[m - 1]}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.section}>What pulled you in?</Text>
                <View style={styles.tagRow}>
                  {TRIGGERS.map((t) => (
                    <Pressable
                      key={t}
                      testID={`trigger-${t}`}
                      onPress={() => setTrigger(t === trigger ? '' : t)}
                      style={[styles.tag, trigger === t && styles.tagActive]}
                    >
                      <Text style={[styles.tagText, trigger === t && styles.tagTextActive]}>{t}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.section}>One sentence to your future self</Text>
                <TextInput
                  testID="relapse-note"
                  value={note}
                  onChangeText={setNote}
                  placeholder="Optional. e.g., next time, I'll close my phone at 11."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={280}
                  style={styles.input}
                />

                <PressableButton
                  testID="relapse-continue"
                  label="Continue"
                  onPress={() => setStep('confirm')}
                  fullWidth
                  style={{ marginTop: spacing.xl }}
                />
              </Animated.View>
            )}

            {step === 'confirm' && (
              <Animated.View style={{ alignItems: 'center', paddingTop: spacing.xl }}>
                <View style={styles.warnIcon}>
                  <Feather name="rotate-ccw" size={28} color={colors.warning} />
                </View>
                <Text style={[styles.title, { textAlign: 'center', marginTop: spacing.md }]}>Reset the counter?</Text>
                <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.lg }]}>
                  We&apos;ll save your previous streak as a personal best. Your fresh streak begins now.
                </Text>
                <PressableButton testID="relapse-submit" label="Yes, reset gently" variant="danger" onPress={submit} fullWidth style={{ marginTop: spacing.xl }} />
                <PressableButton testID="relapse-back" label="Go back" variant="ghost" onPress={() => setStep('compose')} fullWidth style={{ marginTop: spacing.sm }} />
              </Animated.View>
            )}

            {step === 'done' && (
              <Animated.View style={{ alignItems: 'center', paddingTop: spacing.xxl }} testID="relapse-done">
                <View style={[styles.warnIcon, { backgroundColor: colors.sageDim, borderColor: colors.sage }]}>
                  <Feather name="sun" size={28} color={colors.sage} />
                </View>
                <Text style={[styles.title, { textAlign: 'center', marginTop: spacing.md }]}>Day one. Again.</Text>
                <Text style={[type.bodyLg, { textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.lg, color: colors.textSecondary }]}>
                  Showing up is the entire game. You showed up.
                </Text>
                <PressableButton testID="relapse-finish" label="Continue" onPress={() => router.back()} fullWidth style={{ marginTop: spacing.xxl }} />
              </Animated.View>
            )}
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
  warnIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(226,125,96,0.16)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.warning,
  },
});
