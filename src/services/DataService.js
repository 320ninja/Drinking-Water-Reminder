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

// ── Streak ───────────────────────────────────────────────────────────────────
export async function getStreak() {
  const all = await _getAllEntries();
  const goal = await getGoal();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const total = all
      .filter(e => {
        const d = new Date(e.time);
        return d.getFullYear() === day.getFullYear() &&
               d.getMonth()    === day.getMonth() &&
               d.getDate()     === day.getDate();
      })
      .reduce((sum, e) => sum + e.amountMl, 0);
    if (total >= goal) streak++;
    else break;
  }
  return streak;
}

// ── Achievements ──────────────────────────────────────────────────────────────
const KEY_ACHIEVEMENTS = '@achievements';
export const ACHIEVEMENTS = [
  { id: 'first_drop',   emoji: '💧', title: 'First Drop',     desc: 'Log your first drink',           check: (s) => s.totalEntries >= 1 },
  { id: 'goal_day',     emoji: '🎯', title: 'Goal Crusher',   desc: 'Hit your daily goal',             check: (s) => s.goalDaysTotal >= 1 },
  { id: 'streak_3',     emoji: '🔥', title: 'On Fire',        desc: '3-day streak',                   check: (s) => s.streak >= 3 },
  { id: 'streak_7',     emoji: '🏆', title: 'Week Warrior',   desc: '7-day streak',                   check: (s) => s.streak >= 7 },
  { id: 'streak_30',    emoji: '👑', title: 'Hydration King',  desc: '30-day streak',                  check: (s) => s.streak >= 30 },
  { id: 'total_10l',    emoji: '🌊', title: '10 Litres',      desc: 'Log 10 litres total',             check: (s) => s.totalMl >= 10000 },
  { id: 'total_100l',   emoji: '🌍', title: '100 Litres',     desc: 'Log 100 litres total',            check: (s) => s.totalMl >= 100000 },
  { id: 'early_bird',   emoji: '🌅', title: 'Early Bird',     desc: 'Log a drink before 8am',          check: (s) => s.hasEarlyDrink },
];

export async function getAchievementStats() {
  const all = await _getAllEntries();
  const goal = await getGoal();
  const streak = await getStreak();
  const totalMl = all.reduce((s, e) => s + e.amountMl, 0);
  const hasEarlyDrink = all.some(e => new Date(e.time).getHours() < 8);

  // Count goal days
  const days = {};
  all.forEach(e => {
    const d = new Date(e.time);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    days[key] = (days[key] || 0) + e.amountMl;
  });
  const goalDaysTotal = Object.values(days).filter(t => t >= goal).length;

  return { totalEntries: all.length, totalMl, streak, goalDaysTotal, hasEarlyDrink };
}

export async function getUnlockedAchievements() {
  const raw = await AsyncStorage.getItem(KEY_ACHIEVEMENTS);
  return raw ? JSON.parse(raw) : [];
}

export async function checkNewAchievements() {
  const stats = await getAchievementStats();
  const unlocked = await getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(a => a.id));
  const newOnes = ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id) && a.check(stats));
  if (newOnes.length > 0) {
    const updated = [...unlocked, ...newOnes.map(a => ({ id: a.id, unlockedAt: new Date().toISOString() }))];
    await AsyncStorage.setItem(KEY_ACHIEVEMENTS, JSON.stringify(updated));
  }
  return newOnes;
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
