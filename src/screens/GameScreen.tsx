import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const BACKGROUND_IMG = require('../assets/images/bgr_1.png');
import { AdsConsent } from 'react-native-google-mobile-ads';
import { shouldRenderAds } from '../ads/adMobConfig';
import Icon from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useGameLayout } from '../hooks/useGameLayout';
import { useGameSounds } from '../hooks/useGameSounds';
import { useAdMob } from '../hooks/useAdMob';
import { recordMatchResult, getCareerStats, resetStatsForMode } from '../services/stats';
import AdBanner from '../components/AdBanner';
import GameOverModal from '../components/GameOverModal';
import ScoreBoard from '../components/ScoreBoard';
import Square from '../components/Square';
import WinningLine from '../components/WinningLine';
import SettingsModal from '../components/SettingsModal';
import { hexToRgba } from '../theme/themes';
import ConsentFeedbackModal from '../components/ConsentFeedbackModal';
import PauseModal from '../components/PauseModal';
import { recordCrashlyticsError, triggerCrashlyticsTestCrash } from '../services/firebaseTelemetry';
import { colors as defaultColors, radii, shadows as defaultShadows, spacing, typography } from '../theme/tokens';
import { Difficulty, GameMode, GameState, Player, Score } from '../types';
import { getAiMove } from '../utils/ai';
import { calculateWinner } from '../utils/gameLogic';

interface GameScreenProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  adsReady: boolean;
  onGoHome: () => void;
  onRefreshAdsState: () => Promise<void>;
  settings: {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    isAdFree: boolean;
  };
  onUpdateSetting: (key: 'soundEnabled' | 'vibrationEnabled' | 'isAdFree', value: boolean) => void;
}

type Mark = Exclude<Player, null>;

interface GameSettings {
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  isAdFree: boolean;
}

interface ConsentFeedbackState {
  visible: boolean;
  title: string;
  message: string;
}

const HUMAN_MARK: Mark = 'O';
const AI_MARK: Mark = 'X';
const INITIAL_SCORE: Score = { x: 0, o: 0, draws: 0 };
const WINNING_LINE_ANIMATION_MS = 1200;
const SETTINGS_STORAGE_KEY = '@webwave_tic_tac_toe:game_settings';
const DEFAULT_SETTINGS: GameSettings = {
  vibrationEnabled: true,
  soundEnabled: true,
  isAdFree: false,
};
const DEFAULT_CONSENT_FEEDBACK: ConsentFeedbackState = {
  visible: false,
  title: '',
  message: '',
};
const PRIVACY_POLICY_URL = 'https://webwaveglobal.com/tic-tac-toe-privacy-policy';

const getStartingMark = (mode: GameMode): Mark => (mode === 'PVAI' ? HUMAN_MARK : 'X');

const createInitialGameState = (startingMark: Mark): GameState => ({
  board: Array(9).fill(null),
  xIsNext: startingMark === 'X',
  winner: null,
  winningLine: null,
});

const buildNextState = (prevGame: GameState, index: number, mark: Mark): GameState => {
  const nextBoard = [...prevGame.board];
  nextBoard[index] = mark;
  const { winner, line } = calculateWinner(nextBoard);

  return {
    board: nextBoard,
    xIsNext: mark === 'O',
    winner,
    winningLine: line,
  };
};

