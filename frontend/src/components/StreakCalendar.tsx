import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing, type } from '../theme';
import { useResurge, todayKey } from '../state';

interface Props { days?: number }

// Last `days` days as a horizontal heatmap. Cells are tinted by:
// - clean day inside current streak: primary
// - day with journal entry: extra pulse (border)
// - relapse day: warning red
export const StreakCalendar: React.FC<Props> = ({ days = 30 }) => {
  const { streakStart, journal, relapses } = useResurge();
  const startTs = streakStart ? new Date(streakStart).getTime() : null;

  const journalSet = new Set(journal.map((j) => todayKey(new Date(j.at))));
  const relapseSet = new Set(relapses.map((r) => todayKey(new Date(r.at))));

  const cells: { key: string; clean: boolean; journaled: boolean; relapsed: boolean; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const clean = startTs != null && dayStart.getTime() >= new Date(startTs).setHours(0, 0, 0, 0);
    cells.push({
      key: k,
      clean,
      journaled: journalSet.has(k),
      relapsed: relapseSet.has(k),
      label: String(d.getDate()),
    });
  }

  return (
    <View style={styles.wrap} testID="streak-calendar">
      <View style={styles.header}>
        <Text style={[type.label]}>last {days} days</Text>
        <View style={styles.legend}>
          <Dot color={colors.primary} /><Text style={styles.legendText}>clean</Text>
          <Dot color={colors.warning} /><Text style={styles.legendText}>reset</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {cells.map((c) => {
          const bg = c.relapsed ? colors.warning :
                     c.clean ? colors.primary :
                     colors.surfaceHigh;
          const opacity = c.relapsed ? 0.85 : c.clean ? 0.85 : 0.5;
          return (
            <View
              key={c.key}
              style={[
                styles.cell,
                {
                  backgroundColor: bg,
                  opacity,
                  borderColor: c.journaled ? colors.sage : 'transparent',
                  borderWidth: c.journaled ? 1.5 : 0,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, marginRight: 4, marginLeft: 8 }} />
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  legend: { flexDirection: 'row', alignItems: 'center' },
  legendText: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: 22, height: 22, borderRadius: 4 },
});
