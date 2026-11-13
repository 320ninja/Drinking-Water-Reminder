/**
 * BannerAdBar — place at the bottom of every screen.
 * Uses Google test ID during development.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_IDS } from '../services/AdService';

export default function BannerAdBar() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_IDS.banner}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
