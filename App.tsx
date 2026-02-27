import React, {useEffect, useState} from 'react';
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
} from './src/services/firebaseTelemetry';

type Screen = 'LEVEL_SELECT' | 'GAME';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LEVEL_SELECT');
  const [gameMode, setGameMode] = useState<GameMode>('PVAI');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [adsReady, setAdsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAds = async () => {
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

      try {
        await AdsConsent.gatherConsent();
      } catch {
        // Use previously cached consent status if consent form fails this session.
        recordCrashlyticsError('Ads consent flow failed', 'ads_consent_gather');
      }

      let canRequestAds = true;
      try {
        const consentInfo = await AdsConsent.getConsentInfo();
        canRequestAds = consentInfo.canRequestAds;
      } catch {
        // If consent check fails, we keep ads disabled for safety.
        canRequestAds = false;
        recordCrashlyticsError('Failed to read consent info', 'ads_consent_read');
      }

      if (!canRequestAds) {
        if (isMounted) {
          setAdsReady(false);
        }
        return;
      }

      try {
        await mobileAds().initialize();
        if (isMounted) {
          setAdsReady(true);
        }
      } catch {
        // Avoid blocking gameplay if SDK initialization fails.
        if (isMounted) {
          setAdsReady(false);
        }
        recordCrashlyticsError('Ad SDK initialization failed', 'ads_sdk_init');
      }
    };

    if (isMounted) {
      initializeTelemetry().catch(() => undefined);
      initializeAds();
    }

    return () => {
      isMounted = false;
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
        />
      ) : (
        <LevelSelectionScreen adsReady={adsReady} onStartGame={handleStartGame} />
      )}
    </SafeAreaProvider>
  );
};

export default App;
