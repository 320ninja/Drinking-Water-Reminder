import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import BannerAdBar from '../components/BannerAdBar';
import { getLast7Days, getGoal, getStreak } from '../services/DataService';

const SCREEN_W = Dimensions.get('window').width;

const HEALTH_FACTS = [
  '🫁 Water makes up 60% of your body weight.',
  '🧠 Dehydration shrinks your brain volume temporarily.',
  '💉 Blood is 90% water — hydration directly affects circulation.',
  '🦴 Joints need water as natural lubrication.',
  '🌡️ Sweating is your body\'s built-in cooling system — stay fueled.',
];

export default function StatsScreen() {
  const [days, setDays] = useState([]);
  const [goal, setGoal] = useState(2000);
  const [streak, setStreak] = useState(0);

  const load = useCallback(async () => {
    const [d, g, s] = await Promise.all([getLast7Days(), getGoal(), getStreak()]);
    setDays(d);
    setGoal(g);
    setStreak(s);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totals = days.map(d => d.total);
  const weekTotal = totals.reduce((a, b) => a + b, 0);
  const avg = days.length ? Math.round(weekTotal / days.length) : 0;
  const best = totals.length ? Math.max(...totals) : 0;
  const goalDays = totals.filter(t => t >= goal).length;
  const pct = goal > 0 ? Math.min(avg / goal, 1) : 0;

  const chartData = {
    labels: days.map(d => d.label),
    datasets: [{ data: totals.length ? totals : [0] }],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📊 Weekly Stats</Text>

        {/* Streak + goal days */}
        <View style={styles.heroRow}>
          <View style={[styles.heroCard, { backgroundColor: '#fff7ed' }]}>
            <Text style={styles.heroEmoji}>🔥</Text>
            <Text style={styles.heroNum}>{streak}</Text>
            <Text style={styles.heroLabel}>Day streak</Text>
          </View>
          <View style={[styles.heroCard, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.heroEmoji}>🎯</Text>
            <Text style={styles.heroNum}>{goalDays}/7</Text>
            <Text style={styles.heroLabel}>Goal days</Text>
          </View>
          <View style={[styles.heroCard, { backgroundColor: '#eff6ff' }]}>
            <Text style={styles.heroEmoji}>📈</Text>
            <Text style={styles.heroNum}>{Math.round(pct * 100)}%</Text>
            <Text style={styles.heroLabel}>Avg vs goal</Text>
          </View>
        </View>

        {/* Bar chart */}
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        <BarChart
          data={chartData}
          width={SCREEN_W - 32}
          height={200}
          yAxisSuffix="ml"
          chartConfig={{
            backgroundGradientFrom: '#eff6ff',
            backgroundGradientTo: '#eff6ff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: () => '#6b7280',
            barPercentage: 0.6,
          }}
          style={{ borderRadius: 14, marginBottom: 24 }}
          showValuesOnTopOfBars
          fromZero
        />

        {/* Summary cards */}
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardVal}>{(weekTotal / 1000).toFixed(1)} L</Text>
            <Text style={styles.cardLabel}>Week total</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardVal}>{avg} ml</Text>
            <Text style={styles.cardLabel}>Daily avg</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardVal}>{best} ml</Text>
            <Text style={styles.cardLabel}>Best day</Text>
          </View>
        </View>

        {/* Goal reference */}
        <View style={styles.goalBar}>
          <Text style={styles.goalBarLabel}>Daily goal: {goal} ml</Text>
          <View style={styles.goalBarTrack}>
            <View style={[styles.goalBarFill, { width: `${Math.min(pct, 1) * 100}%` }]} />
          </View>
          <Text style={styles.goalBarSub}>7-day avg is {pct >= 1 ? 'at or above' : 'below'} goal</Text>
        </View>

        {/* Science facts */}
        <Text style={styles.sectionTitle}>Did you know?</Text>
        {HEALTH_FACTS.map((f, i) => (
          <View key={i} style={styles.factRow}>
            <Text style={styles.factText}>{f}</Text>
          </View>
        ))}
      </ScrollView>
      <BannerAdBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#f0f8ff' },
  scroll:       { padding: 16, paddingBottom: 20 },
  title:        { fontSize: 22, fontWeight: '800', color: '#1e40af', marginBottom: 20 },
  heroRow:      { flexDirection: 'row', gap: 10, marginBottom: 24 },
  heroCard:     { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  heroEmoji:    { fontSize: 24, marginBottom: 4 },
  heroNum:      { fontSize: 20, fontWeight: '800', color: '#1e40af' },
  heroLabel:    { fontSize: 11, color: '#6b7280', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  cardRow:      { flexDirection: 'row', gap: 10, marginBottom: 20 },
  card:         { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardVal:      { fontSize: 18, fontWeight: '700', color: '#1e40af' },
  cardLabel:    { fontSize: 12, color: '#6b7280', marginTop: 2 },
  goalBar:      { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24 },
  goalBarLabel: { fontWeight: '700', color: '#1e40af', marginBottom: 10 },
  goalBarTrack: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, marginBottom: 8 },
  goalBarFill:  { height: 10, backgroundColor: '#3b82f6', borderRadius: 5 },
  goalBarSub:   { fontSize: 12, color: '#6b7280' },
  factRow:      { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  factText:     { fontSize: 13, color: '#374151', lineHeight: 20 },
});
