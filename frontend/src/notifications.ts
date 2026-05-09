import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ENCOURAGEMENTS = [
  'A clean morning is a quiet victory.',
  'Take a slow breath. You are still here.',
  'Tonight is yours. Choose well.',
  'Triggers fade. Your strength compounds.',
  'You are doing the bravest thing.',
  'Five minutes from now, you will be glad you held.',
  'Your future self is watching this moment.',
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function scheduleDailyEncouragements(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Morning at 08:00 — daily intention
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Resurge',
      body: ENCOURAGEMENTS[0],
    },
    trigger: { type: 'daily', hour: 8, minute: 0 } as any,
  });

  // Evening at 21:30 — late-night vulnerability window
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'A note for tonight',
      body: ENCOURAGEMENTS[2],
    },
    trigger: { type: 'daily', hour: 21, minute: 30 } as any,
  });

  // Late-night safety check at 23:30
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Resurge',
      body: ENCOURAGEMENTS[5],
    },
    trigger: { type: 'daily', hour: 23, minute: 30 } as any,
  });
}

export async function cancelAll(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
