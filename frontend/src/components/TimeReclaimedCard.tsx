import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, spacing, type } from '../theme';
import { useResurge } from '../state';
import { breakdown } from '../time';

const MIN_PER_DAY = 30;          // hypothetical daily time spent
const WORKOUT_MIN = 30;
const BOOK_HOURS = 4;

export const TimeReclaimedCard: React.FC = () => {
  const { streakStart, wins } = useResurge();
  const b = breakdown(streakStart);
  const totalMin = b.days * MIN_PER_DAY + Math.floor((b.totalMs % 86_400_000) / 60_000) * 0;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const workouts = Math.floor(totalMin / WORKOUT_MIN);
  const books = Math.floor(hours / BOOK_HOURS);

  return (
    <View style={styles.wrap} testID="time-reclaimed-card">
      <LinearGradient
        colors={[colors.primarySoft, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.row}>
        <View style={styles.iconBig}>
          <Feather name="clock" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={[type.label, { color: colors.primary }]}>time reclaimed</Text>
          <Text style={styles.bigNum}>
            {hours}<Text style={styles.unit}>h </Text>{mins}<Text style={styles.unit}>m</Text>
          </Text>
        </View>
      </View>
      <View style={styles.equivRow}>
        <Equiv icon="activity" label={`${workouts} workouts`} />
        <Equiv icon="book-open" label={`${books} books`} />
        <Equiv icon="star" label={`${wins} wins`} />
      </View>
    </View>
  );
};

const Equiv: React.FC<{ icon: keyof typeof Feather.glyphMap; label: string }> = ({ icon, label }) => (
  <View style={styles.equiv}>
    <Feather name={icon} size={13} color={colors.textSecondary} />
    <Text style={styles.equivText}>{label}</Text>
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
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBig: {
    width: 48, height: 48, borderRadius: radii.full,
    backgroundColor: colors.primaryDim, borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  bigNum: { fontFamily: fonts.headingExtraBold, fontSize: 32, color: colors.text, letterSpacing: -1, marginTop: 2 },
  unit: { fontFamily: fonts.body, fontSize: 16, color: colors.textSecondary, letterSpacing: 0 },
  equivRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm, flexWrap: 'wrap' },
  equiv: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.hairlineStrong,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.full,
  },
  equivText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary, marginLeft: 6 },
});
