import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radii, spacing, type } from '../theme';
import { useResurge, todayKey } from '../state';

export const HabitTracker: React.FC = () => {
  const { habits, habitLog, toggleHabitToday } = useResurge();
  const today = habitLog[todayKey()] ?? [];
  const done = today.length;

  return (
    <View style={styles.wrap} testID="habit-tracker">
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[type.label, { color: colors.primary }]}>today&apos;s swap</Text>
          <Text style={[type.h3, { marginTop: 4 }]}>Replace the urge</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreNum}>{done}</Text>
          <Text style={styles.scoreLabel}>/{habits.length}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {habits.map((h) => {
          const active = today.includes(h.id);
          return (
            <Pressable
              key={h.id}
              testID={`habit-${h.id}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                toggleHabitToday(h.id);
              }}
              style={[
                styles.tile,
                active && {
                  backgroundColor: `${h.color}1A`,
                  borderColor: `${h.color}80`,
                },
              ]}
            >
              <View style={[styles.tileIcon, { backgroundColor: active ? h.color : `${h.color}1A`, borderColor: `${h.color}55` }]}>
                <Feather name={h.icon as any} size={18} color={active ? colors.textInverse : h.color} />
              </View>
              <Text style={[styles.tileLabel, active && { color: colors.text }]} numberOfLines={2}>
                {h.label}
              </Text>
              {active && (
                <View style={[styles.checkmark, { backgroundColor: h.color }]}>
                  <Feather name="check" size={11} color={colors.textInverse} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  scoreBadge: {
    flexDirection: 'row', alignItems: 'baseline',
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radii.full, backgroundColor: colors.primaryDim,
    borderWidth: 1, borderColor: colors.primary,
  },
  scoreNum: { fontFamily: fonts.headingExtraBold, fontSize: 18, color: colors.primary, letterSpacing: -0.4 },
  scoreLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.primary, marginLeft: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: '31.5%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    alignItems: 'flex-start',
    minHeight: 96,
    position: 'relative',
  },
  tileIcon: {
    width: 36, height: 36, borderRadius: radii.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: spacing.sm,
  },
  tileLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary, lineHeight: 17 },
  checkmark: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
});
