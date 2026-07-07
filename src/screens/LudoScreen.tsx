import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Easing,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND_IMG = require('../assets/images/bgr_2.png');
const PVAI_IMG = require('../assets/images/Ludo_VS_AI.jpeg');
const PVP_IMG = require('../assets/images/PvAI.jpeg');
const PLAYERS_2_IMG = require('../assets/images/2players.jpeg');
const PLAYERS_3_IMG = require('../assets/images/3players.jpeg');
const PLAYERS_4_IMG = require('../assets/images/4players.jpeg');
const TOKEN_RED_IMG = require('../assets/images/Red_Ludo_token.jpeg');
const TOKEN_GREEN_IMG = require('../assets/images/green_Ludo.jpeg');
const TOKEN_YELLOW_IMG = require('../assets/images/yellow_Ludo_token.jpeg');
const TOKEN_BLUE_IMG = require('../assets/images/blue.jpeg');

const getTokenImage = (colorKey: string) => {
  switch (colorKey) {
    case 'RED': return TOKEN_RED_IMG;
    case 'GREEN': return TOKEN_GREEN_IMG;
    case 'YELLOW': return TOKEN_YELLOW_IMG;
    case 'BLUE': return TOKEN_BLUE_IMG;
    default: return TOKEN_RED_IMG;
  }
};

import AdBanner from '../components/AdBanner';
import { useTheme } from '../theme/ThemeContext';
import { radii, spacing, typography } from '../theme/tokens';
import { getContentWidth, scaleSize } from '../theme/responsive';
import { useGameSounds } from '../hooks/useGameSounds';
import { useAdMob } from '../hooks/useAdMob';
import {
  LUDO_HOME_RUNS,
  LUDO_HOMES,
  LUDO_TRACK,
  LUDO_YARDS,
  SAFE_ZONES,
  LudoCoord,
} from '../utils/ludoCoordinates';
import {
  getLudoStats,
  recordLudoGame,
  resetLudoStats,
  LudoStats,
} from '../services/ludoStats';

type LudoPlayer = 'P1' | 'P2' | 'P3' | 'P4';
type LudoColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

interface TokenState {
  id: number;
  status: 'YARD' | 'PATH' | 'HOME_RUN' | 'FINISHED';
  stepCount: number;
}

const INITIAL_TOKENS = (): TokenState[] => [
  { id: 0, status: 'YARD', stepCount: 0 },
  { id: 1, status: 'YARD', stepCount: 0 },
  { id: 2, status: 'YARD', stepCount: 0 },
  { id: 3, status: 'YARD', stepCount: 0 },
];

const COLOR_START_INDICES: Record<LudoColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

interface LudoDiceProps {
  value: number | null;
  rolling: boolean;
  color: string;
}

