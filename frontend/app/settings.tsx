import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { useResurge } from '../src/state';
import { Card } from '../src/components/Card';
import { PressableButton } from '../src/components/PressableButton';
import { cancelAll, requestPermissions, scheduleDailyEncouragements } from '../src/notifications';

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, notifEnabled, hapticsEnabled, lockEnabled, setNotifEnabled, setHapticsEnabled, wipe, resetStreak } = useResurge();
  const [working, setWorking] = useState(false);

  const toggleNotif = async (v: boolean) => {
    if (v) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Notifications blocked', 'Enable notifications for Resurge in your system settings.');
        return;
      }
      await scheduleDailyEncouragements();
    } else {
      await cancelAll();
    }
    await setNotifEnabled(v);
  };

  const onResetStreak = () => {
    Alert.alert(
      'Restart your streak?',
      'This sets your day-counter back to zero. Use this if you want a fresh start without logging a relapse.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restart now', style: 'destructive', onPress: () => resetStreak() },
      ],
    );
  };

  const onWipe = () => {
    Alert.alert(
      'Erase all Resurge data?',
      'Everything on this device — streak, journal, settings — will be deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase everything',
          style: 'destructive',
          onPress: async () => {
            setWorking(true);
            await cancelAll();
            await wipe();
            setWorking(false);
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      testID="settings-screen"
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View style={styles.header}>
        <Pressable testID="settings-close" onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.label, { color: colors.primary }]}>settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.title}>Your Resurge</Text>
      <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        Hello, {user?.name ?? 'friend'}. Everything stays on this device.
      </Text>

      <Card title="preferences" style={{ marginBottom: spacing.md }}>
        <Row
          label="Daily encouragement"
          subtitle="Local notifications · 8am, 9:30pm, 11:30pm"
          value={notifEnabled}
          onChange={toggleNotif}
          testID="toggle-notif"
        />
        <View style={styles.divider} />
        <Row
          label="Haptic feedback"
          subtitle="Tactile confirmations on key actions"
          value={hapticsEnabled}
          onChange={setHapticsEnabled}
          testID="toggle-haptics"
        />
      </Card>

      <Card title="your goal">
        <Text style={[type.bodyLg, { marginBottom: spacing.sm }]}>{user?.goalDays ?? 30} days</Text>
        {user?.reason ? <Text style={[type.bodyMuted]}>“{user.reason}”</Text> : null}
      </Card>

      <View style={{ marginTop: spacing.md }}>
        <Card title="privacy">
          <Pressable
            testID="settings-pattern-lock"
            onPress={() => router.push('/pattern-setup')}
            style={styles.row}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text }}>Pattern lock</Text>
              <Text style={[type.caption, { marginTop: 2 }]}>
                {lockEnabled ? 'Active · tap to change or remove' : 'Off · tap to set up'}
              </Text>
            </View>
            <View style={[styles.lockPill, lockEnabled && { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}>
              <Feather name={lockEnabled ? 'lock' : 'unlock'} size={14} color={lockEnabled ? colors.primary : colors.textMuted} />
              <Text style={[styles.lockPillText, lockEnabled && { color: colors.primary }]}>
                {lockEnabled ? 'On' : 'Off'}
              </Text>
            </View>
          </Pressable>
        </Card>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <PressableButton testID="settings-restart-streak" label="Restart streak (no relapse)" variant="ghost" fullWidth onPress={onResetStreak} />
      </View>

      <View style={{ marginTop: spacing.sm }}>
        <PressableButton testID="settings-wipe" label="Erase all data" variant="danger" fullWidth onPress={onWipe} loading={working} />
      </View>

      <Text style={[type.caption, { textAlign: 'center', marginTop: spacing.xl }]}>
        Resurge · v1.0.0 · made with care
      </Text>
    </ScrollView>
  );
}

const Row: React.FC<{ label: string; subtitle: string; value: boolean; onChange: (v: boolean) => void; testID: string }> = ({ label, subtitle, value, onChange, testID }) => (
  <View style={styles.row} testID={testID}>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text }}>{label}</Text>
      <Text style={[type.caption, { marginTop: 2 }]}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.surfaceElevated, true: colors.primaryDim }}
      thumbColor={value ? colors.primary : colors.textMuted}
    />
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: {
    width: 40, height: 40, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  title: { ...type.h1, marginTop: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: spacing.md },
  lockPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  lockPillText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.textMuted, marginLeft: 6, letterSpacing: 1 },
});
