import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { useResurge } from '../src/state';
import { PressableButton } from '../src/components/PressableButton';

type Mode = 'menu' | 'cold' | 'pushup';

export default function Emergency() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { incSosUsed } = useResurge();
  const [mode, setMode] = useState<Mode>('menu');

  useEffect(() => {
    incSosUsed().catch(() => {});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, [incSosUsed]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]} testID="emergency-screen">
      <LinearGradient colors={[colors.bg, '#150909']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable testID="emergency-close" onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.label, { color: colors.emergency }]}>SOS · you are safe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        {mode === 'menu' && (
          <Animated.View>
            <Text style={styles.title}>Pick one. Now.</Text>
            <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
              The urge dies in 90 seconds if you don&apos;t feed it. You only need to last 90 seconds.
            </Text>

            <Tile
              testID="sos-breathe"
              title="Breathe through it"
              subtitle="5 minutes of box breathing"
              icon="wind"
              tint={colors.sage}
              onPress={() => router.replace('/urge-surf')}
            />
            <Tile
              testID="sos-cold"
              title="Cold shock — 60 seconds"
              subtitle="Run cold water on your face or wrists"
              icon="droplet"
              tint="#5A9DBF"
              onPress={() => setMode('cold')}
            />
            <Tile
              testID="sos-pushup"
              title="20 push-ups"
              subtitle="Move the energy out of your body"
              icon="zap"
              tint={colors.warning}
              onPress={() => setMode('pushup')}
            />

            <Text style={[type.caption, { textAlign: 'center', marginTop: spacing.lg }]}>
              You came here. That is already the harder choice.
            </Text>
          </Animated.View>
        )}

        {mode === 'cold' && <Countdown title="Cold shock" subtitle="60 seconds. Stay with it." seconds={60} onDone={() => router.back()} testID="cold-countdown" />}
        {mode === 'pushup' && <Pushup onDone={() => router.back()} />}
      </ScrollView>
    </View>
  );
}

const Tile: React.FC<{ title: string; subtitle: string; icon: keyof typeof Feather.glyphMap; tint: string; onPress: () => void; testID: string }> = ({ title, subtitle, icon, tint, onPress, testID }) => (
  <Pressable testID={testID} onPress={onPress} style={styles.tile}>
    <View style={[styles.tileIcon, { backgroundColor: `${tint}1A`, borderColor: `${tint}66` }]}>
      <Feather name={icon} size={22} color={tint} />
    </View>
    <View style={{ flex: 1, marginLeft: spacing.md }}>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSub}>{subtitle}</Text>
    </View>
    <Feather name="arrow-right" size={20} color={colors.textMuted} />
  </Pressable>
);

const Countdown: React.FC<{ title: string; subtitle: string; seconds: number; onDone: () => void; testID: string }> = ({ title, subtitle, seconds, onDone, testID }) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [left, onDone]);
  return (
    <Animated.View style={{ alignItems: 'center', paddingTop: spacing.xl }} testID={testID}>
      <Text style={[type.label, { color: colors.warning }]}>{title}</Text>
      <Text style={styles.timer}>{left}</Text>
      <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: spacing.md }]}>{subtitle}</Text>
    </Animated.View>
  );
};

const Pushup: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [count, setCount] = useState(0);
  const target = 20;
  return (
    <Animated.View style={{ alignItems: 'center', paddingTop: spacing.xl }} testID="pushup-counter">
      <Text style={[type.label, { color: colors.warning }]}>push-ups</Text>
      <Text style={styles.timer}>{count}<Text style={{ color: colors.textMuted, fontSize: 28 }}> / {target}</Text></Text>
      <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xl }]}>
        Tap each rep. Your body is voting against the urge.
      </Text>
      <Pressable
        testID="pushup-tap"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          setCount((c) => Math.min(target, c + 1));
        }}
        style={styles.tapBtn}
      >
        <Text style={styles.tapBtnText}>TAP REP</Text>
      </Pressable>
      <PressableButton
        testID="pushup-done"
        label={count >= target ? 'Done' : `Finish (${count})`}
        variant="ghost"
        onPress={onDone}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: {
    width: 40, height: 40, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  title: { ...type.h1 },
  tile: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline, marginBottom: spacing.md,
  },
  tileIcon: { width: 52, height: 52, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  tileTitle: { fontFamily: fonts.headingSemiBold, fontSize: 18, color: colors.text },
  tileSub: { ...type.caption, marginTop: 2 },
  timer: { fontFamily: fonts.headingExtraBold, fontSize: 96, color: colors.text, letterSpacing: -3, marginTop: spacing.md },
  tapBtn: {
    width: 220, height: 220, borderRadius: 110, backgroundColor: colors.emergencyDim,
    borderWidth: 2, borderColor: colors.emergency, alignItems: 'center', justifyContent: 'center',
  },
  tapBtnText: { fontFamily: fonts.headingExtraBold, fontSize: 20, color: colors.emergency, letterSpacing: 3 },
});
