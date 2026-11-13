/**
 * DataService.js — All data stored locally on device via AsyncStorage.
 * No login, no server, fully offline.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  goal:    'daily_goal_ml',
  entries: 'water_entries',
  weight:  'weight_kg',
};

// ── Goal ─────────────────────────────────────────────────────────────────────
export async function getGoal() {
  const v = await AsyncStorage.getItem(KEYS.goal);
  return v ? parseInt(v, 10) : 2000;
}
export async function setGoal(ml) {
  await AsyncStorage.setItem(KEYS.goal, String(ml));
}

// ── Weight ───────────────────────────────────────────────────────────────────
export async function getWeight() {
  const v = await AsyncStorage.getItem(KEYS.weight);
  return v ? parseFloat(v) : 70;
}
export async function setWeight(kg) {
  await AsyncStorage.setItem(KEYS.weight, String(kg));
}
export function recommendedGoal(kg) {
  return Math.round(kg * 33); // 33ml per kg
}

// ── Entries ───────────────────────────────────────────────────────────────────
async function _getAllEntries() {
  const raw = await AsyncStorage.getItem(KEYS.entries);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function addEntry(amountMl) {
  const entries = await _getAllEntries();
  entries.push({ time: new Date().toISOString(), amountMl });
  await AsyncStorage.setItem(KEYS.entries, JSON.stringify(entries));
}

export async function deleteEntry(isoTime) {
  const entries = await _getAllEntries();
  const updated = entries.filter(e => e.time !== isoTime);
  await AsyncStorage.setItem(KEYS.entries, JSON.stringify(updated));
}

export async function getTodayEntries() {
  const all = await _getAllEntries();
  const today = new Date();
  return all.filter(e => {
    const d = new Date(e.time);
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth()    === today.getMonth() &&
           d.getDate()     === today.getDate();
  });
}

export async function getLast7Days() {
  const all = await _getAllEntries();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const total = all
      .filter(e => {
        const d = new Date(e.time);
        return d.getFullYear() === day.getFullYear() &&
               d.getMonth()    === day.getMonth() &&
               d.getDate()     === day.getDate();
      })
      .reduce((sum, e) => sum + e.amountMl, 0);
    result.push({ label: `${day.getMonth() + 1}/${day.getDate()}`, total });
  }
  return result;
}
