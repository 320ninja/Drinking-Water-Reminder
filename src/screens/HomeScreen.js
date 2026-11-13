import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView as SafeAreaViewCtx } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BannerAdBar from '../components/BannerAdBar';
import { onActionCompleted } from '../services/AdService';
import { getTodayEntries, addEntry, deleteEntry, getGoal, checkNewAchievements } from '../services/DataService';

const QUICK_AMOUNTS = [150, 200, 250, 350, 500];

const TIPS = [
  '💡 Drinking water first thing in the morning boosts metabolism by 24%.',
  '🧠 Even mild dehydration reduces focus and memory.',
  '💪 Athletes drink 500ml extra per hour of exercise.',
  '🌙 You lose 1 litre of water overnight just breathing!',
  '🌿 Water flushes toxins and clears skin naturally.',
  '⚡ Fatigue is often the first sign of dehydration.',
  '🫀 Proper hydration lowers blood pressure naturally.',
  '🔥 Cold water burns a few extra calories as your body warms it.',
];

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [todayMl, setTodayMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2000);
  const [newBadge, setNewBadge] = useState(null);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const reload = useCallback(async () => {
    const [e, g] = await Promise.all([getTodayEntries(), getGoal()]);
    setEntries(e.reverse());
    setGoalMl(g);
    setTodayMl(e.reduce((s, x) => s + x.amountMl, 0));
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const bounce = () => {
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const quickAdd = async (ml) => {
    bounce();
    await addEntry(ml);
    await reload();
    onActionCompleted();
    const newAch = await checkNewAchievements();
    if (newAch.length > 0) setNewBadge(newAch[0]);
  };

  const confirmDelete = (isoTime, ml) => {
    Alert.alert('Delete entry?', `Remove ${ml} ml?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteEntry(isoTime); reload(); } },
    ]);
  };

  const pct = goalMl > 0 ? Math.min(todayMl / goalMl, 1) : 0;
  const pctInt = Math.round(pct * 100);
  const remaining = Math.max(goalMl - todayMl, 0);

  const ringColor = pct >= 1 ? '#22c55e' : pct >= 0.5 ? '#3b82f6' : '#f59e0b';

  return (
    <SafeAreaViewCtx style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Daily Hydration 💧</Text>
            <Text style={styles.sub}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge} onPress={() => navigation.navigate('Stats')}>
            <Text style={styles.streakBadgeText}>📊 Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Ring */}
        <View style={styles.ringWrap}>
          <Animated.View style={[styles.ringOuter, { transform: [{ scale: bounceAnim }] }]}>
            <View style={[styles.ring, { borderColor: ringColor }]}>
              <Text style={styles.pct}>{pctInt}%</Text>
              <Text style={styles.pctMl}>{todayMl} ml</Text>
              <Text style={styles.pctLabel}>
                {pct >= 1 ? '🎉 Goal reached!' : `${remaining} ml to go`}
              </Text>
            </View>
          </Animated.View>
          <View style={styles.ringStats}>
            <View style={styles.ringStat}>
              <Text style={styles.ringStatVal}>{goalMl} ml</Text>
              <Text style={styles.ringStatLabel}>Goal</Text>
            </View>
            <View style={[styles.ringStat, styles.ringStatMid]}>
              <Text style={styles.ringStatVal}>{entries.length}</Text>
              <Text style={styles.ringStatLabel}>Drinks</Text>
            </View>
            <View style={styles.ringStat}>
              <Text style={styles.ringStatVal}>{Math.round(todayMl / 1000 * 10) / 10} L</Text>
              <Text style={styles.ringStatLabel}>Today</Text>
            </View>
          </View>
        </View>

        {/* New Achievement popup */}
        {newBadge && (
          <TouchableOpacity style={styles.badgePopup} onPress={() => setNewBadge(null)}>
            <Text style={styles.badgePopupEmoji}>{newBadge.emoji}</Text>
            <View>
              <Text style={styles.badgePopupTitle}>Achievement Unlocked!</Text>
              <Text style={styles.badgePopupName}>{newBadge.title} — {newBadge.desc}</Text>
            </View>
            <Text style={styles.badgeClose}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Quick Add */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(ml => (
            <TouchableOpacity key={ml} style={styles.quickBtn} onPress={() => quickAdd(ml)}>
              <Text style={styles.quickIcon}>{ml >= 500 ? '🍶' : ml >= 350 ? '🥤' : '🥛'}</Text>
              <Text style={styles.quickBtnText}>{ml} ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom amount */}
        <TouchableOpacity
          style={styles.customBtn}
          onPress={() => navigation.navigate('Add', { onDone: reload })}
        >
          <Text style={styles.customBtnText}>+ Custom Amount</Text>
        </TouchableOpacity>

        {/* Health tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>Health Tip of the Day</Text>
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>

        {/* Today's log */}
        {entries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Log</Text>
            {entries.map(e => (
              <View key={e.time} style={styles.logRow}>
                <View style={styles.logIconWrap}>
                  <Text style={styles.logIcon}>💧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logAmt}>{e.amountMl} ml</Text>
                  <Text style={styles.logTime}>
                    {new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmDelete(e.time, e.amountMl)} style={styles.deleteWrap}>
                  <Text style={styles.deleteBtn}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
        {entries.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>💦</Text>
            <Text style={styles.emptyText}>No drinks yet today</Text>
            <Text style={styles.emptySubText}>Tap a Quick Add button above to get started!</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
      <BannerAdBar />
    </SafeAreaViewCtx>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#f0f8ff' },
  scroll:       { padding: 20, paddingBottom: 10 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:        { fontSize: 22, fontWeight: '800', color: '#1e40af' },
  sub:          { fontSize: 13, color: '#6b7280', marginTop: 2 },
  streakBadge:  { backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  streakBadgeText: { color: '#3b82f6', fontWeight: '700', fontSize: 13 },
  ringWrap:     { alignItems: 'center', marginBottom: 24 },
  ringOuter:    { marginBottom: 16 },
  ring:         { width: 180, height: 180, borderRadius: 90, borderWidth: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' },
  pct:          { fontSize: 38, fontWeight: '900', color: '#1e40af' },
  pctMl:        { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  pctLabel:     { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 2 },
  ringStats:    { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  ringStat:     { flex: 1, alignItems: 'center' },
  ringStatMid:  { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e5e7eb' },
  ringStatVal:  { fontSize: 18, fontWeight: '700', color: '#1e40af' },
  ringStatLabel:{ fontSize: 11, color: '#9ca3af', marginTop: 2 },
  badgePopup:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', borderRadius: 16, padding: 14, marginBottom: 16, gap: 10, borderWidth: 1, borderColor: '#fbbf24' },
  badgePopupEmoji: { fontSize: 32 },
  badgePopupTitle: { fontSize: 11, color: '#92400e', fontWeight: '600' },
  badgePopupName:  { fontSize: 14, color: '#78350f', fontWeight: '700' },
  badgeClose:   { marginLeft: 'auto', color: '#92400e', fontSize: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  quickRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  quickBtn:     { flex: 1, minWidth: 60, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#bfdbfe', borderRadius: 14, paddingVertical: 12, alignItems: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  quickIcon:    { fontSize: 18, marginBottom: 4 },
  quickBtnText: { color: '#1e40af', fontWeight: '700', fontSize: 13 },
  customBtn:    { backgroundColor: '#3b82f6', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20, shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  customBtnText:{ color: '#fff', fontWeight: '800', fontSize: 16 },
  tipCard:      { backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#22c55e' },
  tipLabel:     { fontSize: 11, fontWeight: '700', color: '#16a34a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  tipText:      { fontSize: 14, color: '#166534', lineHeight: 20 },
  logRow:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  logIconWrap:  { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logIcon:      { fontSize: 20 },
  logAmt:       { fontWeight: '700', color: '#1e40af', fontSize: 15 },
  logTime:      { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  deleteWrap:   { padding: 4 },
  deleteBtn:    { fontSize: 20 },
  emptyWrap:    { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji:   { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubText: { fontSize: 13, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
});
