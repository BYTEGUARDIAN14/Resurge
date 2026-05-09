import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring } from 'react-native-reanimated';
import { colors, fonts, radii, spacing, type } from '../theme';
import { useResurge } from '../state';

export const WinButton: React.FC = () => {
  const { wins, incWin } = useResurge();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    scale.value = withSequence(
      withSpring(1.08, { damping: 8, mass: 0.4 }),
      withSpring(1, { damping: 12, mass: 0.5 }),
    );
    incWin();
  };

  return (
    <Animated.View style={aStyle}>
      <Pressable testID="win-button" onPress={onPress} style={styles.wrap}>
        <View style={styles.iconWrap}>
          <Feather name="star" size={18} color={colors.gold} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.title}>I just won this moment</Text>
          <Text style={styles.sub}>Tap to log a small victory · {wins} this lifetime</Text>
        </View>
        <Feather name="plus" size={18} color={colors.gold} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.goldDim,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(244,199,123,0.35)',
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(244,199,123,0.16)', borderWidth: 1, borderColor: 'rgba(244,199,123,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold, letterSpacing: 0.2 },
  sub: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
