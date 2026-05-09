import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, spacing, type } from '../theme';
import { useResurge, todayKey } from '../state';
import { breakdown } from '../time';

// Returns this week as Mon..Sun bounds
function weekBounds(d: Date = new Date()): { start: Date; end: Date; isSunday: boolean } {
  const day = d.getDay(); // 0 Sun .. 6 Sat
  // Monday start
  const offset = (day + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end, isSunday: day === 0 };
}

export const WeeklySummaryCard: React.FC = () => {
  const { journal, relapses, habitLog, wins, urgesSurfed, streakStart } = useResurge();

  const data = useMemo(() => {
    const { start, end, isSunday } = weekBounds();

    // journal entries this week
    const wkJournal = journal.filter((j) => {
      const t = new Date(j.at).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    const wkRelapses = relapses.filter((r) => {
      const t = new Date(r.at).getTime();
      return t >= start.getTime() && t < end.getTime();
    });

    // average mood
    const avgMood = wkJournal.length === 0 ? null :
      wkJournal.reduce((s, e) => s + e.mood, 0) / wkJournal.length;

    // habits done this week (sum of all completions)
    let habitsDone = 0;
    let cleanDaysPossible = 0;
    let cleanDays = 0;
    const startTs = streakStart ? new Date(streakStart).getTime() : null;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (d.getTime() > Date.now()) break;
      cleanDaysPossible++;
      const k = todayKey(d);
      habitsDone += (habitLog[k] ?? []).length;
      const hadRelapse = wkRelapses.some((r) => todayKey(new Date(r.at)) === k);
      const dayMidnight = new Date(d); dayMidnight.setHours(0, 0, 0, 0);
      const isClean = startTs != null && dayMidnight.getTime() >= new Date(startTs).setHours(0, 0, 0, 0) && !hadRelapse;
      if (isClean) cleanDays++;
    }

    // top trigger this week
    const trigCounts = new Map<string, number>();
    wkJournal.forEach((j) => j.triggers.forEach((t) => trigCounts.set(t, (trigCounts.get(t) ?? 0) + 1)));
    wkRelapses.forEach((r) => { if (r.trigger) trigCounts.set(r.trigger, (trigCounts.get(r.trigger) ?? 0) + 1); });
    const topTrigger = Array.from(trigCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      isSunday,
      cleanDays, cleanDaysPossible,
      avgMood,
      habitsDone,
      journalCount: wkJournal.length,
      topTrigger,
      wins,
      urgesSurfed,
    };
  }, [journal, relapses, habitLog, wins, urgesSurfed, streakStart]);

  return (
    <View style={styles.wrap} testID="weekly-summary-card">
      <LinearGradient
        colors={[colors.primarySoft, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
      />
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Feather name="bar-chart-2" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={[type.label, { color: colors.primary }]}>{data.isSunday ? 'your week' : 'this week so far'}</Text>
          <Text style={[type.h3, { marginTop: 2 }]}>
            {data.cleanDays}/{data.cleanDaysPossible} clean days
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <Stat icon="smile" label="avg mood" value={data.avgMood == null ? '—' : data.avgMood.toFixed(1)} />
        <Stat icon="check-circle" label="habits" value={String(data.habitsDone)} />
        <Stat icon="edit-3" label="journal" value={String(data.journalCount)} />
        <Stat icon="wind" label="urges surfed" value={String(data.urgesSurfed)} />
        <Stat icon="star" label="wins" value={String(data.wins)} />
        <Stat icon="alert-triangle" label="top trigger" value={data.topTrigger ?? '—'} small />
      </View>

      {data.isSunday && (
        <View style={styles.reflect}>
          <Feather name="sun" size={14} color={colors.gold} />
          <Text style={styles.reflectText}>
            It&apos;s Sunday — reflect on your week, then begin again tomorrow.
          </Text>
        </View>
      )}
    </View>
  );
};

const Stat: React.FC<{ icon: keyof typeof Feather.glyphMap; label: string; value: string; small?: boolean }> = ({ icon, label, value, small }) => (
  <View style={styles.stat}>
    <Feather name={icon} size={13} color={colors.textSecondary} />
    <Text style={[styles.statValue, small && { fontSize: 12 }]} numberOfLines={1}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryDim, borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    width: '31.5%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  statValue: { fontFamily: fonts.headingExtraBold, fontSize: 16, color: colors.text, marginTop: 6, letterSpacing: -0.4 },
  statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2, textTransform: 'lowercase' },
  reflect: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.md, padding: 10,
    backgroundColor: colors.goldDim, borderRadius: radii.md,
    borderWidth: 1, borderColor: 'rgba(244,199,123,0.35)',
  },
  reflectText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.gold, marginLeft: 8, flex: 1 },
});
