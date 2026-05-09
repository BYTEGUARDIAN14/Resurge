import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { colors, fonts } from '../../src/theme';
import { BlurView } from 'expo-blur';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'web' ? colors.surface : 'transparent',
          borderTopColor: colors.hairlineStrong,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.select({ ios: 88, android: 64, default: 64 }),
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'web' ? null : (
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,10,12,0.85)' }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size - 2} color={color} />,
          tabBarButtonTestID: 'tab-home',
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size - 2} color={color} />,
          tabBarButtonTestID: 'tab-journal',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size }) => <Feather name="wind" size={size - 2} color={color} />,
          tabBarButtonTestID: 'tab-tools',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Feather name="trending-up" size={size - 2} color={color} />,
          tabBarButtonTestID: 'tab-progress',
        }}
      />
    </Tabs>
  );
}
