import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radii, spacing, type } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const PressableButton: React.FC<Props> = ({
  label, onPress, variant = 'primary', style, disabled, loading, testID, icon, fullWidth,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onIn = () => { scale.value = withSpring(0.96, { damping: 18, mass: 0.6 }); };
  const onOut = () => { scale.value = withSpring(1, { damping: 18, mass: 0.6 }); };
  const handle = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const palette = (() => {
    switch (variant) {
      case 'primary': return { bg: colors.primary, fg: colors.textInverse, border: 'transparent' };
      case 'secondary': return { bg: colors.surfaceElevated, fg: colors.text, border: colors.hairlineStrong };
      case 'ghost': return { bg: 'transparent', fg: colors.text, border: colors.hairlineStrong };
      case 'danger': return { bg: colors.emergencyDim, fg: colors.emergency, border: colors.emergency };
    }
  })();

  return (
    <Animated.View style={[fullWidth && { alignSelf: 'stretch' }, animatedStyle, style]}>
      <Pressable
        testID={testID}
        onPress={handle}
        onPressIn={onIn}
        onPressOut={onOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          { backgroundColor: palette.bg, borderColor: palette.border, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <View style={styles.row}>
            {icon ? <View style={{ marginRight: spacing.sm }}>{icon}</View> : null}
            <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { ...type.label, fontSize: 13, letterSpacing: 1.2 },
});
