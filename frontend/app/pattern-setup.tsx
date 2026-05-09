import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { useResurge } from '../src/state';
import { PatternLock } from '../src/components/PatternLock';
import { PressableButton } from '../src/components/PressableButton';

type Step = 'create' | 'confirm' | 'done';

export default function PatternSetup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setLockPattern, lockEnabled, clearLock } = useResurge();
  const [step, setStep] = useState<Step>('create');
  const [first, setFirst] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetKey, setResetKey] = useState(0);

  const onComplete = async (pattern: string) => {
    if (step === 'create') {
      if (!pattern) {
        setStatus('error');
        setTimeout(() => { setStatus('idle'); setResetKey((k) => k + 1); }, 600);
        return;
      }
      setFirst(pattern);
      setStep('confirm');
      setResetKey((k) => k + 1);
    } else if (step === 'confirm') {
      if (pattern === first) {
        await setLockPattern(pattern);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setStatus('success');
        setStep('done');
      } else {
        setStatus('error');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setTimeout(() => {
          setStatus('idle');
          setResetKey((k) => k + 1);
          setStep('create');
          setFirst('');
        }, 800);
      }
    }
  };

  const onDisable = () => {
    Alert.alert(
      'Remove pattern lock?',
      'Your data is no longer protected by a pattern. You can re-enable later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => { await clearLock(); router.back(); },
        },
      ],
    );
  };

  const heading = step === 'create' ? 'Draw a new pattern' :
                  step === 'confirm' ? 'Draw it again to confirm' :
                  'Pattern lock enabled';
  const sub = step === 'create' ? 'At least 4 dots. Drag to connect them.' :
              step === 'confirm' ? 'This is what unlocks Resurge from now on.' :
              'You\'ll see this every time you open the app.';

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]} testID="pattern-setup-screen">
      <View style={styles.header}>
        <Pressable testID="setup-close" onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.label, { color: colors.primary }]}>pattern lock</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{heading}</Text>
        <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.md }]}>{sub}</Text>

        <View style={{ marginTop: spacing.xxl, alignItems: 'center' }}>
          {step !== 'done' ? (
            <PatternLock onComplete={onComplete} resetKey={resetKey} status={status} testID="setup-pattern" />
          ) : (
            <View style={styles.doneBadge}>
              <Feather name="check" size={48} color={colors.success} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {step === 'done' ? (
          <PressableButton testID="setup-finish" label="Done" onPress={() => router.back()} fullWidth />
        ) : (
          <View style={{ alignItems: 'center', gap: 12 }}>
            {lockEnabled && (
              <PressableButton testID="setup-disable" label="Remove pattern lock" variant="ghost" fullWidth onPress={onDisable} />
            )}
            <Text style={[type.caption, { textAlign: 'center', paddingHorizontal: spacing.lg }]}>
              Forgot a pattern means erasing all data. Pick something memorable.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: {
    width: 40, height: 40, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.h1, textAlign: 'center' },
  doneBadge: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: colors.sageDim, borderWidth: 2, borderColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { paddingTop: spacing.lg },
});
