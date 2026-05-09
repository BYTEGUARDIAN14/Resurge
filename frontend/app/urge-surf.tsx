import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { useResurge } from '../src/state';
import { PressableButton } from '../src/components/PressableButton';

const PHASES: { key: 'inhale' | 'hold1' | 'exhale' | 'hold2'; label: string; seconds: number }[] = [
  { key: 'inhale', label: 'Breathe in', seconds: 4 },
  { key: 'hold1', label: 'Hold', seconds: 4 },
  { key: 'exhale', label: 'Breathe out', seconds: 4 },
  { key: 'hold2', label: 'Hold', seconds: 4 },
];

const TOTAL_SECONDS = 5 * 60; // 5 minutes

export default function UrgeSurf() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { incUrgesSurfed } = useResurge();

  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [phaseSecondLeft, setPhaseSecondLeft] = useState(PHASES[0].seconds);
  const completedRef = useRef(false);

  const scale = useSharedValue(0.5);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // animate the orb based on the active phase
  const advanceTo = (idx: number) => {
    const phase = PHASES[idx];
    const target = phase.key === 'inhale' ? 1 : phase.key === 'exhale' ? 0.5 : phase.key === 'hold1' ? 1 : 0.5;
    scale.value = withTiming(target, { duration: phase.seconds * 1000, easing: Easing.inOut(Easing.quad) });
    Haptics.selectionAsync().catch(() => {});
  };

  useEffect(() => {
    if (!running) return;
    advanceTo(phaseIdx);
    const id = setInterval(() => {
      setPhaseSecondLeft((s) => {
        if (s > 1) return s - 1;
        const nextIdx = (phaseIdx + 1) % PHASES.length;
        setPhaseIdx(nextIdx);
        return PHASES[nextIdx].seconds;
      });
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx]);

  useEffect(() => {
    if (running && secondsLeft === 0 && !completedRef.current) {
      completedRef.current = true;
      incUrgesSurfed().catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [secondsLeft, running, incUrgesSurfed]);

  const start = () => {
    setRunning(true);
    setPhaseIdx(0);
    setPhaseSecondLeft(PHASES[0].seconds);
    setSecondsLeft(TOTAL_SECONDS);
    completedRef.current = false;
  };

  const stop = async () => {
    if (running && !completedRef.current) {
      await incUrgesSurfed();
    }
    router.back();
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const phase = PHASES[phaseIdx];

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]} testID="urge-surf-screen">
      <LinearGradient colors={[colors.bg, '#0E1410']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable testID="urge-close" onPress={stop} style={styles.closeBtn}>
          <Feather name="x" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.label, { color: colors.sage }]}>urge surfing</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={styles.center}>
        <View style={styles.orbWrap}>
          <Animated.View style={[styles.orb, ringStyle]}>
            <LinearGradient
              colors={['rgba(79,209,197,0.55)', 'rgba(79,209,197,0.15)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          <View style={styles.orbCenter}>
            <Text style={styles.phaseLabel}>{running ? phase.label : 'Ready'}</Text>
            <Text style={styles.phaseTime}>{running ? phaseSecondLeft : '·'}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={styles.footer}>
        <Text style={styles.bigTime}>{mins}:{secs.toString().padStart(2, '0')}</Text>
        <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: 2 }]}>
          {running ? 'Stay with the breath. The wave is passing.' : 'Five minutes of box breathing — 4·4·4·4'}
        </Text>
        {!running ? (
          <PressableButton testID="urge-start" label="Begin" onPress={start} fullWidth style={{ marginTop: spacing.lg }} />
        ) : (
          <PressableButton testID="urge-end" label="End early" variant="ghost" onPress={stop} fullWidth style={{ marginTop: spacing.lg }} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: {
    width: 40, height: 40, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbWrap: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  orb: {
    width: 280, height: 280, borderRadius: 140, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(79,209,197,0.5)',
  },
  orbCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { fontFamily: fonts.headingSemiBold, fontSize: 20, color: colors.text, letterSpacing: -0.3 },
  phaseTime: { fontFamily: fonts.headingExtraBold, fontSize: 56, color: colors.text, marginTop: 4, letterSpacing: -2 },
  footer: { alignItems: 'center', paddingTop: spacing.lg },
  bigTime: { fontFamily: fonts.headingExtraBold, fontSize: 36, color: colors.text, letterSpacing: -1 },
});