const parseStoredSettings = (rawSettings: string | null): GameSettings => {
  if (!rawSettings) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(rawSettings) as Partial<GameSettings>;
    return {
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
      vibrationEnabled: typeof parsed.vibrationEnabled === 'boolean' ? parsed.vibrationEnabled : DEFAULT_SETTINGS.vibrationEnabled,
      isAdFree: typeof parsed.isAdFree === 'boolean' ? parsed.isAdFree : DEFAULT_SETTINGS.isAdFree,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const GameScreen = ({ gameMode, difficulty, adsReady, onGoHome, onRefreshAdsState, settings, onUpdateSetting }: GameScreenProps) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  // Layout Hook
  const layout = useGameLayout(adsReady, !settings.isAdFree && shouldRenderAds);

  // AdMob Hook
  const { adVisible, incrementRoundsAndMaybeShowAd, resetRounds, showInterstitial } = useAdMob(adsReady, settings.isAdFree);

  // Sounds Hook
  const { playSound } = useGameSounds(settings.soundEnabled);

  const [game, setGame] = useState<GameState>(() => createInitialGameState(getStartingMark(gameMode)));
  const [history, setHistory] = useState<GameState[]>([]);
  const [showGameOver, setShowGameOver] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [score, setScore] = useState<Score>(INITIAL_SCORE);

  // Load cumulative stats for this difficulty / gameMode
  useEffect(() => {
    let active = true;
    const loadStatsForMode = async () => {
      try {
        const stats = await getCareerStats();
        if (!active) return;

        if (gameMode === 'PVP') {
          setScore({
            x: stats.pvpWinsX,
            o: stats.pvpWinsO,
            draws: stats.pvpDraws,
          });
        } else {
          if (difficulty === 'Easy') {
            setScore({
              o: stats.aiEasyWinsUser,
              x: stats.aiEasyWinsAi,
              draws: stats.aiEasyDraws,
            });
          } else if (difficulty === 'Medium') {
            setScore({
              o: stats.aiMediumWinsUser,
              x: stats.aiMediumWinsAi,
              draws: stats.aiMediumDraws,
            });
          } else if (difficulty === 'Hard') {
            setScore({
              o: stats.aiHardWinsUser,
              x: stats.aiHardWinsAi,
              draws: stats.aiHardDraws,
            });
          }
        }
      } catch (err) {
        // Fallback
      }
    };

    loadStatsForMode();
    return () => {
      active = false;
    };
  }, [gameMode, difficulty]);

  const handleUndo = () => {
    if (history.length === 0 || game.winner !== null || isAiTurn) return;
    playSound('tap');
    triggerVibration(10);

    const newHistory = [...history];
    const prevState = newHistory.pop();
    if (prevState) {
      showInterstitial();
      setGame(prevState);
      setHistory(newHistory);
    }
  };
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [consentFeedback, setConsentFeedback] = useState<ConsentFeedbackState>(DEFAULT_CONSENT_FEEDBACK);

  const triggerVibration = useCallback(
    (pattern: number | number[], force = false) => {
      if (!force && !settings.vibrationEnabled) {
        return;
      }
      import('react-native').then(({ Vibration }) => {
        Vibration.vibrate(pattern);
      });
    },
    [settings.vibrationEnabled]
  );

  const currentTurn: Mark = game.xIsNext ? 'X' : 'O';
  const isAiTurn = gameMode === 'PVAI' && game.winner === null && currentTurn === AI_MARK;
  const leftSymbol: Mark = gameMode === 'PVAI' ? HUMAN_MARK : 'O';
  const rightSymbol: Mark = gameMode === 'PVAI' ? AI_MARK : 'X';
  const leftTurnActive = game.winner === null && currentTurn === leftSymbol;
  const rightTurnActive = game.winner === null && currentTurn === rightSymbol;
  const levelBadgeText = gameMode === 'PVAI' ? difficulty.toUpperCase() : 'PVP';

  const modeTitleText = gameMode === 'PVAI' ? 'PLAYER VS AI' : 'PLAYER VS PLAYER';
  const feedbackStatusText = useMemo(() => {
    let feedback = [];
    if (settings.soundEnabled) feedback.push('SOUND');
    if (settings.vibrationEnabled) feedback.push('VIBRATION');
    return feedback.length > 0 ? `${feedback.join(' + ')} ON` : 'FEEDBACK OFF';
  }, [settings.soundEnabled, settings.vibrationEnabled]);

  // Reset timer on turn change
  useEffect(() => {
    setTimeLeft(15);
  }, [currentTurn]);

  // Turn timer countdown effect
  useEffect(() => {
    if (game.winner || isAiTurn || settingsModalVisible || pauseModalVisible || showGameOver || consentFeedback.visible) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game.winner, isAiTurn, settingsModalVisible, pauseModalVisible, showGameOver, consentFeedback.visible, currentTurn, gameMode, playSound, triggerVibration, game.board]);

  useEffect(() => {
    if (!game.winner) {
      return;
    }

    // Increment completed rounds for ad cooldown
    incrementRoundsAndMaybeShowAd();

    if (game.winner === 'X') {
      setScore(prev => ({ ...prev, x: prev.x + 1 }));
      // play X win sound
      playSound('xwin');
      triggerVibration([0, 40, 30, 40]);
      recordMatchResult(gameMode, 'X', HUMAN_MARK, difficulty).catch(() => { });
    } else if (game.winner === 'O') {
      setScore(prev => ({ ...prev, o: prev.o + 1 }));
      // play O win sound
      playSound('owin');
      triggerVibration([0, 40, 30, 40]);
      recordMatchResult(gameMode, 'O', HUMAN_MARK, difficulty).catch(() => { });
    } else {
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      // play draw/gameover sound
      playSound('gameover');
      triggerVibration(25);
      recordMatchResult(gameMode, 'Draw', HUMAN_MARK, difficulty).catch(() => { });
    }

    if (game.winner === 'Draw' || !game.winningLine) {
      setShowGameOver(true);
      return;
    }

    setShowGameOver(false);
  }, [game.winner, game.winningLine, playSound, triggerVibration, gameMode, incrementRoundsAndMaybeShowAd, difficulty]);

  useEffect(() => {
    if (!isAiTurn) {
      return;
    }

    const timer = setTimeout(() => {
      setGame(prevGame => {
        if (prevGame.winner) {
          return prevGame;
        }

        const liveTurn: Mark = prevGame.xIsNext ? 'X' : 'O';
        if (liveTurn !== AI_MARK) {
          return prevGame;
        }

        const aiMove = getAiMove(prevGame.board, difficulty, AI_MARK, HUMAN_MARK);
        if (aiMove < 0 || prevGame.board[aiMove] !== null) {
          return prevGame;
        }

        // play specific sound for X (AI) move
        playSound('xmove');
        triggerVibration(12);
        return buildNextState(prevGame, aiMove, AI_MARK);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [difficulty, isAiTurn, playSound, triggerVibration]);

  const statusText = useMemo(() => {
    if (game.winner === 'Draw') {
      return 'ROUND DRAW';
    }

    if (game.winner) {
      if (gameMode === 'PVAI') {
        return game.winner === AI_MARK ? 'AI WINS!' : 'YOU WIN!';
      }
      return `${game.winner} WINS!`;
    }

    if (gameMode === 'PVAI') {
      return isAiTurn ? 'AI THINKING...' : 'YOUR TURN';
    }

    return currentTurn === 'X' ? 'PLAYER X TURN' : 'PLAYER O TURN';
  }, [currentTurn, game.winner, gameMode, isAiTurn]);

  const gameOverModalTitle = useMemo(() => {
    if (game.winner === 'Draw') {
      return 'ROUND DRAW';
    }

    if (game.winner === 'X' || game.winner === 'O') {
      if (gameMode === 'PVAI') {
        return game.winner === AI_MARK ? 'AI WINS!' : 'YOU WIN!';
      }

      return game.winner === 'X' ? 'PLAYER X WINS!' : 'PLAYER O WINS!';
    }

    return 'GAME OVER';
  }, [game.winner, gameMode]);

  const gameOverModalResultText = game.winner === 'Draw' ? 'NO WINNER THIS ROUND' : 'WINNER';

  const handlePressSquare = (index: number) => {
    if (game.board[index] || game.winner) return;

    const turnMark: Mark = game.xIsNext ? 'X' : 'O';
    if (gameMode === 'PVAI' && turnMark === AI_MARK) {
      return;
    }

    // play specific sound depending on mark
    playSound(turnMark === 'X' ? 'xmove' : 'omove');
    triggerVibration(15);
    setHistory(prev => [...prev, game]);
    setGame(prevGame => buildNextState(prevGame, index, turnMark));
  };

  const resetRound = useCallback(() => {
    playSound('tap');
    triggerVibration(10);
    setGame(createInitialGameState(getStartingMark(gameMode)));
    setHistory([]);
    setShowGameOver(false);
  }, [gameMode, playSound, triggerVibration]);

  const resetAll = useCallback(async () => {
    playSound('tap');
    triggerVibration(10);
    try {
      await resetStatsForMode(gameMode, difficulty);
    } catch (e) {
      // Fail silent
    }
    setScore(INITIAL_SCORE);
    setGame(createInitialGameState(getStartingMark(gameMode)));
    setHistory([]);
    setShowGameOver(false);
    resetRounds();
  }, [gameMode, difficulty, playSound, triggerVibration, resetRounds]);

  const handleReplay = () => {
    resetRound();
  };

  const handleHome = () => {
    playSound('tap');
    triggerVibration(8);
    onGoHome();
  };

  const handlePause = () => {
    playSound('tap');
    triggerVibration(8);
    setPauseModalVisible(true);
  };

  const handleResume = () => {
    playSound('tap');
    triggerVibration(8);
    setPauseModalVisible(false);
  };

  const handleRestart = () => {
    playSound('tap');
    triggerVibration(10);
    resetRound();
    setPauseModalVisible(false);
  };

  const openSettingsModal = () => {
    setSettingsModalVisible(true);
    playSound('tap');
    triggerVibration(8);
  };

  const closeSettingsModal = () => {
    setSettingsModalVisible(false);
    playSound('tap');
  };

  const openConsentFeedbackModal = useCallback((title: string, message: string) => {
    setConsentFeedback({
      visible: true,
      title,
      message,
    });
  }, []);

  const closeConsentFeedbackModal = () => {
    setConsentFeedback(DEFAULT_CONSENT_FEEDBACK);
    playSound('tap');
  };

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (consentFeedback.visible) {
        closeConsentFeedbackModal();
        return true;
      }

      if (settingsModalVisible) {
        closeSettingsModal();
        return true;
      }

      if (pauseModalVisible) {
        setPauseModalVisible(false);
        return true;
      }

      if (!game.winner) {
        setPauseModalVisible(true);
        return true;
      }

      handleHome();
      return true;
    });

    return () => backSubscription.remove();
  }, [consentFeedback.visible, settingsModalVisible, pauseModalVisible, game.winner]);

  const handleOpenPrivacyPolicy = async () => {
    playSound('tap');
    triggerVibration(8, true);

    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch (error) {
      recordCrashlyticsError(error, 'privacy_policy_open_failed');
      openConsentFeedbackModal(
        'Privacy Policy Unavailable',
        'The privacy policy page could not be opened right now. Please check your internet connection and try again.',
      );
    }
  };

  const handleOpenPrivacyOptions = async () => {
    playSound('tap');
    triggerVibration(8, true);

    try {
      const consentInfo = await AdsConsent.requestInfoUpdate({
        tagForUnderAgeOfConsent: false,
        testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
      });

      if (consentInfo.privacyOptionsRequirementStatus === 'REQUIRED') {
        await AdsConsent.showPrivacyOptionsForm();
        await onRefreshAdsState();
        return;
      }

      if (
        consentInfo.isConsentFormAvailable &&
        (consentInfo.status === 'UNKNOWN' || consentInfo.status === 'REQUIRED')
      ) {
        await AdsConsent.showForm();
        await onRefreshAdsState();
        return;
      }

      openConsentFeedbackModal(
        'Privacy Options',
        'Privacy options are not required for your current region or consent state.',
      );
    } catch (error) {
      recordCrashlyticsError(error, 'ads_privacy_options_open_failed');
      openConsentFeedbackModal(
        'Consent Form Unavailable',
        'The consent form could not be opened right now. Please check your internet connection and try again.',
      );
    }
  };

  const handleToggleSound = () => {
    onUpdateSetting('soundEnabled', !settings.soundEnabled);
    playSound('tap', true);
    triggerVibration(10, true);
  };

  const handleToggleVibration = () => {
    onUpdateSetting('vibrationEnabled', !settings.vibrationEnabled);
    triggerVibration(10, true);
    playSound('tap');
  };



  const handleToggleAdFree = () => {
    onUpdateSetting('isAdFree', !settings.isAdFree);
    triggerVibration(10, true);
    playSound('tap');
  };

  const handleResetFromSettings = () => {
    resetAll();
    setSettingsModalVisible(false);
  };

  const handleWinningAnimationComplete = () => {
    if (game.winner && game.winner !== 'Draw') {
      setShowGameOver(true);
    }
  };

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.backgroundBase}
        translucent={false}
        hidden={false}
      />
      <View style={styles.container}>
        <ImageBackground source={BACKGROUND_IMG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.midGlow} />
        <View pointerEvents="none" style={styles.bottomGlow} />
        <View
          style={[
            styles.contentWrap,
            {
              paddingTop: layout.topUiPadding,
              paddingBottom: adVisible ? layout.bottomSafeSpace + (layout.topTightLayout ? 2 : 8) : layout.bottomSafeSpace,
            },
          ]}
        >
          <View style={[styles.content, { width: layout.contentWidth }]}>
            {/* Header Row */}
            <View
              style={[
                styles.headerRow,
                layout.topCompactLayout && styles.headerRowCompact,
                layout.topTightLayout && styles.headerRowTight,
              ]}
            >
              <Pressable
                onPress={game.winner ? handleHome : handlePause}
                accessibilityRole="button"
                accessibilityLabel={game.winner ? "Go back to home" : "Pause game match"}
                style={({ pressed }) => [
                  styles.iconBtn,
                  styles.iconBtnBack,
                  { width: layout.iconButtonSize, height: layout.iconButtonSize, borderRadius: layout.iconButtonRadius },
                  pressed && styles.iconBtnPressed,
                ]}
                android_disableSound={true}
              >
                <Icon
                  name={game.winner ? "arrow-back" : "pause"}
                  size={Math.max(18, layout.iconFontSize - 10)}
                  color={colors.cyanBright}
                />
              </Pressable>

              <View style={styles.headerCenter}>
                <Text
                  numberOfLines={1}
                  style={[styles.headerTitle, { fontSize: layout.headerTitleSize }]}
                >
                  {modeTitleText}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.headerSubtitle, { fontSize: layout.headerSubtitleSize }]}
                >
                  {feedbackStatusText}
                </Text>
              </View>

              <Pressable
                onPress={openSettingsModal}
                accessibilityRole="button"
                accessibilityLabel="Open game settings"
                style={({ pressed }) => [
                  styles.iconBtn,
                  styles.iconBtnSettings,
                  { width: layout.iconButtonSize, height: layout.iconButtonSize, borderRadius: layout.iconButtonRadius },
                  pressed && styles.iconBtnPressed,
                ]}
                android_disableSound={true}
              >
                <Icon
                  name="settings-outline"
                  size={Math.max(18, layout.iconFontSize - 10)}
                  color={colors.pinkPrimary}
                />
              </Pressable>
            </View>

            {/* Scoreboard */}
            <View>
              <ScoreBoard
                score={score}
                mode={gameMode}
                currentTurn={currentTurn}
                winner={game.winner}
                humanMark={HUMAN_MARK}
                aiMark={AI_MARK}
                referenceCellSize={layout.boardCellSize}
                compact={layout.topCompactLayout}
                dense={layout.topTightLayout}
              />
            </View>

            {/* Dots / Turn indicator and Level Badge */}
            <View
              style={[
                styles.boardMetaRow,
                layout.topCompactLayout && styles.boardMetaRowCompact,
                layout.topTightLayout && styles.boardMetaRowTight,
              ]}
            >
              <View
                style={[
                  styles.dotsPill,
                  layout.topCompactLayout && styles.dotsPillCompact,
                  layout.topTightLayout && styles.dotsPillTight,
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    layout.topCompactLayout && styles.dotCompact,
                    layout.topTightLayout && styles.dotTight,
                    leftTurnActive && styles.dotActive,
                  ]}
                />
                <View
                  style={[
                    styles.dot,
                    layout.topCompactLayout && styles.dotCompact,
                    layout.topTightLayout && styles.dotTight,
                    styles.dotMiddle,
                    layout.topTightLayout && styles.dotMiddleTight,
                    game.winner === 'Draw' && styles.dotActive,
                  ]}
                />
                <View
                  style={[
                    styles.dot,
                    layout.topCompactLayout && styles.dotCompact,
                    layout.topTightLayout && styles.dotTight,
                    rightTurnActive && styles.dotActive,
                  ]}
                />
              </View>

              {/* Turn Countdown Timer Pill */}
              <View
                style={[
                  styles.timerPill,
                  layout.topCompactLayout && styles.timerPillCompact,
                  layout.topTightLayout && styles.timerPillTight,
                  { borderColor: currentTurn === 'X' ? colors.pinkBorder : colors.cyanBorder }
                ]}
              >
                <Icon name="time-outline" size={14} color={currentTurn === 'X' ? colors.pinkPrimary : colors.cyanPrimary} style={{ marginRight: 4 }} />
                <Text style={[styles.timerText, { fontSize: layout.levelFontSize, color: currentTurn === 'X' ? colors.pinkPrimary : colors.cyanPrimary }]}>{timeLeft}s</Text>
              </View>

              <View
                style={[
                  styles.levelPill,
                  layout.topCompactLayout && styles.levelPillCompact,
                  layout.topTightLayout && styles.levelPillTight,
                ]}
              >
                <Text style={[styles.levelText, { fontSize: layout.levelFontSize }]}>{levelBadgeText}</Text>
              </View>
            </View>

            {/* Game Board */}
            <View style={[styles.boardOuter, { width: layout.boardSize, height: layout.boardSize }]}>
              <View pointerEvents="none" style={styles.boardGlow} />
              <View pointerEvents="none" style={styles.boardSecondaryGlow} />
              <View pointerEvents="box-none" style={styles.board}>
                <View pointerEvents="none" style={styles.boardSweepLarge} />
                <View pointerEvents="none" style={styles.boardSweepSmall} />
                {game.board.map((value, index) => (
                  <Square
                    key={index}
                    index={index}
                    value={value}
                    onPress={() => handlePressSquare(index)}
                    disabled={!!game.winner || isAiTurn}
                    isWinningSquare={game.winningLine?.includes(index) ?? false}
                  />
                ))}

                <View pointerEvents="none" style={styles.gridOverlay}>
                  <View style={[styles.gridLineVertical, { left: '33.3333%' }]} />
                  <View style={[styles.gridLineVertical, { left: '66.6666%' }]} />
                  <View style={[styles.gridLineHorizontal, { top: '33.3333%' }]} />
                  <View style={[styles.gridLineHorizontal, { top: '66.6666%' }]} />
                </View>

                <WinningLine
                  line={game.winningLine}
                  boardSize={layout.boardSize}
                  durationMs={WINNING_LINE_ANIMATION_MS}
                  onAnimationComplete={handleWinningAnimationComplete}
                />
              </View>
            </View>

            {/* Status Indicator */}
            <View
              style={[
                styles.statusRow,
                layout.topCompactLayout && styles.statusRowCompact,
                layout.topTightLayout && styles.statusRowTight,
              ]}
            >
              <Text style={[styles.statusText, { fontSize: layout.statusFontSize }]}>{statusText}</Text>
            </View>

            {/* Replay & Undo Actions */}
            <View
              style={[
                styles.bottomActionRow,
                layout.topCompactLayout && styles.bottomActionRowCompact,
                layout.topTightLayout && styles.bottomActionRowTight,
              ]}
            >
              {/* Undo Button */}
              <Pressable
                onPress={handleUndo}
                disabled={history.length === 0 || game.winner !== null || isAiTurn}
                accessibilityRole="button"
                accessibilityLabel="Undo last move"
                style={({ pressed }) => [
                  styles.replayBtn,
                  {
                    width: layout.replayButtonSize,
                    height: layout.replayButtonSize,
                    borderRadius: layout.replayButtonRadius,
                    marginRight: spacing.md,
                    opacity: (history.length === 0 || game.winner !== null || isAiTurn) ? 0.4 : 1,
                  },
                  pressed && styles.replayBtnPressed,
                ]}
                android_disableSound={true}
              >
                <Icon name="arrow-undo-outline" size={layout.replayIconSize - 2} color={colors.pinkPrimary} style={styles.replayIcon} />
              </Pressable>

              {/* Replay Button */}
              <Pressable
                onPress={resetRound}
                accessibilityRole="button"
                accessibilityLabel="Replay this round"
                style={({ pressed }) => [
                  styles.replayBtn,
                  {
                    width: layout.replayButtonSize,
                    height: layout.replayButtonSize,
                    borderRadius: layout.replayButtonRadius,
                  },
                  pressed && styles.replayBtnPressed,
                ]}
                android_disableSound={true}
              >
                <Icon name="refresh" size={layout.replayIconSize} color={colors.cyanBright} style={styles.replayIcon} />
              </Pressable>
            </View>
          </View>
        </View>

        {adVisible && (
          <View
            style={[
              styles.adWrap,

            ]}
          >
            <AdBanner compact />
          </View>
        )}
      </View>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={closeSettingsModal}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
        onToggleSound={handleToggleSound}
        onToggleVibration={handleToggleVibration}
        onResetMatch={handleResetFromSettings}
        onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
        onOpenPrivacyOptions={handleOpenPrivacyOptions}
        shouldRenderAds={shouldRenderAds}
        contentWidth={layout.contentWidth}
        settingsTitleSize={layout.settingsTitleSize}
      />

      {/* Consent Modal */}
      <ConsentFeedbackModal
        visible={consentFeedback.visible}
        title={consentFeedback.title}
        message={consentFeedback.message}
        onClose={closeConsentFeedbackModal}
        contentWidth={layout.contentWidth}
      />

      {/* Game Over Modal */}
      <GameOverModal
        visible={showGameOver}
        winner={game.winner || 'Draw'}
        titleText={gameOverModalTitle}
        resultText={gameOverModalResultText}
        onHome={handleHome}
        onReplay={handleReplay}
      />

      {/* Pause Modal */}
      <PauseModal
        visible={pauseModalVisible}
        onResume={handleResume}
        onRestart={handleRestart}
        onHome={handleHome}
        contentWidth={layout.contentWidth}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: any, shadows: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundBase,
    },
    container: {
      flex: 1,
      backgroundColor: colors.backgroundBase,
    },
    contentWrap: {
      flex: 1,
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.xs,
      justifyContent: 'space-between',
    },
    content: {
      width: '100%',
      alignSelf: 'center',
    },
    topGlow: {
      position: 'absolute',
      width: 520,
      height: 520,
      borderRadius: 520,
      top: -290,
      left: -70,
      backgroundColor: colors.glowPrimary,
    },
    midGlow: {
      position: 'absolute',
      width: 440,
      height: 440,
      borderRadius: 440,
      right: -240,
      top: 260,
      backgroundColor: colors.glowPrimary,
    },
    bottomGlow: {
      position: 'absolute',
      width: 560,
      height: 560,
      borderRadius: 560,
      left: -270,
      bottom: -300,
      backgroundColor: colors.glowSecondary,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    headerRowCompact: {
      marginBottom: 6,
    },
    headerRowTight: {
      marginBottom: 16,
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    headerTitle: {
      color: colors.textPrimary,
      letterSpacing: typography.tracking.wide,
      textShadowColor: hexToRgba(colors.cyanGlow, 0.45),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      textAlign: 'center',
      fontFamily: typography.family.black,
    },
    headerSubtitle: {
      marginTop: 2,
      color: colors.textSecondary,
      letterSpacing: typography.tracking.normal,
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      textAlign: 'center',
      fontFamily: typography.family.semibold,
    },
    iconBtn: {
      width: 56,
      height: 56,
      borderRadius: radii.lg,
      borderWidth: 1.5,
      backgroundColor: 'rgba(20, 4, 75, 0.84)',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    iconBtnBack: {
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurface,
      ...shadows.cyanSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    iconBtnSettings: {
      borderColor: colors.pinkBorder,
      backgroundColor: colors.cardSurfaceAlt,
      ...shadows.pinkSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    iconBtnPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.97 }],
    },
    boardMetaRow: {
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    boardMetaRowCompact: {
      marginTop: 6,
      marginBottom: 8,
    },
    boardMetaRowTight: {
      marginTop: 2,
      marginBottom: 4,
    },
    dotsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radii.sm + 3,
      borderWidth: 1.4,
      borderColor: colors.cyanSoft,
      backgroundColor: colors.cardSurfaceSoft,
      paddingHorizontal: spacing.sm + 2,
      height: 40,
      minWidth: 122,
    },
    dotsPillCompact: {
      height: 34,
      minWidth: 108,
      paddingHorizontal: spacing.sm,
    },
    dotsPillTight: {
      height: 30,
      minWidth: 98,
      paddingHorizontal: spacing.xs + 2,
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 14,
      borderWidth: 1.4,
      borderColor: colors.dotInactiveBorder,
      backgroundColor: colors.dotInactiveBackground,
    },
    dotCompact: {
      width: 12,
      height: 12,
      borderRadius: 12,
    },
    dotTight: {
      width: 10,
      height: 10,
      borderRadius: 10,
    },
    dotMiddle: {
      marginHorizontal: 8,
    },
    dotMiddleTight: {
      marginHorizontal: 6,
    },
    dotActive: {
      borderColor: colors.cyanBright,
      backgroundColor: colors.textPrimary,
      shadowColor: colors.cyanGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.95,
      shadowRadius: 8,
    },
    levelPill: {
      borderRadius: radii.sm + 2,
      borderWidth: 1.4,
      borderColor: colors.cyanSoft,
      backgroundColor: colors.cardSurfaceStrong,
      minWidth: 116,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm + 2,
      height: 40,
    },
    levelPillCompact: {
      minWidth: 102,
      height: 34,
      paddingHorizontal: spacing.sm,
    },
    levelPillTight: {
      minWidth: 94,
      height: 30,
      paddingHorizontal: spacing.xs + 2,
    },
    timerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.sm + 2,
      borderWidth: 1.4,
      backgroundColor: colors.cardSurfaceStrong,
      minWidth: 70,
      height: 40,
      paddingHorizontal: spacing.xs,
    },
    timerPillCompact: {
      minWidth: 64,
      height: 34,
    },
    timerPillTight: {
      minWidth: 58,
      height: 30,
    },
    timerText: {
      fontFamily: typography.family.black,
    },
    levelText: {
      color: colors.cyanPrimary,
      letterSpacing: typography.tracking.normal,
      fontFamily: typography.family.black,
    },
    boardOuter: {
      alignSelf: 'center',
      borderRadius: radii.xxl,
      marginTop: 10,
    },
    boardGlow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radii.xxl,
      borderWidth: 2,
      borderColor: colors.cyanPrimary,
      ...shadows.cyanStrong,
    },
    boardSecondaryGlow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radii.xxl,
      borderWidth: 8,
      borderColor: colors.boardSecondaryGlow,
    },
    board: {
      flex: 1,
      borderRadius: radii.xxl,
      borderWidth: 2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.boardSurface,
      overflow: 'hidden',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    boardSweepLarge: {
      position: 'absolute',
      width: '188%',
      height: '188%',
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.boardSweepLarge,
      top: '-80%',
      left: '-42%',
    },
    boardSweepSmall: {
      position: 'absolute',
      width: '138%',
      height: '138%',
      borderRadius: 999,
      borderWidth: 1.2,
      borderColor: colors.boardSweepSmall,
      top: '-52%',
      left: '-16%',
    },
    gridOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    gridLineVertical: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 3,
      marginLeft: -1.5,
      backgroundColor: colors.boardGridLine,
    },
    gridLineHorizontal: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 3,
      marginTop: -1.5,
      backgroundColor: colors.boardGridLine,
    },
    statusRow: {
      marginTop: spacing.sm,
      alignItems: 'center',
    },
    statusRowCompact: {
      marginTop: spacing.sm - 2,
    },
    statusRowTight: {
      marginTop: 4,
    },
    statusText: {
      color: colors.cyanPrimary,
      letterSpacing: typography.tracking.wide,
      textShadowColor: hexToRgba(colors.cyanGlow, 0.45),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      fontFamily: typography.family.black,
    },
    bottomActionRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.sm + 2,
    },
    bottomActionRowCompact: {
      marginTop: spacing.sm - 2,
    },
    bottomActionRowTight: {
      marginTop: 4,
    },
    bannerDock: {
      paddingHorizontal: spacing.xs,
      backgroundColor: 'transparent',
    },
    replayBtn: {
      width: 94,
      height: 94,
      borderRadius: radii.xl - 2,
      borderWidth: 2,
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    replayBtnPressed: {
      opacity: 0.86,
      transform: [{ scale: 0.97 }],
    },
    replayIcon: {
      textShadowColor: 'transparent',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 0,
    },
    adWrap: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: Platform.OS === 'ios' ? 0 : 4,
    },
  });

export default GameScreen;

