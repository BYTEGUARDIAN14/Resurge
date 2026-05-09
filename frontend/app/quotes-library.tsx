import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fonts, radii, spacing, type } from '../src/theme';
import { api, Quote } from '../src/api';

export default function QuotesLibrary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.allQuotes().then(setQuotes).catch((e) => setError(String(e)));
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]} testID="quotes-library">
      <View style={styles.header}>
        <Pressable testID="quotes-close" onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={[type.label, { color: colors.primary }]}>quotes library</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xl }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Words for the moment</Text>
        <Text style={[type.bodyMuted, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
          Read one. Read three. They&apos;re here whenever yours run thin.
        </Text>

        {!quotes && !error && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}
        {error && <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: spacing.xl }]}>Couldn&apos;t load quotes — please restart the app.</Text>}

        {quotes?.map((q, idx) => (
          <Animated.View key={q.id} style={styles.qCard}>
            <Text style={styles.qText}>“{q.text}”</Text>
            <Text style={styles.qAuthor}>— {q.author}</Text>
          </Animated.View>
        ))}
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
  qCard: {
    backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.hairline, marginBottom: spacing.md,
  },
  qText: { fontFamily: fonts.headingSemiBold, fontSize: 18, lineHeight: 26, color: colors.text },
  qAuthor: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.sm },
});
