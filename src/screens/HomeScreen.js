import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  SafeAreaView, Alert, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BannerAdBar from '../components/BannerAdBar';
import { onActionCompleted } from '../services/AdService';
import { getTodayEntries, addEntry, deleteEntry, getGoal } from '../services/DataService';

const QUICK_AMOUNTS = [150, 200, 250, 350, 500];

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [todayMl, setTodayMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2000);

  const reload = useCallback(async () => {
    const [e, g] = await Promise.all([getTodayEntries(), getGoal()]);
    setEntries(e.reverse()); // most recent first
    setGoalMl(g);
    setTodayMl(e.reduce((s, x) => s + x.amountMl, 0));
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const quickAdd = async (ml) => {
    await addEntry(ml);
    await reload();
    onActionCompleted(); // triggers interstitial after frequency cap
  };

  const confirmDelete = (isoTime, ml) => {
    Alert.alert('Delete entry?', `Remove ${ml} ml?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteEntry(isoTime); reload(); },
      },
    ]);
  };

  const pct = goalMl > 0 ? Math.min(todayMl / goalMl, 1) : 0;
  const pctInt = Math.round(pct * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.title}>💧 Daily Hydration</Text>
        <Text style={styles.sub}>{todayMl} ml / {goalMl} ml</Text>

        {/* Progress ring (simple arc via border trick) */}
        <View style={styles.ringWrap}>
          <View style={[styles.ring, { borderColor: pct >= 1 ? '#22c55e' : '#3b82f6' }]}>
            <Text style={styles.pct}>{pctInt}%</Text>
            <Text style={styles.pctLabel}>
              {pct >= 1 ? '🎉 Goal reached!' : 'of daily goal'}
            </Text>
          </View>
        </View>

        {/* Quick add */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(ml => (
            <TouchableOpacity key={ml} style={styles.quickBtn} onPress={() => quickAdd(ml)}>
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

        {/* Today's log */}
        {entries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Log</Text>
            {entries.map(e => (
              <View key={e.time} style={styles.logRow}>
                <Text style={styles.logIcon}>💧</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logAmt}>{e.amountMl} ml</Text>
                  <Text style={styles.logTime}>
                    {new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmDelete(e.time, e.amountMl)}>
                  <Text style={styles.deleteBtn}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
        {entries.length === 0 && (
          <Text style={styles.emptyText}>No drinks logged yet today.{'\n'}Tap a Quick Add button above!</Text>
        )}
      </ScrollView>
      <BannerAdBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#f0f8ff' },
  scroll:       { padding: 20, paddingBottom: 10 },
  title:        { fontSize: 22, fontWeight: '700', color: '#1e40af' },
  sub:          { fontSize: 14, color: '#3b82f6', marginTop: 4, marginBottom: 20 },
  ringWrap:     { alignItems: 'center', marginBottom: 24 },
  ring:         {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  pct:          { fontSize: 34, fontWeight: '800', color: '#1e40af' },
  pctLabel:     { fontSize: 12, color: '#3b82f6', textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#6b7280', marginBottom: 10 },
  quickRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  quickBtn:     {
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
  },
  quickBtnText: { color: '#1e40af', fontWeight: '600' },
  customBtn:    {
    backgroundColor: '#3b82f6', borderRadius: 14, padding: 14,
    alignItems: 'center', marginBottom: 24,
  },
  customBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logRow:       {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  logIcon:      { fontSize: 22, marginRight: 10 },
  logAmt:       { fontWeight: '600', color: '#1e40af' },
  logTime:      { fontSize: 12, color: '#9ca3af' },
  deleteBtn:    { fontSize: 20, padding: 4 },
  emptyText:    { textAlign: 'center', color: '#9ca3af', marginTop: 20, lineHeight: 22 },
});
