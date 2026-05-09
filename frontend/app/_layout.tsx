import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Manrope_700Bold, Manrope_800ExtraBold, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { ResurgeProvider, useResurge } from '../src/state';
import { seedCacheIfNeeded } from '../src/cache';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { LockScreen } from '../src/components/LockScreen';
import { AppSplash } from '../src/components/AppSplash';
import { colors } from '../src/theme';

// ─── LockGate ────────────────────────────────────────────────────────────────
// Handles: offline cache seeding, app-lock screen, and the loading splash.

interface LockGateProps {
  children: React.ReactNode;
  fontsLoaded: boolean;
}

function LockGate({ children, fontsLoaded }: LockGateProps) {
  const { ready, lockEnabled, unlocked } = useResurge();

  // Whether the splash should be playing its exit animation
  const [splashVisible, setSplashVisible] = useState(true);
  // Whether the splash component is still mounted (false = fully gone)
  const [splashMounted, setSplashMounted] = useState(true);

  // Seed the offline cache once per install (no-op on subsequent launches).
  // Fires after ResurgeProvider has hydrated so AsyncStorage is ready.
  useEffect(() => {
    if (ready) {
      seedCacheIfNeeded().catch(() => {
        // Seed failed — hardcoded fallbacks in cache.ts guarantee content.
      });
    }
  }, [ready]);

  // Trigger the splash exit as soon as state is hydrated AND fonts are loaded.
  useEffect(() => {
    if (ready && fontsLoaded) {
      // Small intentional pause so the animation completes at least one breathe cycle
      const t = setTimeout(() => setSplashVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [ready, fontsLoaded]);

  return (
    <>
      {/* App content — rendered below the splash so it's ready when splash exits */}
      {ready && (
        lockEnabled && !unlocked
          ? <LockScreen />
          : <>{children}</>
      )}

      {/* Splash overlay — unmounts itself only after the exit animation finishes */}
      {splashMounted && (
        <AppSplash
          visible={splashVisible}
          onDone={() => setSplashMounted(false)}
        />
      )}
    </>
  );
}

// ─── Root layout ─────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Manrope_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ResurgeProvider>
          <LockGate fontsLoaded={fontsLoaded ?? false}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="urge-surf"      options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="emergency"      options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="relapse"        options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="journal-entry"  options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="settings"       options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="quotes-library" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="timeline"       options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="pattern-setup"  options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack>
          </LockGate>
        </ResurgeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