const LudoDice = ({ value, rolling, color }: LudoDiceProps) => {
  const [displayVal, setDisplayVal] = useState(6);

  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setDisplayVal(Math.floor(Math.random() * 6) + 1);
      }, 80);
      return () => clearInterval(interval);
    } else {
      setDisplayVal(value || 6);
    }
  }, [rolling, value]);

  const dotsForValue = (val: number): number[] => {
    switch (val) {
      case 1:
        return [4];
      case 2:
        return [0, 8];
      case 3:
        return [0, 4, 8];
      case 4:
        return [0, 2, 6, 8];
      case 5:
        return [0, 2, 4, 6, 8];
      case 6:
        return [0, 2, 3, 5, 6, 8];
      default:
        return [0, 2, 4, 6, 8];
    }
  };

  const activeDots = dotsForValue(displayVal);

  return (
    <View style={[diceStyles.diceContainer, { borderColor: color, shadowColor: color }]}>
      <View style={diceStyles.diceGrid}>
        {Array.from({ length: 9 }).map((_, idx) => {
          const hasDot = activeDots.includes(idx);
          return (
            <View key={`dot-${idx}`} style={diceStyles.gridCell}>
              {hasDot && <View style={[diceStyles.dot, { backgroundColor: color }]} />}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const diceStyles = StyleSheet.create({
  diceContainer: {
    width: 36,
    height: 36,
    borderRadius: 7,
    borderWidth: 2.2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  diceGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '33.33%',
    height: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});

const LudoScreen = ({
  onGoHome,
  adsReady,
  soundEnabled,
  vibrationEnabled,
}: {
  onGoHome: () => void;
  adsReady: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}) => {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const contentWidth = getContentWidth(width, 16, 560);
  const rawBoardSize = Math.min(contentWidth - 16, height * 0.52);
  const boardSize = Math.floor(rawBoardSize / 15) * 16;
  const boardPadding = 0;
  const cellSize = boardSize / 15;

  const { playSound } = useGameSounds(soundEnabled);
  const { showInterstitial } = useAdMob(adsReady, false);

  // States
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1); // 1: Mode Selection, 2: Setup Players, 3: Active Gameplay
  const [mode, setMode] = useState<'AI' | 'PVP'>('AI');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [p1Color, setP1Color] = useState<LudoColor>('RED');

  // Multi-player token states
  const [p1Tokens, setP1Tokens] = useState<TokenState[]>(() => INITIAL_TOKENS());
  const [p2Tokens, setP2Tokens] = useState<TokenState[]>(() => INITIAL_TOKENS());
  const [p3Tokens, setP3Tokens] = useState<TokenState[]>(() => INITIAL_TOKENS());
  const [p4Tokens, setP4Tokens] = useState<TokenState[]>(() => INITIAL_TOKENS());

  const p1TokensRef = useRef(p1Tokens);
  const p2TokensRef = useRef(p2Tokens);
  const p3TokensRef = useRef(p3Tokens);
  const p4TokensRef = useRef(p4Tokens);

  useEffect(() => { p1TokensRef.current = p1Tokens; }, [p1Tokens]);
  useEffect(() => { p2TokensRef.current = p2Tokens; }, [p2Tokens]);
  useEffect(() => { p3TokensRef.current = p3Tokens; }, [p3Tokens]);
  useEffect(() => { p4TokensRef.current = p4Tokens; }, [p4Tokens]);

  const [currentTurn, setCurrentTurn] = useState<LudoPlayer>('P1');
  const currentTurnRef = useRef(currentTurn);
  useEffect(() => { currentTurnRef.current = currentTurn; }, [currentTurn]);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [animatingMove, setAnimatingMove] = useState(false);
  const [winner, setWinner] = useState<LudoPlayer | null>(null);

  // Stats modals and popups
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats, setStats] = useState<LudoStats | null>(null);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);

  // Dice animations
  const diceScale = useRef(new Animated.Value(1)).current;
  const diceRotate = useRef(new Animated.Value(0)).current;
  const diceRotateToggle = useRef(false);
  const isMovingRef = useRef(false);

  // Pulse animation for active tokens
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.94, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(ringRotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim, ringRotateAnim]);

  // Blast animation states for victory/capture on board
  const [blastVisible, setBlastVisible] = useState(false);
  const [blastPosition, setBlastPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [blastPlayerColor, setBlastPlayerColor] = useState<string>('#ffffff');
  const blastAnims = useRef(
    Array.from({ length: 12 }).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
      emoji: '🎉',
    }))
  ).current;

  const triggerBlast = useCallback((x: number, y: number, emojisList: string[], hexColor: string) => {
    // Calculate cell center relative to the board
    const leftPos = boardPadding + x * cellSize + cellSize / 2;
    const topPos = boardPadding + y * cellSize + cellSize / 2;

    setBlastPosition({ left: leftPos, top: topPos });
    setBlastPlayerColor(hexColor);
    setBlastVisible(true);

    const animations = blastAnims.map((particle, idx) => {
      particle.emoji = emojisList[Math.floor(Math.random() * emojisList.length)];
      particle.x.setValue(0);
      particle.y.setValue(0);
      particle.scale.setValue(0);
      particle.opacity.setValue(1);

      const angle = (idx * (360 / blastAnims.length) * Math.PI) / 180;
      const distance = 45 + Math.random() * 40;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      return Animated.parallel([
        Animated.timing(particle.x, {
          toValue: targetX,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: targetY,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1.4 + Math.random() * 0.6,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0.6,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      setBlastVisible(false);
    });
  }, [blastAnims, cellSize, boardPadding]);

  // Track finished players to prevent double ad triggers
  const adClearedPlayers = useRef<Record<LudoPlayer, boolean>>({
    P1: false,
    P2: false,
    P3: false,
    P4: false,
  });

  // Calculate other player colors dynamically based on P1 choice
  const p2Color = useMemo<LudoColor>(() => {
    const list: LudoColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const idx = list.indexOf(p1Color);
    return list[(idx + 1) % 4];
  }, [p1Color]);

  const p3Color = useMemo<LudoColor>(() => {
    const list: LudoColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const idx = list.indexOf(p1Color);
    return list[(idx + 2) % 4];
  }, [p1Color]);

  const p4Color = useMemo<LudoColor>(() => {
    const list: LudoColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const idx = list.indexOf(p1Color);
    return list[(idx + 3) % 4];
  }, [p1Color]);

  const getPlayerColorName = (p: LudoPlayer): LudoColor => {
    if (p === 'P1') return p1Color;
    if (p === 'P2') return p2Color;
    if (p === 'P3') return p3Color;
    return p4Color;
  };

  const getPlayerByColor = useCallback((color: LudoColor): LudoPlayer => {
    if (p1Color === color) return 'P1';
    if (p2Color === color) return 'P2';
    if (p3Color === color) return 'P3';
    return 'P4';
  }, [p1Color, p2Color, p3Color, p4Color]);

  const activePlayers = useMemo<LudoPlayer[]>(() => {
    return (['P1', 'P2', 'P3', 'P4'] as LudoPlayer[]).slice(0, playerCount);
  }, [playerCount]);

  // Load Ludo career stats
  useEffect(() => {
    getLudoStats().then(setStats).catch(() => { });
  }, []);

  // Back button interception
  useEffect(() => {
    const backAction = () => {
      if (setupStep === 2) {
        setSetupStep(1);
        playSound('tap');
        return true;
      }
      if (setupStep === 3) {
        setExitConfirmVisible(true);
        playSound('tap');
        return true;
      }
      return false; // let default back action handle (go back to selection)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [setupStep, playSound]);

  const handleStartGame = () => {
    setP1Tokens(INITIAL_TOKENS());
    setP2Tokens(INITIAL_TOKENS());
    setP3Tokens(INITIAL_TOKENS());
    setP4Tokens(INITIAL_TOKENS());
    setCurrentTurn('P1');
    setDiceValue(null);
    setRolling(false);
    setAnimatingMove(false);
    setWinner(null);
    setSetupStep(3);
    adClearedPlayers.current = { P1: false, P2: false, P3: false, P4: false };
    playSound('tap');
  };

  const mapColorCoord = useCallback((c: LudoColor): LudoColor => {
    switch (c) {
      case 'RED': return 'BLUE';
      case 'GREEN': return 'RED';
      case 'YELLOW': return 'GREEN';
      case 'BLUE': return 'YELLOW';
    }
  }, []);

  // Convert token state to coordinates on the 15x15 board
  const getTokenCoordinate = useCallback((player: LudoPlayer, token: TokenState): LudoCoord => {
    const rawColor = getPlayerColorName(player);
    const color = mapColorCoord(rawColor);
    if (token.status === 'FINISHED') {
      return LUDO_HOMES[color];
    }
    if (token.status === 'YARD') {
      return LUDO_YARDS[color][token.id];
    }
    if (token.status === 'HOME_RUN') {
      return LUDO_HOME_RUNS[color][token.stepCount - 51];
    }
    // Path coordinate
    const startIdx = COLOR_START_INDICES[color];
    const globalIdx = (token.stepCount + startIdx) % 52;
    return LUDO_TRACK[globalIdx];
  }, [p1Color, p2Color, p3Color, p4Color, mapColorCoord]);

  // Calculate layout details for token stacks (multiple tokens on same coordinate)
  const getStackedTokenLayout = useCallback((player: LudoPlayer, token: TokenState) => {
    if (token.status === 'YARD' || token.status === 'FINISHED') {
      return { offsetLeft: 0, offsetTop: 0, scale: 1 };
    }

    const coord = getTokenCoordinate(player, token);
    const activeTokens: { player: LudoPlayer; id: number }[] = [];

    const collectTokens = (p: LudoPlayer, tokensList: TokenState[]) => {
      tokensList.forEach(t => {
        if (t.status !== 'YARD' && t.status !== 'FINISHED') {
          const c = getTokenCoordinate(p, t);
          if (c.x === coord.x && c.y === coord.y) {
            activeTokens.push({ player: p, id: t.id });
          }
        }
      });
    };

    collectTokens('P1', p1Tokens);
    collectTokens('P2', p2Tokens);
    if (playerCount >= 3) collectTokens('P3', p3Tokens);
    if (playerCount >= 4) collectTokens('P4', p4Tokens);

    const matchIdx = activeTokens.findIndex(item => item.player === player && item.id === token.id);
    const total = activeTokens.length;

    if (total <= 1 || matchIdx === -1) {
      return { offsetLeft: 0, offsetTop: 0, scale: 1 };
    }

    // Stack configuration
    if (total === 2) {
      const offset = cellSize * 0.15;
      return {
        offsetLeft: matchIdx === 0 ? -offset : offset,
        offsetTop: 0,
        scale: 0.68,
      };
    } else {
      const offset = cellSize * 0.16;
      const xOffset = matchIdx === 0 || matchIdx === 2 ? -offset : offset;
      const yOffset = matchIdx === 0 || matchIdx === 1 ? -offset : offset;
      return {
        offsetLeft: xOffset,
        offsetTop: yOffset,
        scale: 0.54,
      };
    }
  }, [p1Tokens, p2Tokens, p3Tokens, p4Tokens, playerCount, getTokenCoordinate, cellSize]);

  const canMoveToken = (player: LudoPlayer, token: TokenState, roll: number): boolean => {
    if (token.status === 'FINISHED') return false;
    if (token.status === 'YARD') {
      return roll === 6;
    }
    return token.stepCount + roll <= 56;
  };

  const hasValidMoves = (player: LudoPlayer, tokens: TokenState[], roll: number): boolean => {
    return tokens.some(t => canMoveToken(player, t, roll));
  };

  // Skip or advance turn
  const advanceTurn = useCallback(() => {
    setCurrentTurn(prevTurn => {
      const idx = activePlayers.indexOf(prevTurn);
      let nextIdx = (idx + 1) % playerCount;

      // Skip completed players
      for (let i = 0; i < playerCount; i++) {
        const candidate = activePlayers[nextIdx];
        const candidateTokens =
          candidate === 'P1'
            ? p1TokensRef.current
            : candidate === 'P2'
              ? p2TokensRef.current
              : candidate === 'P3'
                ? p3TokensRef.current
                : p4TokensRef.current;

        const isFinished = candidateTokens.every(t => t.status === 'FINISHED');
        if (!isFinished) {
          return candidate;
        }
        nextIdx = (nextIdx + 1) % playerCount;
      }
      return 'P1';
    });
    setDiceValue(null);
  }, [playerCount, activePlayers]);

  // Execute Ludo Token movement
  const makeMove = async (player: LudoPlayer, tokenId: number, roll: number) => {
    if (isMovingRef.current) return;
    isMovingRef.current = true;
    setAnimatingMove(true);

    try {
      const setTokens =
        player === 'P1'
          ? setP1Tokens
          : player === 'P2'
            ? setP2Tokens
            : player === 'P3'
              ? setP3Tokens
              : setP4Tokens;

      const tokensRef =
        player === 'P1'
          ? p1TokensRef
          : player === 'P2'
            ? p2TokensRef
            : player === 'P3'
              ? p3TokensRef
              : p4TokensRef;

      const targetToken = tokensRef.current.find(t => t.id === tokenId);
      if (!targetToken) {
        return;
      }

      const isExitingYard = targetToken.status === 'YARD';
      let nextStep = 0;
      let nextStatus: TokenState['status'] = 'PATH';
      let extraTurnEarned = false;

      if (isExitingYard) {
        nextStep = 0;
        nextStatus = 'PATH';
        playSound('move');
        if (vibrationEnabled) {
          import('react-native').then(({ Vibration }) => Vibration.vibrate(20));
        }
        setTokens(prev =>
          prev.map(t =>
            t.id === tokenId
              ? { ...t, stepCount: 0, status: 'PATH' }
              : t
          )
        );
        await new Promise<void>(resolve => setTimeout(() => resolve(), 220));
      } else {
        const startStep = targetToken.stepCount;
        const targetStep = startStep + roll;

        for (let s = startStep + 1; s <= targetStep; s++) {
          nextStep = s;
          nextStatus = s === 56 ? 'FINISHED' : s >= 51 ? 'HOME_RUN' : 'PATH';

          setTokens(prev =>
            prev.map(t =>
              t.id === tokenId
                ? { ...t, stepCount: s, status: nextStatus }
                : t
            )
          );

          playSound('move');
          if (vibrationEnabled) {
            import('react-native').then(({ Vibration }) => Vibration.vibrate(20));
          }

          // Wait 180ms between steps for visual walking animation
          await new Promise<void>(resolve => setTimeout(() => resolve(), 180));
        }
      }

      if (nextStatus === 'FINISHED') {
        playSound('win');
        extraTurnEarned = true;
        triggerBlast(7.5, 7.5, ['🎉', '🏆', '⭐', '✨', '🔥', '👑', '🥳', '💥'], ludoColors[getPlayerColorName(player)]);
        await new Promise<void>(resolve => setTimeout(() => resolve(), 850));
      }

      // Handle token capture collision logic
      if (nextStatus === 'PATH') {
        const color = mapColorCoord(getPlayerColorName(player));
        const startIdx = COLOR_START_INDICES[color];
        const globalIdx = (nextStep + startIdx) % 52;

        // Safe cells have no capture conflict
        if (!SAFE_ZONES.includes(globalIdx)) {
          const finalCoord = LUDO_TRACK[globalIdx];
          const otherPlayers = (['P1', 'P2', 'P3', 'P4'] as LudoPlayer[]).filter(
            p => p !== player && activePlayers.includes(p)
          );

          let captured = false;
          for (const op of otherPlayers) {
            const opTokensRef =
              op === 'P1'
                ? p1TokensRef
                : op === 'P2'
                  ? p2TokensRef
                  : op === 'P3'
                    ? p3TokensRef
                    : p4TokensRef;

            const opSetTokens =
              op === 'P1'
                ? setP1Tokens
                : op === 'P2'
                  ? setP2Tokens
                  : op === 'P3'
                    ? setP3Tokens
                    : setP4Tokens;

            const conflictIdx = opTokensRef.current.findIndex(ot => {
              const oc = getTokenCoordinate(op, ot);
              return oc.x === finalCoord.x && oc.y === finalCoord.y && ot.status === 'PATH';
            });

            if (conflictIdx !== -1) {
              const targetOpToken = opTokensRef.current[conflictIdx];
              const startStep = targetOpToken.stepCount;

              // Re-send to yard with backward step walk!
              playSound('ludo_eat');
              if (vibrationEnabled) {
                import('react-native').then(({ Vibration }) => Vibration.vibrate([0, 80, 50, 80]));
              }

              // Capture emoji blast at the conflict coordinates!
              triggerBlast(finalCoord.x, finalCoord.y, ['💥', '😭', '💀', '💨', '💔'], '#ff3333');

              // Animate backward cell-by-cell at high speed (45ms per step)
              for (let s = startStep - 1; s >= 0; s--) {
                opSetTokens(prev =>
                  prev.map((ot, idx) =>
                    idx === conflictIdx
                      ? { ...ot, stepCount: s }
                      : ot
                  )
                );
                playSound('move');
                await new Promise<void>(res => setTimeout(res, 45));
              }

              // Finally, place back in YARD
              opSetTokens(prev =>
                prev.map((ot, idx) =>
                  idx === conflictIdx
                    ? { ...ot, status: 'YARD', stepCount: 0 }
                    : ot
                )
              );
              captured = true;
              extraTurnEarned = true;
              break;
            }
          }
        }
      }

      // Verify if player has cleared all tokens
      const currentTokens =
        player === 'P1'
          ? p1TokensRef.current
          : player === 'P2'
            ? p2TokensRef.current
            : player === 'P3'
              ? p3TokensRef.current
              : p4TokensRef.current;

      const clearedAll = currentTokens.every(t => t.status === 'FINISHED');
      if (clearedAll) {
        setWinner(player);
        playSound('xwin');

        // Massive firework blast sequence on victory!
        const playerHexColor = ludoColors[getPlayerColorName(player)];
        triggerBlast(7.5, 7.5, ['👑', '🏆', '🎉', '🌟', '🥳', '🔥', '👑', '🏆'], playerHexColor);
        // Multi-blast celebration fireworks!
        setTimeout(() => triggerBlast(3, 3, ['🎉', '✨', '🌟'], playerHexColor), 200);
        setTimeout(() => triggerBlast(12, 3, ['🎉', '✨', '🌟'], playerHexColor), 400);
        setTimeout(() => triggerBlast(3, 12, ['🎉', '✨', '🌟'], playerHexColor), 600);
        setTimeout(() => triggerBlast(12, 12, ['🎉', '✨', '🌟'], playerHexColor), 800);

        // Save stats
        recordLudoGame(
          mode === 'AI',
          getPlayerColorName(player).toLowerCase() as any,
          getPlayerColorName('P1').toLowerCase() as any
        )
          .then(setStats)
          .catch(() => { });
        return;
      }

      // Check if player cleared all goti in > 2 players game for ad clearance trigger
      if (playerCount > 2 && clearedAll && !adClearedPlayers.current[player]) {
        adClearedPlayers.current[player] = true;
        showInterstitial();
      }

      // Alternating turns (Roll 6 gets extra turn)
      if (roll === 6 || extraTurnEarned) {
        setDiceValue(null);
      } else {
        advanceTurn();
      }
    } catch (error) {
      import('../utils/logger').then(({ warn }) => warn('Ludo makeMove Error: ', error));
    } finally {
      setAnimatingMove(false);
      isMovingRef.current = false;
    }
  };

  const handleRollDice = () => {
    if (rolling || diceValue !== null || winner || animatingMove) return;
    playSound('dice');

    setRolling(true);

    const nextVal = diceRotateToggle.current ? 0 : 1;
    diceRotateToggle.current = !diceRotateToggle.current;

    Animated.parallel([
      Animated.sequence([
        Animated.timing(diceScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.timing(diceScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.timing(diceRotate, {
        toValue: nextVal,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      setRolling(false);

      // Verify valid moves for active player from currentTurnRef to prevent closure issues
      const activeTurn = currentTurnRef.current;
      const activeTokens =
        activeTurn === 'P1'
          ? p1TokensRef.current
          : activeTurn === 'P2'
            ? p2TokensRef.current
            : activeTurn === 'P3'
              ? p3TokensRef.current
              : p4TokensRef.current;

      if (!hasValidMoves(activeTurn, activeTokens, rolled)) {
        setTimeout(() => {
          advanceTurn();
        }, 1200);
      } else if (activeTurn === 'P1') {
        // If human player has only ONE eligible move, auto-execute it!
        const eligibleMoves = activeTokens.filter(t => canMoveToken('P1', t, rolled));
        if (eligibleMoves.length === 1) {
          setTimeout(() => {
            makeMove('P1', eligibleMoves[0].id, rolled);
          }, 800);
        }
      }
    });
  };

  // Bots Behavior - Auto Roll
  useEffect(() => {
    if (winner || rolling || diceValue !== null || animatingMove || setupStep !== 3) return;

    const isBot = mode === 'AI' && currentTurn !== 'P1';
    if (isBot) {
      const timer = setTimeout(() => {
        handleRollDice();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, mode, winner, rolling, diceValue, animatingMove, setupStep]);

  // Bots Behavior - Auto Move Choice
  useEffect(() => {
    if (winner || rolling || diceValue === null || animatingMove || setupStep !== 3) return;

    const isBot = mode === 'AI' && currentTurn !== 'P1';
    if (isBot) {
      const timer = setTimeout(() => {
        const tokensRef =
          currentTurn === 'P2'
            ? p2TokensRef
            : currentTurn === 'P3'
              ? p3TokensRef
              : p4TokensRef;

        const tokens = tokensRef.current;
        const moves = tokens.filter(t => canMoveToken(currentTurn, t, diceValue)).map(t => t.id);

        if (moves.length > 0) {
          // AI choosing strategy:
          // 1. Prefer capturing opponent
          let chosenTokenId = moves[0];
          let maxWeight = -1;

          moves.forEach(tid => {
            const token = tokens[tid];
            let weight = 0;

            const nextStep = token.status === 'YARD' ? 0 : token.stepCount + diceValue;
            const nextStatus: TokenState['status'] =
              token.status === 'YARD'
                ? 'PATH'
                : nextStep === 56
                  ? 'FINISHED'
                  : nextStep >= 51
                    ? 'HOME_RUN'
                    : 'PATH';

            // Reaching home has high priority
            if (nextStatus === 'FINISHED') {
              weight += 100;
            }

            // Capturing opponent has top priority
            if (nextStatus === 'PATH') {
              const tempToken: TokenState = { ...token, stepCount: nextStep, status: nextStatus };
              const targetCoord = getTokenCoordinate(currentTurn, tempToken);
              const color = mapColorCoord(getPlayerColorName(currentTurn));
              const startIdx = COLOR_START_INDICES[color];
              const globalIdx = (nextStep + startIdx) % 52;

              if (!SAFE_ZONES.includes(globalIdx)) {
                // Check if we overlap an opponent
                const otherPlayers = (['P1', 'P2', 'P3', 'P4'] as LudoPlayer[]).filter(
                  p => p !== currentTurn && activePlayers.includes(p)
                );

                otherPlayers.forEach(op => {
                  const opTokensRef =
                    op === 'P1'
                      ? p1TokensRef
                      : op === 'P2'
                        ? p2TokensRef
                        : op === 'P3'
                          ? p3TokensRef
                          : p4TokensRef;

                  const conflict = opTokensRef.current.some(rt => {
                    const rc = getTokenCoordinate(op, rt);
                    return rc.x === targetCoord.x && rc.y === targetCoord.y && rt.status === 'PATH';
                  });
                  if (conflict) {
                    weight += 500; // top weight
                  }
                });
              }
            }

            // Exiting yard has priority
            if (token.status === 'YARD' && diceValue === 6) {
              weight += 50;
            }

            // Furthest along track
            weight += token.stepCount;

            if (weight > maxWeight) {
              maxWeight = weight;
              chosenTokenId = tid;
            }
          });

          makeMove(currentTurn, chosenTokenId, diceValue);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, mode, winner, rolling, diceValue, animatingMove, setupStep, activePlayers]);

  const ludoColors = {
    RED: '#d91b2c', // Neon Red
    RED_BG: 'rgba(217, 27, 44, 0.1)',
    GREEN: '#00cc44', // Neon Green
    GREEN_BG: 'rgba(0, 204, 68, 0.1)',
    YELLOW: '#ffcc00', // Neon Yellow
    YELLOW_BG: 'rgba(255, 204, 0, 0.1)',
    BLUE: '#0088ff', // Neon Blue
    BLUE_BG: 'rgba(0, 136, 255, 0.1)',
  };

  const getThemeTokenColor = (colorName: LudoColor) => {
    switch (colorName) {
      case 'RED': return '#9b111e'; // Dark Ruby Red
      case 'GREEN': return '#1e4620'; // Dark Forest Green
      case 'YELLOW': return '#c5a000'; // Dark Amber
      case 'BLUE': return '#004080'; // Dark Sapphire Blue
    }
  };

  const handleResetGame = () => {
    handleStartGame();
    setExitConfirmVisible(false);
  };

  // Render individual Ludo board cells
  const renderCell = (x: number, y: number) => {
    let isSafe = false;
    let isBaseCell = false;

    // Check base center cells
    if (x >= 6 && x <= 8 && y >= 6 && y <= 8) return null; // handled by center triangle

    // Check base yards
    if ((x < 6 && y < 6) || (x > 8 && y < 6) || (x > 8 && y > 8) || (x < 6 && y > 8)) {
      isBaseCell = true;
    }

    // Check global safe zones
    LUDO_TRACK.forEach((coord, idx) => {
      if (coord.x === x && coord.y === y && SAFE_ZONES.includes(idx)) {
        isSafe = true;
      }
    });

    if (isBaseCell) return null;

    let cellColor = 'transparent';
    let cellBorderColor = 'rgba(255, 255, 255, 0.05)';

    // Safe stars and tracks
    if (isSafe) {
      cellBorderColor = 'rgba(0, 245, 255, 0.2)';
    }

    return (
      <View
        key={`cell-${x}-${y}`}
        style={[
          styles.cell,
          {
            left: boardPadding + x * cellSize,
            top: boardPadding + y * cellSize,
            width: cellSize,
            height: cellSize,
            backgroundColor: cellColor,
            borderColor: cellBorderColor,
          },
        ]}
      >
        {isSafe && <Icon name="star" size={cellSize * 0.45} color={colors.cyanPrimary} style={{ opacity: 0.6 }} />}
      </View>
    );
  };

  // Player Corner Panels layout surrounding Ludo Board
  const renderPlayerPanelBox = (p: LudoPlayer, align: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    const isActive = activePlayers.includes(p);
    if (!isActive) {
      return <View style={{ width: 80, height: 50 }} />;
    }

    const isCurrent = currentTurn === p;
    const color = getPlayerColorName(p);
    const playerHexColor = ludoColors[color];
    const isBot = mode === 'AI' && p !== 'P1';

    const renderOuterBox = () => (
      <View
        style={[
          styles.playerOuterBox,
          { borderColor: playerHexColor },
          isCurrent && {
            shadowColor: playerHexColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 4,
          },
        ]}
      >
        {isCurrent ? (
          <Animated.View
            style={{
              transform: [
                { scale: diceScale },
                {
                  rotate: diceRotate.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-18deg', '18deg'],
                  }),
                },
              ],
            }}
          >
            <Pressable
              onPress={handleRollDice}
              disabled={rolling || diceValue !== null || isBot || !!winner || animatingMove}
              style={({ pressed }) => [
                styles.cornerDiceBtn,
                pressed && styles.btnPressed,
                (rolling || diceValue !== null || isBot) && { opacity: 0.88 },
              ]}
              android_disableSound={true}
            >
              <LudoDice value={diceValue} rolling={rolling} color={playerHexColor} />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    );

    const renderStarBadge = () => (
      <View style={[styles.playerStarBadge, { borderColor: playerHexColor }]}>
        <Icon name="star" size={10} color={playerHexColor} />
      </View>
    );

    const renderIndicator = () => {
      if (!isCurrent || rolling || diceValue !== null || isBot) return null;
      const hand = align.endsWith('left') ? '👈' : '👉';
      return (
        <Text style={[styles.pointingHandEmoji, { color: playerHexColor }]}>
          {hand}
        </Text>
      );
    };

    const isLeft = align.endsWith('left');

    return (
      <View style={styles.playerPanelContainer}>
        {isLeft ? (
          <>
            {renderStarBadge()}
            {renderOuterBox()}
            {renderIndicator()}
          </>
        ) : (
          <>
            {renderIndicator()}
            {renderOuterBox()}
            {renderStarBadge()}
          </>
        )}
      </View>
    );
  };

  // Render empty yard placeholders for tokens so it doesn't look empty when tokens move
  const renderYardPlaceholders = () => {
    return activePlayers.map(p => {
      const rawColor = getPlayerColorName(p);
      const mappedColor = mapColorCoord(rawColor);
      const hexColor = ludoColors[rawColor];

      return LUDO_YARDS[mappedColor].map((coord, idx) => {
        const baseLeft = boardPadding + coord.x * cellSize + cellSize * 0.115;
        const baseTop = boardPadding + coord.y * cellSize + cellSize * 0.115;
        return (
          <View
            key={`placeholder-${p}-${idx}`}
            style={{
              position: 'absolute',
              width: cellSize * 0.70,
              height: cellSize * 0.70,
              borderRadius: (cellSize * 0.70) / 2,
              left: baseLeft,
              top: baseTop,
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderWidth: 1.5,
              borderColor: hexColor,
              zIndex: 1,
            }}
          />
        );
      });
    });
  };

  // Render tokens for a given player
  const renderPlayerTokens = (p: LudoPlayer, tokensList: TokenState[], colorKey: LudoColor) => {
    return tokensList.map(token => {
      const coord = getTokenCoordinate(p, token);
      const isMyTurn = currentTurn === p;
      const isHuman = mode === 'PVP' || p === 'P1';
      const eligible =
        isMyTurn &&
        isHuman &&
        diceValue !== null &&
        canMoveToken(p, token, diceValue) &&
        !rolling &&
        !animatingMove;

      const { offsetLeft, offsetTop, scale } = getStackedTokenLayout(p, token);
      const baseLeft = boardPadding + coord.x * cellSize + cellSize * 0.115;
      const baseTop = boardPadding + coord.y * cellSize + cellSize * 0.115;

      return (
        <Animated.View
          key={`${p}-token-${token.id}`}
          pointerEvents={eligible ? 'auto' : 'none'}
          style={[
            styles.token,
            {
              backgroundColor: getThemeTokenColor(colorKey),
              width: cellSize * 0.86,
              height: cellSize * 0.86,
              borderRadius: (cellSize * 0.86) / 2,
              left: baseLeft + offsetLeft,
              top: baseTop + offsetTop,
              zIndex: eligible ? 20 : (token.status === 'YARD' ? 1 : 2),
              transform: [{ scale: eligible ? Animated.multiply(scale, pulseAnim) : scale }],
            },
            eligible && styles.tokenActiveGlow,
            eligible && { shadowColor: ludoColors[getPlayerColorName(p)] }
          ]}
        >
          <Animated.View
            style={{
              position: 'absolute',
              width: '125%',
              height: '125%',
              borderRadius: 999,
              borderWidth: 2,
              borderColor: ludoColors[getPlayerColorName(p)],
              borderStyle: 'dashed',
              opacity: eligible ? 1 : 0,
              transform: [
                {
                  rotate: ringRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          />
          <Pressable
            onPress={() => eligible && makeMove(p, token.id, diceValue!)}
            disabled={!eligible}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            android_disableSound={true}
          >
            <Image
              source={getTokenImage(colorKey)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: (cellSize * 0.77) / 2,
              }}
              resizeMode="cover"
            />
          </Pressable>
        </Animated.View>
      );
    });
  };

  const renderBlast = () => {
    if (!blastVisible) return null;
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: blastPosition.left,
          top: blastPosition.top,
          width: 0,
          height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99,
        }}
      >
        {blastAnims.map((p, idx) => (
          <Animated.View
            key={`blast-${idx}`}
            style={{
              position: 'absolute',
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
              opacity: p.opacity,
            }}
          >
            <Text style={{
              fontSize: 28,
              textShadowColor: blastPlayerColor,
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 6
            }}>{p.emoji}</Text>
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundBase} translucent={false} hidden={false} />

      <View style={styles.container}>
        <ImageBackground source={BACKGROUND_IMG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.midGlow} />

        {/* SETUP SCREEN 1: Game Mode Select */}
        {setupStep === 1 && (
          <View style={styles.setupScreen}>
            {/* Header Row */}
            <View style={[styles.headerRow, { width: contentWidth, justifyContent: 'flex-start' }]}>
              <Pressable
                onPress={() => {
                  playSound('tap');
                  onGoHome();
                }}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                android_disableSound={true}
              >
                <Icon name="arrow-back" size={18} color={colors.cyanBright} />
              </Pressable>
              <View style={[styles.headerCenter, { marginLeft: spacing.md, alignItems: 'flex-start' }]}>
                <Text style={styles.headerTitle}>LUDO MATCH</Text>
                <Text style={styles.headerSubtitle}>SELECT MODE</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.setupScroll} bounces={false}>
              <View style={[styles.lobbyContent, { width: contentWidth, flex: 1, justifyContent: 'center' }]}>
                <View style={styles.lobbyCard}>
                  <Text style={styles.lobbyTitle}>LUDO CHAMPION</Text>
                  <Text style={styles.lobbySubtitle}>Roll the dice and race tokens to victory.</Text>

                  <Pressable
                    onPress={() => {
                      setMode('AI');
                      setSetupStep(2);
                      playSound('tap');
                    }}
                    style={({ pressed }) => [styles.modeOptionBtn, pressed && styles.btnPressed]}
                    android_disableSound={true}
                  >
                    <Image source={PVAI_IMG} style={styles.modeImage} />
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionTitle, { color: colors.pinkPrimary }]}>VS BOT (AI)</Text>
                      <Text style={styles.optionDesc}>Play against smart bots. Single player.</Text>
                    </View>
                    <Icon name="chevron-forward" size={18} color={colors.pinkPrimary} />
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setMode('PVP');
                      setSetupStep(2);
                      playSound('tap');
                    }}
                    style={({ pressed }) => [styles.modeOptionBtn, { marginTop: 18 }, pressed && styles.btnPressed]}
                    android_disableSound={true}
                  >
                    <Image source={PVP_IMG} style={styles.modeImage} />
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionTitle, { color: colors.cyanPrimary }]}>LOCAL P2P</Text>
                      <Text style={styles.optionDesc}>Play with friends on the same screen.</Text>
                    </View>
                    <Icon name="chevron-forward" size={18} color={colors.cyanPrimary} />
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      playSound('tap');
                      setShowStatsModal(true);
                    }}
                    style={({ pressed }) => [styles.lobbyStatsBtn, pressed && styles.btnPressed]}
                    android_disableSound={true}
                  >
                    <Icon name="trophy-outline" size={16} color={colors.warning} />
                    <Text style={styles.lobbyStatsText}>VIEW CAREER STATS</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {/* SETUP SCREEN 2: Players Count and Color selection */}
        {setupStep === 2 && (
          <View style={styles.setupScreen}>
            {/* Header Row */}
            <View style={[styles.headerRow, { width: contentWidth, justifyContent: 'flex-start' }]}>
              <Pressable
                onPress={() => {
                  playSound('tap');
                  setSetupStep(1);
                }}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                android_disableSound={true}
              >
                <Icon name="arrow-back" size={18} color={colors.cyanBright} />
              </Pressable>
              <View style={[styles.headerCenter, { marginLeft: spacing.md, alignItems: 'flex-start' }]}>
                <Text style={styles.headerTitle}>LUDO MATCH</Text>
                <Text style={styles.headerSubtitle}>GAME SETTINGS</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.setupScroll} bounces={false}>
              <View style={[styles.lobbyContent, { width: contentWidth, flex: 1, justifyContent: 'center' }]}>
                <View style={styles.lobbyCard}>
                  <Text style={styles.lobbyTitle}>GAME SETTINGS</Text>

                  {/* SELECT PLAYERS COUNT */}
                  <Text style={styles.lobbySectionTitle}>PLAYERS COUNT</Text>
                  <View style={styles.countSelectionRow}>
                    {([2, 3, 4] as const).map(countOpt => {
                      const isSelected = playerCount === countOpt;
                      const countImg = countOpt === 2 ? PLAYERS_2_IMG : countOpt === 3 ? PLAYERS_3_IMG : PLAYERS_4_IMG;
                      return (
                        <Pressable
                          key={`count-${countOpt}`}
                          onPress={() => {
                            setPlayerCount(countOpt);
                            playSound('tap');
                          }}
                          style={[
                            styles.countTab,
                            { padding: 0, overflow: 'hidden' },
                            isSelected && {
                              borderColor: colors.cyanPrimary,
                              backgroundColor: 'rgba(0, 245, 255, 0.08)',
                              borderWidth: 2,
                            },
                          ]}
                          android_disableSound={true}
                        >
                          <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={countImg} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
                          </View>
                          {isSelected && (
                            <View style={{ position: 'absolute', backgroundColor: 'rgba(0,245,255,0.1)', width: '100%', height: '100%' }} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* CHOOSE COLOR */}
                  <Text style={[styles.lobbySectionTitle, { marginTop: 18 }]}>SELECT YOUR COLOR</Text>
                  <View style={styles.colorSelectorRow}>
                    {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as const).map(colorOpt => {
                      const isSelected = p1Color === colorOpt;
                      const optColor = ludoColors[colorOpt];
                      return (
                        <Pressable
                          key={`p1-opt-${colorOpt}`}
                          onPress={() => {
                            setP1Color(colorOpt);
                            playSound('tap');
                          }}
                          style={[
                            styles.colorOrb,
                            { padding: 0, overflow: 'hidden' },
                            isSelected && [styles.colorOrbActive, { borderColor: colors.textPrimary, borderWidth: 2 }],
                          ]}
                          android_disableSound={true}
                        >
                          <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={getTokenImage(colorOpt)} style={{ width: '100%', height: '100%', borderRadius: 19 }} resizeMode="cover" />
                          </View>
                          {isSelected && (
                            <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.4)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon name="checkmark" size={16} color="#FFF" />
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* PLAY ACTION BUTTON */}
                  <Pressable
                    onPress={handleStartGame}
                    style={({ pressed }) => [styles.playBtn, pressed && styles.btnPressed]}
                    android_disableSound={true}
                  >
                    <Text style={styles.playBtnText}>START MATCH</Text>
                    <Icon name="play" size={16} color={colors.backgroundBase} />
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {/* SETUP SCREEN 3: Active Gameplay */}
        {setupStep === 3 && (
          <View style={styles.setupScreen}>
            {/* Header Row */}
            <View style={[styles.headerRow, { width: contentWidth, height: 50, alignItems: 'center' }]}>
              <View style={styles.headerLeft}>
                <Pressable
                  onPress={() => {
                    playSound('tap');
                    setExitConfirmVisible(true);
                  }}
                  style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                  android_disableSound={true}
                >
                  <Icon name="arrow-back-outline" size={22} color="#ffffff" />
                </Pressable>
              </View>

              <View style={styles.headerCenter}>
                {(() => {
                  const getHomedCount = (p: LudoPlayer) => {
                    const tokens =
                      p === 'P1'
                        ? p1TokensRef.current
                        : p === 'P2'
                          ? p2TokensRef.current
                          : p === 'P3'
                            ? p3TokensRef.current
                            : p4TokensRef.current;
                    return tokens.filter(t => t.status === 'FINISHED').length;
                  };

                  return (
                    <Text style={styles.headerScoreText}>
                      {activePlayers.map((p, index) => (
                        <React.Fragment key={`header-score-${p}`}>
                          {index > 0 && <Text style={{ color: 'rgba(255, 255, 255, 0.4)' }}>:</Text>}
                          <Text style={{ color: ludoColors[getPlayerColorName(p)] }}>
                            {getHomedCount(p)}
                          </Text>
                        </React.Fragment>
                      ))}
                    </Text>
                  );
                })()}
              </View>

              <View style={styles.headerRight}>
                <Pressable
                  onPress={() => {
                    playSound('tap');
                    setShowStatsModal(true);
                  }}
                  style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                  android_disableSound={true}
                >
                  <Icon name="settings-outline" size={22} color="#ffffff" />
                </Pressable>
              </View>
            </View>

            {/* Corner Dice Panels and Board Layout */}
            <ScrollView contentContainerStyle={styles.boardScroll} bounces={false}>
              <View style={[styles.boardLayoutContainer, { width: contentWidth }]}>
                {/* Top Panels Row */}
                <View style={[styles.cornerPanelsRow, { width: contentWidth }]}>
                  {renderPlayerPanelBox(getPlayerByColor('GREEN'), 'top-left')}
                  {renderPlayerPanelBox(getPlayerByColor('YELLOW'), 'top-right')}
                </View>

                {/* Center: Ludo Board */}
                <View style={[styles.board, { width: boardSize, height: boardSize, overflow: 'hidden' }]}>
                  <Image
                    source={require('../assets/images/lodo_map.png')}
                    style={{
                      position: 'absolute',
                      width: boardSize * (1029 / 915),
                      height: boardSize * (1029 / 915),
                      left: -boardSize * (57 / 915),
                      top: -boardSize * (57 / 915),
                    }}
                    resizeMode="contain"
                  />
                  {/* Base grid borders */}
                  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <View style={styles.boardGridGlow} />
                  </View>

                  {/* Render cell paths */}
                  {Array.from({ length: 15 }).map((_, y) =>
                    Array.from({ length: 15 }).map((_, x) => renderCell(x, y))
                  )}

                  {/* Home center triangle */}
                  <View
                    style={[
                      styles.homeTriangleCenter,
                      {
                        width: cellSize * 3,
                        height: cellSize * 3,
                        left: boardPadding + cellSize * 6,
                        top: boardPadding + cellSize * 6,
                      },
                    ]}
                  >
                    <View style={styles.homeTriangleInner}>
                      <Icon name="shield-checkmark" size={cellSize * 1.5} color={colors.cyanBright} />
                    </View>
                  </View>

                  {/* Tokens Rendering */}
                  {renderYardPlaceholders()}
                  {renderPlayerTokens('P1', p1Tokens, p1Color)}
                  {renderPlayerTokens('P2', p2Tokens, p2Color)}
                  {playerCount >= 3 && renderPlayerTokens('P3', p3Tokens, p3Color)}
                  {playerCount >= 4 && renderPlayerTokens('P4', p4Tokens, p4Color)}

                  {/* Victory Emoji Blast Overlay */}
                  {renderBlast()}

                  {/* Border overlay to avoid platform-specific borderWidth layout shifts */}
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        borderWidth: 1.8,
                        borderColor: 'rgba(255,255,255,0.06)',
                        borderRadius: radii.xl,
                      },
                    ]}
                  />
                </View>

                {/* Bottom Panels Row */}
                <View style={[styles.cornerPanelsRow, { width: contentWidth }]}>
                  {renderPlayerPanelBox(getPlayerByColor('RED'), 'bottom-left')}
                  {renderPlayerPanelBox(getPlayerByColor('BLUE'), 'bottom-right')}
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Winner Announcement Popup */}
        {winner && (
          <View style={styles.solvedCardWrap}>
            <View style={[styles.solvedCard, { width: Math.min(contentWidth, 340) }]}>
              <View style={styles.solvedIconOrb}>
                <Icon name="trophy-outline" size={30} color={colors.warning} />
              </View>
              <Text style={styles.solvedTitle}>
                {winner === 'P1' ? 'YOU WON!' : 'GAME OVER'}
              </Text>
              <Text style={styles.solvedSubtitle}>
                Player {getPlayerColorName(winner)} has successfully homed all tokens.
              </Text>

              <View style={styles.solvedBtnRow}>
                <Pressable
                  onPress={() => {
                    playSound('tap');
                    setWinner(null);
                    showInterstitial();
                    setSetupStep(1);
                  }}
                  style={({ pressed }) => [styles.solvedReplayBtn, pressed && styles.btnPressed]}
                  android_disableSound={true}
                >
                  <Text style={styles.solvedReplayText}>LOBBY</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    showInterstitial();
                    handleResetGame();
                  }}
                  style={({ pressed }) => [styles.solvedNextBtn, pressed && styles.btnPressed]}
                  android_disableSound={true}
                >
                  <Text style={styles.solvedNextText}>REPLAY</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Exit Confirmation Modal */}
        <Modal
          transparent
          visible={exitConfirmVisible}
          animationType="fade"
          onRequestClose={() => setExitConfirmVisible(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              playSound('tap');
              setExitConfirmVisible(false);
            }}
            android_disableSound={true}
          >
            <View style={[styles.modalCard, { width: Math.min(contentWidth, 340) }]}>
              <View style={styles.modalHeaderTag}>
                <Icon name="alert-circle-outline" size={18} color={colors.pinkPrimary} />
                <Text style={[styles.modalHeaderTagText, { color: colors.pinkPrimary }]}>EXIT GAME</Text>
              </View>

              <Text style={styles.modalTitle}>Exit Current Match?</Text>
              <Text style={styles.modalSubtitle}>Are you sure you want to end this game? Any unsaved progress will be lost.</Text>

              <Pressable
                onPress={() => {
                  playSound('tap');
                  setExitConfirmVisible(false);
                  setSetupStep(1);
                }}
                style={({ pressed }) => [
                  styles.modalWatchBtn,
                  { backgroundColor: colors.pinkPrimary },
                  pressed && styles.btnPressed,
                ]}
                android_disableSound={true}
              >
                <Text style={styles.modalWatchText}>EXIT MATCH</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  playSound('tap');
                  setExitConfirmVisible(false);
                }}
                style={styles.modalCancelBtn}
                android_disableSound={true}
              >
                <Text style={styles.modalCancelText}>CONTINUE PLAYING</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Ludo Stats Modal */}
        <Modal
          transparent
          visible={showStatsModal}
          animationType="fade"
          onRequestClose={() => setShowStatsModal(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              playSound('tap');
              setShowStatsModal(false);
            }}
            android_disableSound={true}
          >
            <View style={[styles.modalCard, { width: Math.min(contentWidth, 340) }]}>
              <View style={styles.modalHeaderTag}>
                <Icon name="trophy-outline" size={18} color={colors.warning} />
                <Text style={styles.modalHeaderTagText}>LUDO STATS</Text>
              </View>

              <Text style={styles.modalTitle}>Ludo Records</Text>
              <Text style={styles.modalSubtitle}>Lifetime stats dashboard</Text>

              {stats ? (
                <View style={styles.statsContent}>
                  <View style={styles.statLine}>
                    <Text style={styles.statLabel}>Games Played</Text>
                    <Text style={styles.statVal}>{stats.gamesPlayed}</Text>
                  </View>
                  <View style={styles.statLine}>
                    <Text style={styles.statLabel}>Wins vs Bot</Text>
                    <Text style={[styles.statVal, { color: colors.pinkPrimary }]}>{stats.winsBot}</Text>
                  </View>
                  <View style={styles.statLine}>
                    <Text style={styles.statLabel}>Wins vs P2P</Text>
                    <Text style={[styles.statVal, { color: colors.cyanPrimary }]}>{stats.winsP2P}</Text>
                  </View>
                  <View style={styles.statLine}>
                    <Text style={styles.statLabel}>Win Streak</Text>
                    <Text style={[styles.statVal, { color: colors.warning }]}>{stats.winStreak} 🔥</Text>
                  </View>
                  <View style={styles.statLine}>
                    <Text style={styles.statLabel}>Best Streak</Text>
                    <Text style={styles.statVal}>{stats.bestStreak}</Text>
                  </View>

                  <Text style={[styles.lobbySectionTitle, { marginTop: 12, textAlign: 'center' }]}>WINS BY COLOR</Text>
                  <View style={styles.colorWinsRow}>
                    <View style={styles.colorWinBox}>
                      <View style={[styles.statColorDot, { backgroundColor: ludoColors.RED }]} />
                      <Text style={styles.colorWinText}>{stats.colorWins.red}</Text>
                    </View>
                    <View style={styles.colorWinBox}>
                      <View style={[styles.statColorDot, { backgroundColor: ludoColors.GREEN }]} />
                      <Text style={styles.colorWinText}>{stats.colorWins.green}</Text>
                    </View>
                    <View style={styles.colorWinBox}>
                      <View style={[styles.statColorDot, { backgroundColor: ludoColors.YELLOW }]} />
                      <Text style={styles.colorWinText}>{stats.colorWins.yellow}</Text>
                    </View>
                    <View style={styles.colorWinBox}>
                      <View style={[styles.statColorDot, { backgroundColor: ludoColors.BLUE }]} />
                      <Text style={styles.colorWinText}>{stats.colorWins.blue}</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={async () => {
                      playSound('tap');
                      const res = await resetLudoStats();
                      setStats(res);
                    }}
                    style={styles.modalResetBtn}
                    android_disableSound={true}
                  >
                    <Text style={styles.modalResetText}>RESET ALL RECORDS</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.modalSubtitle}>Loading statistics...</Text>
              )}

              <Pressable
                onPress={() => {
                  playSound('tap');
                  setShowStatsModal(false);
                }}
                style={styles.modalCancelBtn}
                android_disableSound={true}
              >
                <Text style={styles.modalCancelText}>CLOSE</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Ad Banner bottom */}
        {adsReady && (
          <View style={styles.adWrap}>
            <AdBanner compact />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#03052f',
  },
  container: {
    flex: 1,
    backgroundColor: '#03052f',
  },
  topGlow: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 520,
    top: -290,
    left: -70,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
  },
  midGlow: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 440,
    right: -240,
    top: 260,
    backgroundColor: 'rgba(255, 117, 195, 0.08)',
  },
  setupScreen: {
    flex: 1,
  },
  headerRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
    zIndex: 10,
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movesBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  movesBadgeText: {
    color: '#00f5ff',
    fontSize: 10,
    fontFamily: typography.family.bold,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    letterSpacing: typography.tracking.wide,
    textShadowColor: 'rgba(0, 245, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    fontFamily: typography.family.black,
  },
  headerSubtitle: {
    color: '#ff75c3',
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 2,
    fontFamily: typography.family.black,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  setupScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.lg,
  },
  lobbyContent: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  lobbyCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderRadius: radii.xxl,
    padding: spacing.lg,
  },
  lobbyTitle: {
    color: '#ffffff',
    fontSize: 20,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: typography.family.black,
  },
  lobbySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 16,
    fontFamily: typography.family.body,
  },
  modeOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  optionOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionTextWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionTitle: {
    fontSize: 14,
    letterSpacing: 0.5,
    fontFamily: typography.family.black,
  },
  optionDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 2,
    fontFamily: typography.family.body,
  },
  lobbyStatsBtn: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 203, 85, 0.25)',
    backgroundColor: 'rgba(255, 203, 85, 0.03)',
    borderRadius: radii.md,
    paddingVertical: 10,
  },
  lobbyStatsText: {
    color: '#ffcc00',
    fontSize: 10,
    fontFamily: typography.family.bold,
  },
  lobbySectionTitle: {
    color: '#00f5ff',
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
    fontFamily: typography.family.black,
  },
  countSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: spacing.md,
  },
  countTab: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  countTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: typography.family.bold,
  },
  colorSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: spacing.lg,
  },
  colorOrb: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  colorOrbActive: {
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  playBtn: {
    marginTop: spacing.md,
    backgroundColor: '#00f5ff',
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playBtnText: {
    color: '#03052f',
    fontSize: 14,
    letterSpacing: 0.5,
    fontFamily: typography.family.black,
  },
  btnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  boardScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.lg,
  },
  boardLayoutContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  cornerPanelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 12,
    gap: 12,
  },
  playerPanelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  playerOuterBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2.2,
    borderColor: '#ffffff',
    backgroundColor: '#03052f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerStarBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#03052f',
  },
  pointingHandEmoji: {
    fontSize: 24,
    marginHorizontal: 3,
  },
  cornerDiceBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerScoreText: {
    fontSize: 22,
    fontWeight: typography.weight.heavy,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  board: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    // borderRadius: radii.xl,
    position: 'relative',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  boardGridGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 245, 255, 0.1)',
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yard: {
    position: 'absolute',
  },
  homeTriangleCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  homeTriangleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  token: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    // borderWidth: 2,
    // borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  tokenActiveGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  tokenLabel: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: typography.family.black,
  },
  solvedCardWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 5, 47, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 20,
  },
  solvedCard: {
    borderRadius: radii.xxl,
    borderWidth: 2,
    borderColor: 'rgba(0, 245, 255, 0.3)',
    backgroundColor: '#03052f',
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 4,
  },
  solvedIconOrb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 245, 255, 0.3)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  solvedTitle: {
    color: '#00f5ff',
    fontSize: 18,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 245, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: 'center',
    fontFamily: typography.family.black,
  },
  solvedSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
    fontFamily: typography.family.semibold,
  },
  solvedBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  solvedReplayBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ff75c3',
    borderWidth: 1.6,
    backgroundColor: 'rgba(255, 117, 195, 0.05)',
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  solvedReplayText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: typography.family.black,
  },
  solvedNextBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#00f5ff',
    borderWidth: 1.6,
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  solvedNextText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: typography.family.black,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 5, 47, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: '#03052f',
    borderRadius: radii.xxl,
    borderWidth: 2,
    borderColor: 'rgba(0, 245, 255, 0.3)',
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 4,
  },
  modalHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#ffcc00',
    backgroundColor: 'rgba(255, 204, 0, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: spacing.sm,
  },
  modalHeaderTagText: {
    color: '#ffcc00',
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: typography.family.black,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: typography.family.black,
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 16,
    fontFamily: typography.family.body,
  },
  modalWatchBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  modalWatchText: {
    color: '#ffffff',
    fontSize: 13,
    letterSpacing: 0.5,
    fontFamily: typography.family.black,
  },
  modalCancelBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modalCancelText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontFamily: typography.family.bold,
  },
  statsContent: {
    width: '100%',
    marginVertical: spacing.xs,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: typography.family.semibold,
  },
  statVal: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: typography.family.black,
  },
  colorWinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  colorWinBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 8,
    alignItems: 'center',
    gap: 4,
  },
  colorWinText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: typography.family.bold,
  },
  modalResetBtn: {
    marginTop: spacing.md,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ff75c3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
  },
  modalResetText: {
    color: '#ff75c3',
    fontSize: 9,
    fontFamily: typography.family.bold,
  },
  adWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
  },
});

export default LudoScreen;
