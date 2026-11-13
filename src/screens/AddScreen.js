import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BannerAdBar from '../components/BannerAdBar';
import { onActionCompleted } from '../services/AdService';
import { addEntry } from '../services/DataService';

const PRESETS = [
  { label: '☕ Coffee', ml: 150 },
  { label: '🥤 Small',  ml: 200 },
  { label: '💧 Medium', ml: 350 },
  { label: '🍶 Large',  ml: 500 },
  { label: '🧴 Bottle', ml: 750 },
];

export default function AddScreen({ navigation, route }) {
  const [amount, setAmount] = useState('250');
  const [error, setError] = useState('');

  const save = async () => {
    const val = parseInt(amount, 10);
    if (!val || val <= 0 || val > 5000) {
      setError('Enter a value between 1 and 5000 ml');
      return;
    }
    await addEntry(val);
    onActionCompleted();
    route?.params?.onDone?.();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Text style={styles.heading}>How much did you drink?</Text>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={amount}
            onChangeText={t => { setAmount(t); setError(''); }}
            keyboardType="number-pad"
            placeholder="e.g. 250"
            autoFocus
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <Text style={styles.unit}>ml</Text>

          <Text style={styles.sectionTitle}>Quick Presets</Text>
          <View style={styles.presets}>
            {PRESETS.map(p => (
              <TouchableOpacity
                key={p.ml}
                style={styles.preset}
                onPress={() => { setAmount(String(p.ml)); setError(''); }}
              >
                <Text style={styles.presetText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <BannerAdBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#f0f8ff' },
  body:         { flex: 1, padding: 24 },
  heading:      { fontSize: 18, fontWeight: '700', color: '#1e40af', marginBottom: 20 },
  input:        {
    borderWidth: 1, borderColor: '#93c5fd', borderRadius: 12,
    padding: 14, fontSize: 32, fontWeight: '700',
    backgroundColor: '#fff', textAlign: 'center', color: '#1e40af',
  },
  inputError:   { borderColor: '#ef4444' },
  errorText:    { color: '#ef4444', fontSize: 13, marginTop: 4 },
  unit:         { textAlign: 'center', color: '#6b7280', marginTop: 4, marginBottom: 20 },
  sectionTitle: { fontSize: 14, color: '#6b7280', fontWeight: '600', marginBottom: 10 },
  presets:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  preset:       {
    borderWidth: 1, borderColor: '#93c5fd', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff',
  },
  presetText:   { color: '#1e40af', fontWeight: '500' },
  saveBtn:      {
    backgroundColor: '#3b82f6', borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 10,
  },
  saveBtnText:  { color: '#fff', fontWeight: '700', fontSize: 17 },
});
