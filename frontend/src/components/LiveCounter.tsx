import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { breakdown, pad2 } from '../time';

interface Props {
  startIso: string | null;
  size?: 'hero' | 'compact';
}

export const LiveCounter: React.FC<Props> = ({ startIso, size = 'hero' }) => {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const b = breakdown(startIso);
  const big = size === 'hero';

  return (
    <View style={styles.container}>
      <View style={styles.daysRow}>
        <Text style={[styles.daysNum, big ? styles.daysNumHero : styles.daysNumCompact]} testID="streak-days">{b.days}</Text>
        <Text style={[styles.daysLabel, big ? null : styles.daysLabelCompact]}>days clean</Text>
      </View>
      <View style={styles.timeRow}>
        <Cell value={pad2(b.hours)} label="hrs" big={big} />
        <Sep big={big} />
        <Cell value={pad2(b.minutes)} label="min" big={big} />
        <Sep big={big} />
        <Cell value={pad2(b.seconds)} label="sec" big={big} testID="streak-seconds" />
      </View>
    </View>
  );
};

const Cell: React.FC<{ value: string; label: string; big: boolean; testID?: string }> = ({ value, label, big, testID }) => (
  <View style={styles.cell}>
    <Text style={[styles.cellNum, big ? styles.cellNumHero : styles.cellNumCompact]} testID={testID}>{value}</Text>
    <Text style={styles.cellLabel}>{label}</Text>
  </View>
);

const Sep: React.FC<{ big: boolean }> = ({ big }) => (
  <Text style={[styles.sep, big ? { fontSize: 22 } : { fontSize: 16 }]}>:</Text>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  daysRow: { alignItems: 'center', marginBottom: spacing.sm },
  daysNum: { fontFamily: fonts.headingExtraBold, color: colors.text },
  daysNumHero: { fontSize: 84, letterSpacing: -3, lineHeight: 92 },
  daysNumCompact: { fontSize: 44, letterSpacing: -1.5, lineHeight: 48 },
  daysLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary, letterSpacing: 2.5, textTransform: 'uppercase', marginTop: 4 },
  daysLabelCompact: { fontSize: 11, letterSpacing: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.xs },
  cell: { alignItems: 'center', minWidth: 52 },
  cellNum: { fontFamily: fonts.headingSemiBold, color: colors.textSecondary },
  cellNumHero: { fontSize: 22, letterSpacing: -0.4 },
  cellNumCompact: { fontSize: 16 },
  cellLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },
  sep: { fontFamily: fonts.headingSemiBold, color: colors.textMuted, marginHorizontal: 6, paddingBottom: 14 },
});
