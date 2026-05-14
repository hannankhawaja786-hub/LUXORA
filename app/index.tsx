import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import OnboardingScreen from './OnboardingScreen';
import SplashScreen from './SplashScreen';

type AppState = 'splash' | 'onboarding' | 'ready';

export default function Index() {
  const router = useRouter();
  const { session, isInitialized } = useAuthStore();
  const [appState, setAppState] = useState<AppState>('splash');

  // ✅ FIX — useEffect ke andar router.replace()
  useEffect(() => {
    if (appState !== 'ready') return;
    if (!isInitialized) return;

    if (session) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [appState, isInitialized, session]);

  if (appState === 'splash')
    return <SplashScreen onDone={() => setAppState('onboarding')} />;

  if (appState === 'onboarding')
    return <OnboardingScreen onDone={() => setAppState('ready')} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#C9A84C" />
    </View>
  );
}