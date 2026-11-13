import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import BannerAdBar from '../components/BannerAdBar';
import { getLast7Days, getGoal } from '../services/DataService';

const SCREEN_W = Dimensions.get('window').width;

export default function StatsScreen() {
  const [days, setDays] = useState([]);
  const [goal, setGoal] = useState(2000);

  const load = useCallback(async () => {
    const [d, g] = await Promise.all([getLast7Days(), getGoal()]);
    setDays(d);
    setGoal(g);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totals = days.map(d => d.total);
  const weekTotal = totals.reduce((a, b) => a + b, 0);
  const avg = days.length ? Math.round(weekTotal / days.length) : 0;
  const best = totals.length ? Math.max(...totals) : 0;
  const streak = (() => {
    let s = 0;
    for (let i = totals.length - 1; i >= 0; i--) {
      if (totals[i] >= goal) s++; else break;
    }
    return s;
  })();

  const chartData = {
    labels: days.map(d => d.label),
    datasets: [{ data: totals.length ? totals : [0] }],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>📊 Weekly Stats</Text>

        {/* Streak */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakNum}>{streak} day streak</Text>
            <Text style={styles.streakSub}>days you met your goal</Text>
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
        <Text style={styles.goalLine}>Daily goal: {goal} ml</Text>
      </ScrollView>
      <BannerAdBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#f0f8ff' },
  scroll:       { padding: 16 },
  title:        { fontSize: 22, fontWeight: '700', color: '#1e40af', marginBottom: 16 },
  streakCard:   {
    backgroundColor: '#fff7ed', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12,
  },
  streakEmoji:  { fontSize: 36 },
  streakNum:    { fontSize: 20, fontWeight: '700', color: '#c2410c' },
  streakSub:    { fontSize: 13, color: '#6b7280' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#6b7280', marginBottom: 10 },
  cardRow:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  card:         {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center',
  },
  cardVal:      { fontSize: 18, fontWeight: '700', color: '#1e40af' },
  cardLabel:    { fontSize: 12, color: '#6b7280', marginTop: 2 },
  goalLine:     { textAlign: 'center', color: '#9ca3af', fontSize: 13 },
});
