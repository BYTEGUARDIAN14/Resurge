import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Polyline, Line } from 'react-native-svg';
import { colors, fonts, radii, spacing, type } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { StreakCalendar } from '../../src/components/StreakCalendar';
import { TopTriggers } from '../../src/components/TopTriggers';
import { useResurge } from '../../src/state';
import { api, Milestone } from '../../src/api';
import { breakdown, formatDuration } from '../../src/time';

const TAB_BAR_OFFSET = 96;

export default function Progress() {
  const insets = useSafeAreaInsets();
  const { streakStart, personalBestMs, urgesSurfed, sosUsed, journal, relapses } = useResurge();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => { api.milestones().then(setMilestones).catch(() => {}); }, []);

  const b = breakdown(streakStart);
  const currentBest = Math.max(personalBestMs, b.totalMs);

  const moodSeries = useMemo(() => {
    const days = 7;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const buckets: { day: string; avg: number | null }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dStart = new Date(today);
      dStart.setDate(dStart.getDate() - i);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(dStart);
      dEnd.setHours(23, 59, 59, 999);
      const inDay = journal.filter((j) => {
        const t = new Date(j.at).getTime();
        return t >= dStart.getTime() && t <= dEnd.getTime();
      });
      const avg = inDay.length === 0 ? null : inDay.reduce((s, e) => s + e.mood, 0) / inDay.length;
      buckets.push({ day: dStart.toLocaleDateString([], { weekday: 'short' }).slice(0, 1), avg });
    }
    return buckets;
  }, [journal]);

  return (
    <ScrollView
      testID="progress-screen"
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: TAB_BAR_OFFSET + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[type.label, { color: colors.primary }]}>progress</Text>
      <Text style={styles.title}>The shape of you</Text>

      <Animated.View style={styles.statsGrid}>
        <Stat icon="trending-up" label="Current streak" value={`${b.days}d ${b.hours}h`} />
        <Stat icon="award" label="Personal best" value={formatDuration(currentBest)} />
        <Stat icon="wind" label="Urges surfed" value={String(urgesSurfed)} />
        <Stat icon="alert-circle" label="SOS used" value={String(sosUsed)} />
        <Stat icon="book-open" label="Journal entries" value={String(journal.length)} />
        <Stat icon="rotate-ccw" label="Resets" value={String(relapses.length)} />
      </Animated.View>

      <Animated.View>
        <Card style={{ marginTop: spacing.md }} title="7-day mood" subtitle="Average mood per day from your journal">
          <MoodGraph series={moodSeries} />
        </Card>
      </Animated.View>

      <View style={{ marginTop: spacing.md }}>
        <StreakCalendar days={30} />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <TopTriggers />
      </View>

      <Animated.View>
        <Card style={{ marginTop: spacing.md }} title="milestones">
          <View style={styles.badgesGrid}>
            {milestones.map((m) => {
              const achieved = b.days >= m.days;
              return (
                <View key={m.days} testID={`badge-${m.days}`} style={[styles.badge, { borderColor: achieved ? `${m.color}80` : colors.hairlineStrong, opacity: achieved ? 1 : 0.45 }]}>
                  <View style={[styles.badgeIcon, { backgroundColor: `${m.color}1A`, borderColor: `${m.color}55` }]}>
                    <Feather name={m.icon as any} size={20} color={achieved ? m.color : colors.textMuted} />
                  </View>
                  <Text style={[styles.badgeDays, achieved && { color: m.color }]}>{m.days}d</Text>
                  <Text style={styles.badgeTitle}>{m.title}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const Stat: React.FC<{ icon: keyof typeof Feather.glyphMap; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <Feather name={icon} size={16} color={colors.textSecondary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MoodGraph: React.FC<{ series: { day: string; avg: number | null }[] }> = ({ series }) => {
  const W = 280; const H = 140; const padX = 12; const padY = 16;
  const pts = series.map((s, i) => {
    const x = padX + (i * (W - padX * 2)) / Math.max(1, series.length - 1);
    const y = s.avg == null ? null : (H - padY) - ((s.avg - 1) / 4) * (H - padY * 2);
    return { x, y };
  });
  const polyPoints = pts.filter((p) => p.y != null).map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={{ alignItems: 'center', marginTop: spacing.sm }}>
      <Svg width={W} height={H}>
        {[1, 2, 3, 4, 5].map((m) => {
          const y = (H - padY) - ((m - 1) / 4) * (H - padY * 2);
          return <Line key={m} x1={padX} y1={y} x2={W - padX} y2={y} stroke={colors.hairline} strokeWidth={1} />;
        })}
        {polyPoints.length > 0 && (
          <Polyline points={polyPoints} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        )}
      </Svg>
      <View style={{ flexDirection: 'row', width: W, justifyContent: 'space-between', paddingHorizontal: padX, marginTop: 4 }}>
        {series.map((s, i) => (
          <Text key={i} style={[type.caption, { fontSize: 11 }]}>{s.day}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg },
  title: { ...type.h1, marginTop: 4, marginBottom: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    width: '31.5%', padding: spacing.md, backgroundColor: colors.surface,
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.hairline,
  },
  statValue: { fontFamily: fonts.headingExtraBold, fontSize: 16, color: colors.text, marginTop: spacing.sm, letterSpacing: -0.5 },
  statLabel: { ...type.caption, fontSize: 11, marginTop: 2 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  badge: {
    width: '31.5%', padding: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: radii.md,
    borderWidth: 1, alignItems: 'center',
  },
  badgeIcon: { width: 44, height: 44, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  badgeDays: { fontFamily: fonts.headingExtraBold, fontSize: 14, color: colors.text, marginTop: spacing.sm },
  badgeTitle: { ...type.caption, fontSize: 11, marginTop: 2, textAlign: 'center' },
});
