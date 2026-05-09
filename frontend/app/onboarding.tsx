import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView,
  Platform, Pressable, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableButton } from '../src/components/PressableButton';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { useResurge } from '../src/state';
import { requestPermissions, scheduleDailyEncouragements } from '../src/notifications';

const GOAL_OPTIONS = [7, 14, 30, 60, 90, 365];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUser, setOnboarded, setNotifEnabled } = useResurge();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [goalDays, setGoalDays] = useState(30);

  const stepOk = (() => {
    if (step === 0) return name.trim().length >= 1;
    if (step === 1) return true;
    if (step === 2) return goalDays > 0;
    return true;
  })();

  const next = async () => {
    if (step < 2) { setStep(step + 1); return; }
    await setUser({
      name: name.trim() || 'Friend',
      reason: reason.trim(),
      goalDays,
      createdAt: new Date().toISOString(),
    });
    const granted = await requestPermissions();
    await setNotifEnabled(granted);
    if (granted) await scheduleDailyEncouragements();
    await setOnboarded(true);
    router.replace('/(tabs)/home');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]} testID="onboarding-screen">
        <LinearGradient
          colors={[colors.bg, '#0E0E12', colors.bg]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.progressBar}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === 0 && (
              <Animated.View exiting={FadeOut.duration(200)}>
                <Text style={[type.label, { color: colors.primary }]}>welcome to resurge</Text>
                <Text style={styles.title}>What should we call you?</Text>
                <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
                  This stays on your phone. No accounts, no tracking — your recovery is yours alone.
                </Text>
                <TextInput
                  testID="onboarding-name-input"
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name or alias"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => stepOk && next()}
                />
              </Animated.View>
            )}

            {step === 1 && (
              <Animated.View exiting={FadeOut.duration(200)}>
                <Text style={[type.label, { color: colors.primary }]}>why are you here?</Text>
                <Text style={styles.title}>What are you reclaiming?</Text>
                <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
                  In one sentence — for your eyes only. You can leave this blank.
                </Text>
                <TextInput
                  testID="onboarding-reason-input"
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g., my focus, my self-respect, my time"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.md }]}
                  multiline
                  maxLength={140}
                />
                <Text style={[type.caption, { textAlign: 'right', marginTop: 4 }]}>{reason.length}/140</Text>
              </Animated.View>
            )}

            {step === 2 && (
              <Animated.View exiting={FadeOut.duration(200)}>
                <Text style={[type.label, { color: colors.primary }]}>your first goal</Text>
                <Text style={styles.title}>How many days will you commit to first?</Text>
                <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
                  Start small. You can change this any time. Most people pick 30.
                </Text>
                <View style={styles.goalGrid}>
                  {GOAL_OPTIONS.map((days) => (
                    <Pressable
                      key={days}
                      testID={`goal-pill-${days}`}
                      onPress={() => setGoalDays(days)}
                      style={[styles.pill, goalDays === days && styles.pillActive]}
                    >
                      <Text style={[styles.pillNum, goalDays === days && styles.pillNumActive]}>{days}</Text>
                      <Text style={[styles.pillLabel, goalDays === days && styles.pillLabelActive]}>days</Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          {step > 0 && (
            <Pressable testID="onboarding-back" onPress={() => setStep(step - 1)} style={styles.back}>
              <Feather name="arrow-left" size={20} color={colors.textSecondary} />
              <Text style={[type.bodyMuted, { marginLeft: spacing.sm }]}>Back</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <PressableButton
            testID="onboarding-next"
            label={step === 2 ? 'Begin' : 'Continue'}
            onPress={next}
            disabled={!stepOk}
            icon={<Feather name="arrow-right" size={18} color={colors.textInverse} />}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  progressBar: { flexDirection: 'row', gap: 6, marginBottom: spacing.xl },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.hairlineStrong },
  dotActive: { backgroundColor: colors.primary },
  scroll: { paddingTop: spacing.xl, paddingBottom: spacing.xl },
  title: { ...type.h1, marginTop: spacing.md, lineHeight: 40 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.text,
  },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  pill: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  pillNum: { fontFamily: fonts.headingExtraBold, fontSize: 28, color: colors.text },
  pillNumActive: { color: colors.primary },
  pillLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
  pillLabelActive: { color: colors.primary },
  footer: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md },
  back: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingRight: spacing.md },
});
