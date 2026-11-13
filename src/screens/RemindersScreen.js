import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BannerAdBar from '../components/BannerAdBar';
import {
  getRemindersConfig, saveRemindersConfig,
  scheduleReminders, requestPermissions,
} from '../services/NotificationService';
import { onActionCompleted } from '../services/AdService';

const INTERVALS = [1, 2, 3, 4];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function fmtHour(h) {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export default function RemindersScreen() {
  const [config, setConfig] = useState({ enabled: false, interval: 2, startHour: 8, endHour: 22 });
  const [saved, setSaved] = useState(false);

  useFocusEffect(useCallback(() => {
    getRemindersConfig().then(setConfig);
  }, []));

  const toggle = async (val) => {
    if (val) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permission needed', 'Please allow notifications for reminders to work.');
        return;
      }
    }
    update('enabled', val);
  };

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    await saveRemindersConfig(config);
    await scheduleReminders(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onActionCompleted();
  };

  const countReminders = () => {
    if (!config.enabled) return 0;
    return Math.floor((config.endHour - config.startHour) / config.interval) + 1;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🔔 Reminders</Text>
        <Text style={styles.sub}>Set automatic drink reminders throughout the day</Text>

        {/* Enable toggle */}
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Enable Reminders</Text>
            <Text style={styles.cardSub}>Get notified to drink water</Text>
          </View>
          <Switch
            value={config.enabled}
            onValueChange={toggle}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor="#fff"
          />
        </View>

        {config.enabled && (
          <>
            {/* Interval */}
            <Text style={styles.sectionLabel}>Remind me every</Text>
            <View style={styles.chipRow}>
              {INTERVALS.map(h => (
                <TouchableOpacity
                  key={h}
                  style={[styles.chip, config.interval === h && styles.chipActive]}
                  onPress={() => update('interval', h)}
                >
                  <Text style={[styles.chipText, config.interval === h && styles.chipTextActive]}>
                    {h}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Start time */}
            <Text style={styles.sectionLabel}>From</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.chipRow}>
                {HOURS.filter(h => h <= config.endHour).map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.chip, config.startHour === h && styles.chipActive]}
                    onPress={() => update('startHour', h)}
                  >
                    <Text style={[styles.chipText, config.startHour === h && styles.chipTextActive]}>
                      {fmtHour(h)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* End time */}
            <Text style={styles.sectionLabel}>Until</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={styles.chipRow}>
                {HOURS.filter(h => h >= config.startHour).map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.chip, config.endHour === h && styles.chipActive]}
                    onPress={() => update('endHour', h)}
                  >
                    <Text style={[styles.chipText, config.endHour === h && styles.chipTextActive]}>
                      {fmtHour(h)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                🔔 {countReminders()} reminders/day · Every {config.interval}h · {fmtHour(config.startHour)} – {fmtHour(config.endHour)}
              </Text>
            </View>
          </>
        )}

        {/* Save button */}
        <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={save}>
          <Text style={styles.saveBtnText}>{saved ? '✓ Saved!' : 'Save Reminders'}</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for staying hydrated</Text>
          {[
            'Keep a water bottle at your desk',
            'Drink a glass before every meal',
            'Set a reminder for first thing in the morning',
            'Infuse water with lemon or mint for taste',
            'Track your intake — seeing progress motivates you',
          ].map((t, i) => (
            <Text key={i} style={styles.tipItem}>• {t}</Text>
          ))}
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
  sub:          { fontSize: 13, color: '#6b7280', marginBottom: 20 },
  card:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle:    { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSub:      { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb' },
  chipActive:   { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  chipText:     { color: '#374151', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  summaryCard:  { backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, marginBottom: 20, alignItems: 'center' },
  summaryText:  { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  saveBtn:      { backgroundColor: '#3b82f6', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 24, shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnDone:  { backgroundColor: '#22c55e' },
  saveBtnText:  { color: '#fff', fontWeight: '800', fontSize: 16 },
  tipsCard:     { backgroundColor: '#fff7ed', borderRadius: 16, padding: 16 },
  tipsTitle:    { fontSize: 14, fontWeight: '700', color: '#92400e', marginBottom: 10 },
  tipItem:      { fontSize: 13, color: '#78350f', lineHeight: 22 },
});
