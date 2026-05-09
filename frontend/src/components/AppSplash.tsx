/**
 * AppSplash.tsx
 *
 * Custom in-app loading screen shown while ResurgeProvider hydrates AsyncStorage
 * and fonts load. Uses three layered animations:
 *
 *   1. Icon entrance — scale from 0.6 → 1 with spring bounce
 *   2. Icon breathe — subtle continuous pulse (scale 1 → 1.06 → 1, looped)
 *   3. Radial glow  — opacity 0 → 0.55, synced with entrance
 *   4. Word-mark    — opacity 0 → 1, slides up 12px, 200ms after icon lands
 *   5. Tag-line     — opacity 0 → 1, 100ms after word-mark
 *   6. Exit         — entire screen fades to transparent once `visible` → false
 */

import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';

const { width, height } = Dimensions.get('window');
const ICON_SIZE = 120;

interface Props {
  /** When false, the screen fades out and calls onDone when the exit animation finishes */
  visible: boolean;
  onDone: () => void;
}

export function AppSplash({ visible, onDone }: Props) {
  // ─── Shared values ──────────────────────────────────────────────────────────
  const screenOpacity   = useSharedValue(1);
  const iconScale       = useSharedValue(0.55);
  const iconOpacity     = useSharedValue(0);
  const breatheScale    = useSharedValue(1);
  const glowOpacity     = useSharedValue(0);
  const glowScale       = useSharedValue(0.5);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY       = useSharedValue(14);
  const taglineOpacity  = useSharedValue(0);

  // ─── Entrance sequence (runs once on mount) ─────────────────────────────────
  useEffect(() => {
    // Glow expands simultaneously
    glowOpacity.value = withTiming(0.55, { duration: 900, easing: Easing.out(Easing.quad) });
    glowScale.value   = withTiming(1,    { duration: 900, easing: Easing.out(Easing.quad) });

    // Icon springs in
    iconOpacity.value = withTiming(1, { duration: 300 });
    iconScale.value   = withSpring(1, { damping: 12, stiffness: 140, mass: 0.8 });

    // After landing, start the gentle breathe loop (delayed)
    breatheScale.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.07, { duration: 2200 }),
          withTiming(1.00, { duration: 2200 })
        ),
        -1,
        false
      )
    );

    // Word-mark slides up 340ms after mount
    wordmarkOpacity.value = withDelay(340, withTiming(1, { duration: 500 }));
    wordmarkY.value       = withDelay(340, withTiming(0, { duration: 500 }));

    // Tag-line 100ms after word-mark
    taglineOpacity.value = withDelay(540, withTiming(1, { duration: 400 }));
  }, []);

  // ─── Exit sequence (fires when visible becomes false) ───────────────────────
  useEffect(() => {
    if (!visible) {
      screenOpacity.value = withTiming(0, { duration: 380 }, (finished) => {
        if (finished) {
          runOnJS(onDone)();
        }
      });
    }
  }, [visible]);

  // ─── Animated styles ────────────────────────────────────────────────────────
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value * breatheScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <Animated.View style={[styles.root, screenStyle]}>
      {/* Radial glow behind icon */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* App icon */}
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Image
          source={require('../../assets/images/app-icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Word-mark */}
      <Animated.View style={[styles.textWrap, wordmarkStyle]}>
        <Text style={styles.appName}>RESURGE</Text>
        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>Choose yourself again</Text>
        </Animated.View>
      </Animated.View>

      {/* Bottom version label */}
      <View style={styles.bottom}>
        <Text style={styles.version}>v1.0</Text>
      </View>
    </Animated.View>
  );
}

const GLOW_SIZE = width * 1.1;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  glow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: colors.primary,
    // Glow is purely an opacity/scale-blurred circle; actual blur comes from
    // the icon size contrast. For a real blur effect, expo-blur can be layered.
    opacity: 0,
    transform: [{ scale: 0.5 }],
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 20,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  textWrap: {
    marginTop: 36,
    alignItems: 'center',
  },
  appName: {
    fontFamily: fonts.headingExtraBold,
    fontSize: 28,
    letterSpacing: 8,
    color: colors.text,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    letterSpacing: 0.4,
    color: colors.textMuted,
    marginTop: 8,
  },
  bottom: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
  },
  version: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
    opacity: 0.5,
  },
});
