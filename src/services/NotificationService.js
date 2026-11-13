import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_REMINDERS = '@reminders_config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getRemindersConfig() {
  try {
    const raw = await AsyncStorage.getItem(KEY_REMINDERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: false, interval: 2, startHour: 8, endHour: 22 };
}

export async function saveRemindersConfig(config) {
  await AsyncStorage.setItem(KEY_REMINDERS, JSON.stringify(config));
}

const MESSAGES = [
  { title: '💧 Time to hydrate!', body: 'Your body needs water. Take a sip now!' },
  { title: '🌊 Water break!', body: 'Stay hydrated, stay healthy. Drink up!' },
  { title: '💪 Fuel your body!', body: 'Water keeps you focused and energized.' },
  { title: '⚡ Energy boost!', body: 'Feeling tired? Drink some water right now!' },
  { title: '🌟 Hydration reminder', body: 'Healthy habits make a healthy life!' },
  { title: '🫀 Heart health tip', body: 'Staying hydrated keeps your heart happy.' },
  { title: '🧠 Brain fuel', body: 'Your brain is 75% water. Keep it topped up!' },
  { title: '✨ Glow up!', body: 'Water clears skin and boosts your mood.' },
];

export async function scheduleReminders(config) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!config.enabled) return;

  const granted = await requestPermissions();
  if (!granted) return;

  const { interval, startHour, endHour } = config;
  let count = 0;

  for (let hour = startHour; hour <= endHour; hour += interval) {
    const msg = MESSAGES[count % MESSAGES.length];
    await Notifications.scheduleNotificationAsync({
      content: { title: msg.title, body: msg.body, sound: true },
      trigger: { hour, minute: 0, repeats: true },
    });
    count++;
  }
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
