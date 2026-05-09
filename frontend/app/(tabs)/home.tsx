import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LiveCounter } from '../../src/components/LiveCounter';
import { ProgressRing } from '../../src/components/ProgressRing';
import { Card } from '../../src/components/Card';
import { HabitTracker } from '../../src/components/HabitTracker';
import { TimeReclaimedCard } from '../../src/components/TimeReclaimedCard';
import { WinButton } from '../../src/components/WinButton';
import { WeeklySummaryCard } from '../../src/components/WeeklySummaryCard';
import { colors, fonts, radii, spacing, type } from '../../src/theme';
import { useResurge } from '../../src/state';
import { api, Quote, Milestone } from '../../src/api';
import { breakdown, formatDuration } from '../../src/time';

const TAB_BAR_OFFSET = 96;

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, streakStart, personalBestMs, urgesSurfed } = useResurge();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuote = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const q = await api.dailyQuote(today);
      setQuote(q);
    } catch {}
  };

  const loadMilestones = async () => {
    try {
      const m = await api.milestones();
      setMilestones(m);
    } catch {}
  };

  useEffect(() => { loadQuote(); loadMilestones(); }, []);

  // Refresh reads from cache — instant, no network call.
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadQuote(), loadMilestones()]);
    setRefreshing(false);
  };

  const b = breakdown(streakStart);
  const goal = user?.goalDays ?? 30;
  const goalProgress = Math.min(1, b.totalMs / (goal * 86_400_000));

  const { next, achievedCount } = useMemo(() => {
    if (milestones.length === 0) return { next: null as Milestone | null, achievedCount: 0 };
    const days = b.days;
    const upcoming = milestones.find((m) => m.days > days);
    const reached = milestones.filter((m) => m.days <= days).length;
    return { next: upcoming ?? null, achievedCount: reached };
  }, [milestones, b.days]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return 'Late night strength,';
    if (h < 12) return 'Good morning,';
    if (h < 18) return 'Good afternoon,';
    return 'Good evening,';
  })();

  return (
    <ScrollView
      testID="home-screen"
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: TAB_BAR_OFFSET + spacing.xl }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[type.bodyMuted, { fontSize: 14 }]}>{greeting}</Text>
          <Text style={styles.userName}>{user?.name ?? 'Friend'}</Text>
        </View>
        <Pressable testID="open-settings" onPress={() => router.push('/settings')} hitSlop={12}>
          <View style={styles.iconBtn}>
            <Feather name="settings" size={20} color={colors.textSecondary} />
          </View>
        </Pressable>
      </View>

      <Animated.View style={styles.heroWrap}>
        <View style={styles.ringWrap}>
          <View style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={[colors.primarySoft, 'transparent']}
              style={styles.heroGlow}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          <ProgressRing size={300} strokeWidth={6} progress={goalProgress} />
          <View style={styles.ringInner}>
            <LiveCounter startIso={streakStart} />
          </View>
        </View>
        <Text style={[type.caption, { textAlign: 'center', marginTop: spacing.md }]}>
          {Math.round(goalProgress * 100)}% toward your {goal}-day goal
        </Text>
      </Animated.View>

      {quote && (
        <Animated.View>
          <Card testID="daily-quote-card" style={styles.quoteCard}>
            <View style={styles.quoteIconWrap}>
              <Feather name="sun" size={16} color={colors.primary} />
              <Text style={[type.label, { color: colors.primary, marginLeft: 6 }]}>quote of the day</Text>
            </View>
            <Text style={styles.quoteText}>“{quote.text}”</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </Card>
        </Animated.View>
      )}

      {next && (
        <Animated.View>
          <Card testID="next-milestone-card" style={{ marginTop: spacing.md }}>
            <View style={styles.milestoneRow}>
              <View style={[styles.milestoneIcon, { backgroundColor: `${next.color}22`, borderColor: `${next.color}55` }]}>
                <Feather name={next.icon as any} size={22} color={next.color} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[type.label, { color: colors.textSecondary }]}>next milestone</Text>
                <Text style={[type.h3, { marginTop: 2 }]}>{next.title}</Text>
                <Text style={[type.bodyMuted, { marginTop: 2 }]}>{Math.max(0, next.days - b.days)} days to go · {next.subtitle}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      )}

      <Animated.View style={styles.statsRow}>
        <StatBlock testID="stat-best" label="Personal best" value={formatDuration(Math.max(personalBestMs, b.totalMs))} icon="award" />
        <StatBlock testID="stat-badges" label="Badges" value={`${achievedCount}/${milestones.length || 9}`} icon="shield" />
        <StatBlock testID="stat-urges" label="Urges surfed" value={String(urgesSurfed)} icon="wind" />
      </Animated.View>

      <View style={styles.actionsRow}>
        <ActionTile
          testID="action-urge-surf"
          icon="wind"
          label="Urge surf"
          subtitle="Box breathing"
          tint={colors.sage}
          onPress={() => router.push('/urge-surf')}
        />
        <ActionTile
          testID="action-journal"
          icon="edit-3"
          label="Log mood"
          subtitle="Track today"
          tint={colors.primary}
          onPress={() => router.push('/journal-entry')}
        />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <HabitTracker />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <TimeReclaimedCard />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <WeeklySummaryCard />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <WinButton />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <Pressable testID="emergency-sos" onPress={() => router.push('/emergency')} style={styles.sosBtn}>
          <View style={styles.sosInner}>
            <Feather name="alert-circle" size={20} color={colors.emergency} />
            <Text style={styles.sosLabel}>EMERGENCY · I need help right now</Text>
          </View>
        </Pressable>
      </View>

      <Pressable testID="open-relapse" onPress={() => router.push('/relapse')} style={styles.relapseBtn}>
        <Text style={[type.bodyMuted, { fontSize: 13 }]}>Slipped? Reset gently — without judgment</Text>
      </Pressable>
    </ScrollView>
  );
}

