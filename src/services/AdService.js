/**
 * AdService.js — AdMob wrapper
 *
 * TEMPLATE: Replace YOUR_* constants with real AdMob IDs before publishing.
 * USE_TEST_ADS = true during development. NEVER click your own ads.
 *
 * iOS: add GADApplicationIdentifier to Info.plist
 * Android: add meta-data APPLICATION_ID to AndroidManifest.xml
 */

import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// ── Toggle false once you have real IDs ──────────────────────────────────────
const USE_TEST_ADS = true;

// ── Your real AdMob unit IDs (fill in after AdMob approval) ─────────────────
const REAL_IDS = {
  android: {
    app:          'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY', // App ID
    banner:       'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN',
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN',
    rewarded:     'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN',
  },
  ios: {
    app:          'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY', // App ID
    banner:       'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN',
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN',
    rewarded:     'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN',
  },
};

const ids = Platform.OS === 'ios' ? REAL_IDS.ios : REAL_IDS.android;

export const AD_IDS = {
  banner:       USE_TEST_ADS ? TestIds.BANNER        : ids.banner,
  interstitial: USE_TEST_ADS ? TestIds.INTERSTITIAL  : ids.interstitial,
  rewarded:     USE_TEST_ADS ? TestIds.REWARDED       : ids.rewarded,
};

export const BANNER_SIZE = BannerAdSize.BANNER;

// ── Interstitial — frequency capped ─────────────────────────────────────────
const ACTIONS_CAP = 3;        // show after every N completed actions
const TIME_CAP_MS = 3 * 60 * 1000; // minimum 3 min between shows

let _interstitial = null;
let _interstitialReady = false;
let _actionCount = 0;
let _lastShown = 0;

function _loadInterstitial() {
  _interstitial = InterstitialAd.createForAdRequest(AD_IDS.interstitial, {
    requestNonPersonalizedAdsOnly: true,
  });
  _interstitial.addAdEventListener(AdEventType.LOADED, () => {
    _interstitialReady = true;
  });
  _interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    _interstitialReady = false;
    _loadInterstitial(); // preload next
  });
  _interstitial.addAdEventListener(AdEventType.ERROR, () => {
    _interstitialReady = false;
    setTimeout(_loadInterstitial, 30_000);
  });
  _interstitial.load();
}

/** Call after each meaningful user action (e.g. log a drink). */
export function onActionCompleted() {
  _actionCount++;
  const now = Date.now();
  if (_actionCount >= ACTIONS_CAP && now - _lastShown >= TIME_CAP_MS && _interstitialReady) {
    _interstitial.show();
    _actionCount = 0;
    _lastShown = now;
  }
}

// ── Rewarded ─────────────────────────────────────────────────────────────────
let _rewarded = null;
let _rewardedReady = false;

function _loadRewarded() {
  _rewarded = RewardedAd.createForAdRequest(AD_IDS.rewarded, {
    requestNonPersonalizedAdsOnly: true,
  });
  _rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    _rewardedReady = true;
  });
  _rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    _rewardedReady = false;
    _loadRewarded();
  });
  _rewarded.addAdEventListener(AdEventType.ERROR, () => {
    _rewardedReady = false;
    setTimeout(_loadRewarded, 30_000);
  });
  _rewarded.load();
}

export function showRewarded(onEarned) {
  if (!_rewardedReady || !_rewarded) return;
  _rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, onEarned);
  _rewarded.show();
}

export function isRewardedReady() {
  return _rewardedReady;
}

// ── Init (call once at app start) ────────────────────────────────────────────
export function initAds() {
  _loadInterstitial();
  _loadRewarded();
}
