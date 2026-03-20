import React, {useEffect, useRef, useState} from 'react';
import mobileAds, {AdsConsent, MaxAdContentRating} from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LevelSelectionScreen from './src/screens/LevelSelectionScreen';
import GameScreen from './src/screens/GameScreen';
import { Difficulty, GameMode } from './src/types';
import {
  initializeTelemetry,
  logAnalyticsEvent,
  logScreenView,
  recordCrashlyticsError,
  setAnalyticsEnabled,
} from './src/services/firebaseTelemetry';

type Screen = 'LEVEL_SELECT' | 'GAME';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LEVEL_SELECT');
  const [gameMode, setGameMode] = useState<GameMode>('PVAI');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [adsReady, setAdsReady] = useState(false);
  const isMountedRef = useRef(true);
  const mobileAdsInitializedRef = useRef(false);

  const refreshAdsState = async (gatherConsent = false) => {
    try {
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
      });
    } catch {
      // Keep launch stable even when ad request configuration fails.
      recordCrashlyticsError('Failed to set ad request configuration', 'ads_set_request_config');
    }

    if (gatherConsent) {
      try {
        await AdsConsent.gatherConsent();
      } catch {
        // Use previously cached consent status if consent form fails this session.
        recordCrashlyticsError('Ads consent flow failed', 'ads_consent_gather');
      }
    }

    let canRequestAds = false;
    try {
      const consentInfo = await AdsConsent.getConsentInfo();
      canRequestAds = consentInfo.canRequestAds;
    } catch {
      // If consent check fails, we keep ads disabled for safety.
      recordCrashlyticsError('Failed to read consent info', 'ads_consent_read');
    }

    await setAnalyticsEnabled(canRequestAds);

    if (!canRequestAds) {
      if (isMountedRef.current) {
        setAdsReady(false);
      }
      return;
    }

    if (mobileAdsInitializedRef.current) {
      if (isMountedRef.current) {
        setAdsReady(true);
      }
      return;
    }

    try {
      await mobileAds().initialize();
      mobileAdsInitializedRef.current = true;
      if (isMountedRef.current) {
        setAdsReady(true);
      }
    } catch {
      // Avoid blocking gameplay if SDK initialization fails.
      if (isMountedRef.current) {
        setAdsReady(false);
      }
      recordCrashlyticsError('Ad SDK initialization failed', 'ads_sdk_init');
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    initializeTelemetry()
      .then(() => refreshAdsState(true))
      .catch(() => undefined);

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const screen = currentScreen === 'GAME' ? 'GameScreen' : 'LevelSelectionScreen';
    logScreenView(screen).catch(() => undefined);
  }, [currentScreen]);

  const handleStartGame = (mode: GameMode, level?: Difficulty) => {
    const selectedDifficulty = level ?? difficulty;
    setGameMode(mode);
    if (level) {
      setDifficulty(level);
    }
    logAnalyticsEvent('start_game', {
      mode,
      difficulty: selectedDifficulty,
    }).catch(() => undefined);
    setCurrentScreen('GAME');
  };

  const handleGoHome = () => {
    setCurrentScreen('LEVEL_SELECT');
  };

  return (
    <SafeAreaProvider>
      {currentScreen === 'GAME' ? (
        <GameScreen
          gameMode={gameMode}
          difficulty={difficulty}
          adsReady={adsReady}
          onGoHome={handleGoHome}
          onRefreshAdsState={refreshAdsState}
        />
      ) : (
        <LevelSelectionScreen adsReady={adsReady} onStartGame={handleStartGame} />
      )}
    </SafeAreaProvider>
  );
};

export default App;
