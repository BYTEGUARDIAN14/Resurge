import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing, type } from '../theme';
import { useResurge } from '../state';

export const TopTriggers: React.FC = () => {
  const { journal, relapses } = useResurge();

  const top = useMemo(() => {
    const counts = new Map<string, number>();
    journal.forEach((j) => j.triggers.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    relapses.forEach((r) => { if (r.trigger) counts.set(r.trigger, (counts.get(r.trigger) ?? 0) + 1); });
    const arr = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return arr;
  }, [journal, relapses]);

  if (top.length === 0) {
    return (
      <View style={styles.wrap} testID="top-triggers">
        <Text style={[type.label]}>top triggers</Text>
        <Text style={[type.bodyMuted, { marginTop: spacing.sm }]}>
          Log a few journal entries with triggers to see your patterns appear here.
        </Text>
      </View>
    );
  }

  const max = top[0][1];
  return (
    <View style={styles.wrap} testID="top-triggers">
      <Text style={[type.label]}>top triggers</Text>
      <Text style={[type.bodyMuted, { marginTop: 4, marginBottom: spacing.md }]}>
        Patterns you keep meeting. Awareness is the first move.
      </Text>
      {top.map(([name, count], idx) => {
        const pct = (count / max) * 100;
        return (
          <View key={name} style={styles.row} testID={`trigger-${name}`}>
            <View style={styles.rank}><Text style={styles.rankText}>{idx + 1}</Text></View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <View style={styles.rowHead}>
                <Text style={styles.tagName}>{name}</Text>
                <Text style={styles.tagCount}>{count}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  rank: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surfaceHigh,
    borderWidth: 1, borderColor: colors.hairlineStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textSecondary },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  tagName: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  tagCount: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
});
