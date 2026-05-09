import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, spacing, type } from '../theme';
import { PatternLock } from './PatternLock';
import { useResurge } from '../state';

// The lock gate. Renders when the user has set a pattern and the app
// is not yet authenticated for this session.
export const LockScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { verifyPattern, unlock, user } = useResurge();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetKey, setResetKey] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const onComplete = (pattern: string) => {
    if (!pattern) {
      setStatus('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setTimeout(() => { setStatus('idle'); setResetKey((k) => k + 1); }, 700);
      return;
    }
    if (verifyPattern(pattern)) {
      setStatus('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => unlock(), 320);
    } else {
      setStatus('error');
      setAttempts((a) => a + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setTimeout(() => { setStatus('idle'); setResetKey((k) => k + 1); }, 700);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl }]} testID="lock-screen">
      <LinearGradient
        colors={[colors.primarySoft, 'transparent']}
        style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.6 }}
      />

      <View style={styles.brand}>
        <View style={styles.brandIcon}><Feather name="lock" size={20} color={colors.primary} /></View>
        <Text style={styles.brandName}>Resurge</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>Welcome back{user?.name ? `, ${user.name}` : ''}</Text>
        <Text style={styles.sub}>Draw your pattern to continue.</Text>
        <View style={{ marginTop: spacing.xxl }}>
          <PatternLock onComplete={onComplete} resetKey={resetKey} status={status} testID="lock-pattern" />
        </View>
        {attempts >= 3 && (
          <Text style={styles.hint}>
            Forgot your pattern? You can erase all data from app settings — but that wipes your streak too.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryDim, borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontFamily: fonts.headingExtraBold, fontSize: 22, color: colors.text, marginLeft: spacing.sm, letterSpacing: -0.5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.h2, textAlign: 'center' },
  sub: { ...type.bodyMuted, marginTop: spacing.sm, textAlign: 'center' },
  hint: {
    fontFamily: fonts.body, fontSize: 12, color: colors.textMuted,
    textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.md, lineHeight: 18,
  },
});