const StatBlock: React.FC<{ label: string; value: string; icon: keyof typeof Feather.glyphMap; testID: string }> = ({ label, value, icon, testID }) => (
  <View testID={testID} style={styles.statBlock}>
    <Feather name={icon} size={16} color={colors.textSecondary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionTile: React.FC<{ icon: keyof typeof Feather.glyphMap; label: string; subtitle: string; tint: string; onPress: () => void; testID: string }> = ({ icon, label, subtitle, tint, onPress, testID }) => (
  <Pressable testID={testID} onPress={onPress} style={styles.actionTile}>
    <View style={[styles.actionIcon, { backgroundColor: `${tint}1A`, borderColor: `${tint}55` }]}>
      <Feather name={icon} size={20} color={tint} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
    <Text style={styles.actionSub}>{subtitle}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { ...type.h2, marginTop: 2 },
  iconBtn: {
    width: 42, height: 42, borderRadius: radii.full, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  heroWrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  ringWrap: { alignItems: 'center', justifyContent: 'center', width: 300, height: 300 },
  heroGlow: { flex: 1, borderRadius: 200 },
  ringInner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  quoteCard: { marginTop: spacing.lg, backgroundColor: colors.surface },
  quoteIconWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  quoteText: { ...type.bodyLg, fontFamily: fonts.headingSemiBold, lineHeight: 28 },
  quoteAuthor: { ...type.bodyMuted, marginTop: spacing.sm, fontSize: 13 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center' },
  milestoneIcon: {
    width: 56, height: 56, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statBlock: {
    flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.hairline,
  },
  statValue: { fontFamily: fonts.headingExtraBold, fontSize: 18, color: colors.text, marginTop: spacing.sm, letterSpacing: -0.5 },
  statLabel: { ...type.caption, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionTile: {
    flex: 1, padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.hairline,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: spacing.md,
  },
  actionLabel: { fontFamily: fonts.headingSemiBold, fontSize: 17, color: colors.text },
  actionSub: { ...type.caption, marginTop: 2 },
  sosBtn: {
    backgroundColor: colors.emergencyDim, borderRadius: radii.full, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(217,93,57,0.5)',
  },
  sosInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  sosLabel: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.emergency, letterSpacing: 1.4, marginLeft: spacing.sm },
  relapseBtn: { alignItems: 'center', marginTop: spacing.lg, padding: spacing.md },
});
