import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { api } from '../src/api';
import { useResurge } from '../src/state';
import { breakdown } from '../src/time';

interface Stage { days: number; title: string; body: string; icon: string }

export default function Timeline() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { streakStart } = useResurge();
  const [stages, setStages] = useState<Stage[] | null>(null);

  useEffect(() => { api.brainTimeline().then(setStages).catch(() => setStages([])); }, []);

  const days = breakdown(streakStart).days;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]} testID="timeline-screen">
      <View style={styles.header}>
        <Pressable testID="timeline-close" onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.label, { color: colors.primary }]}>brain timeline</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xl }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What healing does</Text>
        <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
          A research-informed map of how your brain and body change as you stay clean.
        </Text>

        {!stages && <ActivityIndicator color={colors.primary} />}
        {stages && stages.length === 0 && <Text style={[type.bodyMuted, { textAlign: 'center' }]}>Couldn&apos;t load timeline — please restart the app.</Text>}

        {stages?.map((s, idx) => {
          const reached = days >= s.days;
          const current = !reached && (idx === 0 || days >= (stages[idx - 1]?.days ?? 0));
          return (
            <Animated.View key={s.days} entering={FadeInDown.delay(idx * 50).duration(400)} style={styles.row}>
              <View style={styles.stem}>
                <View style={[styles.dot, { backgroundColor: reached ? colors.primary : current ? colors.sage : colors.surfaceHigh, borderColor: reached ? colors.primary : current ? colors.sage : colors.hairlineStrong }]} />
                {idx !== stages.length - 1 && <View style={styles.line} />}
              </View>
              <View style={[styles.card, reached && { borderColor: colors.primary, backgroundColor: colors.primarySoft }, current && { borderColor: colors.sage, backgroundColor: colors.sageSoft }]}>
                <View style={styles.cardHead}>
                  <View style={[styles.iconWrap, { backgroundColor: `${reached ? colors.primary : current ? colors.sage : colors.textMuted}1A` }]}>
                    <Feather name={s.icon as any} size={16} color={reached ? colors.primary : current ? colors.sage : colors.textMuted} />
                  </View>
                  <Text style={[type.label, { color: reached ? colors.primary : current ? colors.sage : colors.textMuted, marginLeft: 8 }]}>day {s.days}</Text>
                  {reached && <Text style={[type.label, { color: colors.primary, marginLeft: 'auto' }]}>reached</Text>}
                  {current && <Text style={[type.label, { color: colors.sage, marginLeft: 'auto' }]}>you are here</Text>}
                </View>
                <Text style={[type.h3, { marginTop: spacing.sm }]}>{s.title}</Text>
                <Text style={[type.bodyMuted, { marginTop: 6 }]}>{s.body}</Text>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  closeBtn: {
    width: 40, height: 40, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairlineStrong,
  },
  title: { ...type.h1 },
  row: { flexDirection: 'row', marginBottom: spacing.md },
  stem: { width: 28, alignItems: 'center', paddingTop: 12 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  line: { flex: 1, width: 2, backgroundColor: colors.hairlineStrong, marginTop: 4 },
  card: {
    flex: 1, marginLeft: 4, padding: spacing.md, borderRadius: radii.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
