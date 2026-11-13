import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BannerAdBar from '../components/BannerAdBar';
import { showRewarded, isRewardedReady } from '../services/AdService';
import { getGoal, setGoal, getWeight, setWeight, recommendedGoal } from '../services/DataService';

export default function SettingsScreen() {
  const [goal, setGoalState] = useState(2000);
  const [weight, setWeightState] = useState(70);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);
  const [modal, setModal] = useState(null); // 'goal' | 'weight' | null
  const [inputVal, setInputVal] = useState('');

  const load = useCallback(async () => {
    const [g, w] = await Promise.all([getGoal(), getWeight()]);
    setGoalState(g);
    setWeightState(w);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openModal = (type) => {
    setInputVal(type === 'goal' ? String(goal) : String(weight));
    setModal(type);
  };

  const saveModal = async () => {
    const val = parseFloat(inputVal);
    if (!val || val <= 0) {
      Alert.alert('Invalid value');
      return;
    }
    if (modal === 'goal') {
      await setGoal(Math.round(val));
      setGoalState(Math.round(val));
    } else {
      await setWeight(val);
      const rec = recommendedGoal(val);
      await setGoal(rec);
      setWeightState(val);
      setGoalState(rec);
      Alert.alert('Goal updated', `Set to ${rec} ml (33 ml × ${Math.round(val)} kg)`);
    }
    setModal(null);
  };

  const watchAd = () => {
    if (!isRewardedReady()) {
      Alert.alert('Not ready', 'Ad is loading, try again in a moment.');
      return;
    }
    showRewarded(() => setRewardUnlocked(true));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>⚙️ Settings</Text>

        {/* Goal */}
        <TouchableOpacity style={styles.tile} onPress={() => openModal('goal')}>
          <Text style={styles.tileIcon}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tileTitle}>Daily Goal</Text>
            <Text style={styles.tileSub}>{goal} ml / day</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Weight */}
        <TouchableOpacity style={styles.tile} onPress={() => openModal('weight')}>
          <Text style={styles.tileIcon}>⚖️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tileTitle}>Your Weight</Text>
            <Text style={styles.tileSub}>{weight} kg  →  recommended {recommendedGoal(weight)} ml</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Rewarded ad */}
        <TouchableOpacity
          style={[styles.rewardCard, rewardUnlocked && styles.rewardCardUnlocked]}
          onPress={rewardUnlocked ? undefined : watchAd}
          activeOpacity={rewardUnlocked ? 1 : 0.7}
        >
          <Text style={{ fontSize: 32 }}>{rewardUnlocked ? '🎨' : '▶️'}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.rewardTitle}>
              {rewardUnlocked ? 'Dark Theme Unlocked! 🎉' : 'Watch an ad → Unlock Dark Theme'}
            </Text>
            <Text style={styles.rewardSub}>
              {rewardUnlocked ? 'Thanks for supporting the app!' : '30 s video — free for you'}
            </Text>
          </View>
          {!rewardUnlocked && <Text style={styles.arrow}>›</Text>}
        </TouchableOpacity>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            Drink Water Reminder — your offline hydration tracker.{'\n'}
            All data stored on your device. No account needed.
          </Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </ScrollView>
      <BannerAdBar />

      {/* Input Modal */}
      <Modal visible={!!modal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {modal === 'goal' ? 'Set Daily Goal' : 'Your Weight'}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={inputVal}
              onChangeText={setInputVal}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.modalUnit}>{modal === 'goal' ? 'ml' : 'kg'}</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModal(null)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveModal}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#f0f8ff' },
  scroll:             { padding: 20 },
  title:              { fontSize: 22, fontWeight: '700', color: '#1e40af', marginBottom: 20 },
  tile:               {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  tileIcon:           { fontSize: 24, marginRight: 12 },
  tileTitle:          { fontWeight: '600', color: '#1e3a8a' },
  tileSub:            { fontSize: 13, color: '#6b7280' },
  arrow:              { fontSize: 22, color: '#93c5fd' },
  divider:            { height: 1, backgroundColor: '#e0f2fe', marginVertical: 16 },
  rewardCard:         {
    backgroundColor: '#fefce8', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  rewardCardUnlocked: { backgroundColor: '#f0fdf4' },
  rewardTitle:        { fontWeight: '700', color: '#92400e', marginBottom: 2 },
  rewardSub:          { fontSize: 13, color: '#6b7280' },
  aboutCard:          {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
  },
  aboutText:          { color: '#6b7280', lineHeight: 22 },
  version:            { color: '#9ca3af', fontSize: 12, marginTop: 8 },
  modalOverlay:       {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  modalBox:           {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '80%',
  },
  modalTitle:         { fontSize: 17, fontWeight: '700', marginBottom: 16, color: '#1e40af' },
  modalInput:         {
    borderWidth: 1, borderColor: '#93c5fd', borderRadius: 10, padding: 12,
    fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#1e40af',
  },
  modalUnit:          { textAlign: 'center', color: '#6b7280', marginTop: 4 },
  modalBtns:          { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 12 },
  modalCancel:        { padding: 10 },
  modalSave:          {
    backgroundColor: '#3b82f6', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10,
  },
});
