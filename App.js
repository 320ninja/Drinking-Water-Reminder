/**
 * Water Reminder — AdMob Earning App Template
 * React Native + Expo + react-native-google-mobile-ads
 *
 * 4 screens: Home → Add (stack), Stats, Settings
 * Ads: Banner (every screen bottom), Interstitial (frequency capped), Rewarded (opt-in)
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import HomeScreen    from './src/screens/HomeScreen';
import AddScreen     from './src/screens/AddScreen';
import StatsScreen   from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { initAds }   from './src/services/AdService';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Add"
        component={AddScreen}
        options={{
          title: 'Log a Drink',
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initAds();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e0f2fe' },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💧</Text>,
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: 'Stats',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
