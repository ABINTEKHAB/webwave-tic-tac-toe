import React, { useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import mobileAds, { AdsConsent, MaxAdContentRating } from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LevelSelectionScreen from './src/screens/LevelSelectionScreen';
import { shouldRenderAds } from './src/ads/adMobConfig';
import GameScreen from './src/screens/GameScreen';
import SplashPortal from './src/components/SplashPortal';
import GameSelectionScreen from './src/screens/GameSelectionScreen';
import WaterSortScreen from './src/screens/WaterSortScreen';
import LudoScreen from './src/screens/LudoScreen';
import SettingsModal from './src/components/SettingsModal';
import { Difficulty, GameMode } from './src/types';
import { ThemeProvider } from './src/theme/ThemeContext';
import { useGameSounds } from './src/hooks/useGameSounds';
import {
  initializeTelemetry,
  logAnalyticsEvent,
  logScreenView,
  recordCrashlyticsError,
  setAnalyticsEnabled,
} from './src/services/firebaseTelemetry';

type Screen = 'GAME_SELECT' | 'TIC_TAC_TOE_SELECT' | 'TIC_TAC_TOE_GAME' | 'WATER_SORT_GAME' | 'LUDO_GAME';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('GAME_SELECT');
  const [splashVisible, setSplashVisible] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('PVAI');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [adsReady, setAdsReady] = useState(false);
  const isMountedRef = useRef(true);
  const mobileAdsInitializedRef = useRef(false);

  // Global settings state managed globally
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    isAdFree: false,
  });
  const [settingsVisible, setSettingsVisible] = useState(false);

  const { playSound } = useGameSounds(settings.soundEnabled);

  // Load settings from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('@webwave_tic_tac_toe:settings')
      .then(val => {
        if (val) {
          const parsed = JSON.parse(val);
          setSettings({
            soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
            vibrationEnabled: typeof parsed.vibrationEnabled === 'boolean' ? parsed.vibrationEnabled : true,
            isAdFree: typeof parsed.isAdFree === 'boolean' ? parsed.isAdFree : false,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const handleUpdateSetting = async (key: 'soundEnabled' | 'vibrationEnabled' | 'isAdFree', value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await AsyncStorage.setItem('@webwave_tic_tac_toe:settings', JSON.stringify(updated));
    } catch {}
  };

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
    let screen = 'GameSelectionScreen';
    if (currentScreen === 'TIC_TAC_TOE_SELECT') screen = 'LevelSelectionScreen';
    if (currentScreen === 'TIC_TAC_TOE_GAME') screen = 'GameScreen';
    if (currentScreen === 'WATER_SORT_GAME') screen = 'WaterSortScreen';
    if (currentScreen === 'LUDO_GAME') screen = 'LudoScreen';
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
    setCurrentScreen('TIC_TAC_TOE_GAME');
  };

  const handleGoHome = () => {
    setCurrentScreen('GAME_SELECT');
  };

  const handleSelectGame = (game: 'TIC_TAC_TOE' | 'WATER_SORT' | 'LUDO') => {
    if (game === 'TIC_TAC_TOE') {
      setCurrentScreen('TIC_TAC_TOE_SELECT');
    } else if (game === 'WATER_SORT') {
      setCurrentScreen('WATER_SORT_GAME');
    } else if (game === 'LUDO') {
      setCurrentScreen('LUDO_GAME');
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    playSound('tap');
    try {
      await Linking.openURL('https://webwaveglobal.com/tic-tac-toe-privacy-policy');
    } catch (error) {
      recordCrashlyticsError(error, 'privacy_policy_open_failed');
    }
  };

  const handleOpenPrivacyOptions = async () => {
    playSound('tap');
    try {
      const consentInfo = await AdsConsent.requestInfoUpdate({
        tagForUnderAgeOfConsent: false,
        testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
      });

      if (consentInfo.privacyOptionsRequirementStatus === 'REQUIRED') {
        await AdsConsent.showPrivacyOptionsForm();
        await refreshAdsState();
        return;
      }

      if (
        consentInfo.isConsentFormAvailable &&
        (consentInfo.status === 'UNKNOWN' || consentInfo.status === 'REQUIRED')
      ) {
        await AdsConsent.showForm();
        await refreshAdsState();
        return;
      }
    } catch (error) {
      recordCrashlyticsError(error, 'ads_privacy_options_open_failed');
    }
  };

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        {splashVisible ? (
          <SplashPortal onFinish={() => setSplashVisible(false)} />
        ) : currentScreen === 'GAME_SELECT' ? (
          <GameSelectionScreen 
            onSelectGame={handleSelectGame} 
            adsReady={adsReady && !settings.isAdFree} 
            onOpenSettings={() => {
              setSettingsVisible(true);
              playSound('tap');
            }}
            soundEnabled={settings.soundEnabled}
          />
        ) : currentScreen === 'TIC_TAC_TOE_SELECT' ? (
          <LevelSelectionScreen
            adsReady={adsReady && !settings.isAdFree}
            onStartGame={handleStartGame}
            onGoBack={handleGoHome}
            soundEnabled={settings.soundEnabled}
          />
        ) : currentScreen === 'TIC_TAC_TOE_GAME' ? (
          <GameScreen
            gameMode={gameMode}
            difficulty={difficulty}
            adsReady={adsReady && !settings.isAdFree}
            onGoHome={() => setCurrentScreen('TIC_TAC_TOE_SELECT')}
            onRefreshAdsState={refreshAdsState}
            settings={settings}
            onUpdateSetting={handleUpdateSetting}
          />
        ) : currentScreen === 'WATER_SORT_GAME' ? (
          <WaterSortScreen
            adsReady={adsReady && !settings.isAdFree}
            onGoHome={handleGoHome}
            onOpenSettings={() => {
              setSettingsVisible(true);
              playSound('tap');
            }}
            soundEnabled={settings.soundEnabled}
            vibrationEnabled={settings.vibrationEnabled}
          />
        ) : (
          <LudoScreen
            adsReady={adsReady && !settings.isAdFree}
            onGoHome={handleGoHome}
            soundEnabled={settings.soundEnabled}
            vibrationEnabled={settings.vibrationEnabled}
          />
        )}

        <SettingsModal
          visible={settingsVisible}
          onClose={() => {
            setSettingsVisible(false);
            playSound('tap');
          }}
          soundEnabled={settings.soundEnabled}
          onToggleSound={(val: boolean) => {
            handleUpdateSetting('soundEnabled', val);
            playSound('tap', true);
          }}
          vibrationEnabled={settings.vibrationEnabled}
          onToggleVibration={(val: boolean) => {
            handleUpdateSetting('vibrationEnabled', val);
            playSound('tap');
          }}
          onResetMatch={() => {}}
          onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
          onOpenPrivacyOptions={handleOpenPrivacyOptions}
          shouldRenderAds={shouldRenderAds}
          contentWidth={400}
          settingsTitleSize={20}
        />
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
