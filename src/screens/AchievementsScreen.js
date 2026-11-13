import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BannerAdBar from '../components/BannerAdBar';
import { showRewarded } from '../services/AdService';
import { ACHIEVEMENTS, getUnlockedAchievements, getAchievementStats } from '../services/DataService';

export default function AchievementsScreen() {
  const [unlocked, setUnlocked] = useState([]);
  const [stats, setStats] = useState({});
  const [watchingAd, setWatchingAd] = useState(false);

  useFocusEffect(useCallback(() => {
    Promise.all([getUnlockedAchievements(), getAchievementStats()]).then(([u, s]) => {
      setUnlocked(u.map(a => a.id));
      setStats(s);
    });
  }, []));

  const unlockedSet = new Set(unlocked);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🏆 Achievements</Text>
        <Text style={styles.sub}>{unlocked.length}/{ACHIEVEMENTS.length} unlocked</Text>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }]} />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.streak || 0}</Text>
            <Text style={styles.statLabel}>🔥 Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{Math.round((stats.totalMl || 0) / 1000 * 10) / 10}L</Text>
            <Text style={styles.statLabel}>💧 Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.goalDaysTotal || 0}</Text>
            <Text style={styles.statLabel}>🎯 Goal days</Text>
          </View>
        </View>

        {/* Achievements grid */}
        <View style={styles.grid}>
          {ACHIEVEMENTS.map(a => {
            const done = unlockedSet.has(a.id);
            return (
              <View key={a.id} style={[styles.badge, done ? styles.badgeDone : styles.badgeLocked]}>
                <Text style={[styles.badgeEmoji, !done && styles.badgeEmojiLocked]}>{a.emoji}</Text>
                <Text style={[styles.badgeName, !done && styles.badgeNameLocked]}>{a.title}</Text>
                <Text style={styles.badgeDesc}>{a.desc}</Text>
                {done && <View style={styles.checkDot}><Text style={styles.checkDotText}>✓</Text></View>}
              </View>
            );
          })}
        </View>

        {/* Rewarded ad bonus */}
        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>🎁 Bonus Motivation</Text>
          <Text style={styles.rewardText}>Watch a short video for a personalized hydration plan!</Text>
          <TouchableOpacity
            style={[styles.rewardBtn, watchingAd && styles.rewardBtnDisabled]}
            disabled={watchingAd}
            onPress={() => {
              setWatchingAd(true);
              showRewarded(() => {
                setWatchingAd(false);
              });
              setTimeout(() => setWatchingAd(false), 60000);
            }}
          >
            <Text style={styles.rewardBtnText}>▶ Watch Ad for Bonus</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BannerAdBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#f0f8ff' },
  scroll:       { padding: 16, paddingBottom: 20 },
  title:        { fontSize: 22, fontWeight: '800', color: '#1e40af', marginBottom: 4 },
  sub:          { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  progressBg:   { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 20 },
  progressFill: { height: 8, backgroundColor: '#3b82f6', borderRadius: 4 },
  statsRow:     { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox:      { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statVal:      { fontSize: 22, fontWeight: '800', color: '#1e40af' },
  statLabel:    { fontSize: 11, color: '#6b7280', marginTop: 4 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  badge:        { width: '47%', borderRadius: 16, padding: 14, alignItems: 'center', position: 'relative' },
  badgeDone:    { backgroundColor: '#fff', shadowColor: '#3b82f6', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  badgeLocked:  { backgroundColor: '#f3f4f6', opacity: 0.7 },
  badgeEmoji:   { fontSize: 32, marginBottom: 6 },
  badgeEmojiLocked: { opacity: 0.3 },
  badgeName:    { fontSize: 13, fontWeight: '700', color: '#1e40af', textAlign: 'center' },
  badgeNameLocked: { color: '#9ca3af' },
  badgeDesc:    { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  checkDot:     { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  checkDotText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rewardCard:   { backgroundColor: '#fef3c7', borderRadius: 16, padding: 18, alignItems: 'center' },
  rewardTitle:  { fontSize: 16, fontWeight: '800', color: '#92400e', marginBottom: 6 },
  rewardText:   { fontSize: 13, color: '#78350f', textAlign: 'center', marginBottom: 14 },
  rewardBtn:    { backgroundColor: '#f59e0b', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  rewardBtnDisabled: { opacity: 0.5 },
  rewardBtnText:{ color: '#fff', fontWeight: '800', fontSize: 14 },
});
