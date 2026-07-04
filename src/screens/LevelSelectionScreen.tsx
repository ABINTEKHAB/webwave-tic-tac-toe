import React, { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
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
} from 'react-native';

const BACKGROUND_IMG = require('../assets/images/bgr_1.png');
import Icon from '@react-native-vector-icons/ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../components/AdBanner';
import { Difficulty, GameMode } from '../types';
import { getContentWidth, scaleSize } from '../theme/responsive';
import { radii, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';
import { CareerStats, getCareerStats, resetCareerStats } from '../services/stats';
import { useGameSounds } from '../hooks/useGameSounds';
import { hexToRgba } from '../theme/themes';

interface LevelSelectionScreenProps {
  adsReady: boolean;
  onStartGame: (mode: GameMode, difficulty?: Difficulty) => void;
  onGoBack?: () => void;
  soundEnabled: boolean;
}

type PreviewSymbol = 'O' | 'X';

const LEVELS: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const PREVIEW_PATTERN: PreviewSymbol[] = ['O', 'X', 'O', 'X', 'O', 'X', 'O', 'X', 'O'];

interface PreviewMarkProps {
  symbol: PreviewSymbol;
  size: number;
  colors: any;
  emphasized?: boolean;
}

const PreviewNeonMark = ({ symbol, size, colors, emphasized = false }: PreviewMarkProps) => {
  const styles = useMemo(() => getStyles(colors, {}), [colors]);

  if (symbol === 'O') {
    const core = size;
    const glow = Math.round(size * 1.1);
    const outer = Math.round(size * 1.18);
    const coreBorder = Math.max(5, Math.round(size * 0.14));
    const glowBorder = Math.max(coreBorder + 2, Math.round(size * 0.2));
    const outerBorder = Math.max(glowBorder + 2, Math.round(size * 0.24));

    return (
      <View style={[styles.markWrap, { width: outer, height: outer }, emphasized && styles.markWrapEmphasized]}>
        <View style={[styles.oRingLayer, { width: outer, height: outer, borderRadius: outer / 2, borderWidth: outerBorder }, styles.oRingOuter]} />
        <View style={[styles.oRingLayer, { width: glow, height: glow, borderRadius: glow / 2, borderWidth: glowBorder }, styles.oRingGlow]} />
        <View style={[styles.oRingLayer, { width: core, height: core, borderRadius: core / 2, borderWidth: coreBorder }, styles.oRingCore]} />
      </View>
    );
  }

  const coreW = size;
  const coreH = Math.max(5, Math.round(size * 0.14));
  const glowW = Math.round(size * 1.09);
  const glowH = coreH + 3;
  const outerW = Math.round(size * 1.18);
  const outerH = coreH + 7;

  return (
    <View style={[styles.markWrap, { width: outerW, height: outerW }, emphasized && styles.markWrapEmphasized]}>
      <View style={[styles.xStroke, styles.xStrokeOne, { width: outerW, height: outerH, borderRadius: outerH }, styles.xStrokeOuter]} />
      <View style={[styles.xStroke, styles.xStrokeTwo, { width: outerW, height: outerH, borderRadius: outerH }, styles.xStrokeOuter]} />
      <View style={[styles.xStroke, styles.xStrokeOne, { width: glowW, height: glowH, borderRadius: glowH }, styles.xStrokeGlow]} />
      <View style={[styles.xStroke, styles.xStrokeTwo, { width: glowW, height: glowH, borderRadius: glowH }, styles.xStrokeGlow]} />
      <View style={[styles.xStroke, styles.xStrokeOne, { width: coreW, height: coreH, borderRadius: coreH }, styles.xStrokeCore]} />
      <View style={[styles.xStroke, styles.xStrokeTwo, { width: coreW, height: coreH, borderRadius: coreH }, styles.xStrokeCore]} />
    </View>
  );
};

const LevelSelectionScreen = ({
  adsReady,
  onStartGame,
  onGoBack,
  soundEnabled,
}: LevelSelectionScreenProps) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const { playSound } = useGameSounds(soundEnabled);

  const contentWidth = getContentWidth(width, 16, 560);
  const compact = height < 760;
  const boardSize = Math.min(contentWidth * (compact ? 0.74 : 0.78), scaleSize(compact ? 286 : 324, width));
  const cellSize = boardSize / 3;
  const previewMarkSize = Math.max(34, Math.round(cellSize * 0.46));
  const titleSize = Math.max(28, scaleSize(compact ? 32 : 38, width));
  const subtitleSize = Math.max(12, scaleSize(compact ? 12 : 14, width));
  const buttonLabelSize = Math.max(15, scaleSize(compact ? 16 : 18, width));
  const modalTitleSize = Math.max(20, scaleSize(24, width));
  const modalLabelSize = Math.max(18, scaleSize(22, width));

  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [careerStats, setCareerStats] = useState<CareerStats | null>(null);
  const [menuStats, setMenuStats] = useState<CareerStats | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');

  const selectedIndex = useMemo(() => LEVELS.indexOf(selectedDifficulty), [selectedDifficulty]);

  useEffect(() => {
    getCareerStats()
      .then(stats => {
        setMenuStats(stats);
        if (showStatsModal) {
          setCareerStats(stats);
        }
      })
      .catch(() => {});
  }, [showStatsModal]);

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showDifficultyModal) {
        setShowDifficultyModal(false);
        return true;
      }
      if (showStatsModal) {
        setShowStatsModal(false);
        return true;
      }
      if (onGoBack) {
        onGoBack();
        return true;
      }
      return false;
    });

    return () => backSubscription.remove();
  }, [showDifficultyModal, showStatsModal, onGoBack]);

  const handlePvAI = () => setShowDifficultyModal(true);
  const handlePvp = () => onStartGame('PVP');
  const confirmPvAI = () => {
    setShowDifficultyModal(false);
    onStartGame('PVAI', selectedDifficulty);
  };

  const handleResetStats = async () => {
    const fresh = await resetCareerStats();
    setCareerStats(fresh);
    setMenuStats(fresh);
  };

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundAlt} translucent={false} hidden={false} />

      <View style={styles.container}>
        <ImageBackground source={BACKGROUND_IMG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.midGlow} />
        <View pointerEvents="none" style={styles.bottomGlow} />
        <View pointerEvents="none" style={styles.sparkA} />
        <View pointerEvents="none" style={styles.sparkB} />
        <View pointerEvents="none" style={styles.sparkC} />

        {/* Top Header Bar for Stats & Streak */}
        <View style={[styles.topHeaderBar, { width: contentWidth }]}>
          <View style={styles.headerLeftCol}>
            {onGoBack && (
              <Pressable
                onPress={() => {
                  playSound('tap');
                  onGoBack();
                }}
                accessibilityRole="button"
                accessibilityLabel="Go back to game selection"
                style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
                android_disableSound={true}
              >
                <Icon name="arrow-back" size={18} color={colors.cyanPrimary} />
              </Pressable>
            )}
            <View style={styles.profileBadge}>
              <Icon name="person-circle-outline" size={20} color={colors.pinkPrimary} />
              <Text style={styles.profileBadgeText}>Streak: {menuStats?.currentStreak || 0} 🔥</Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              playSound('tap');
              setShowStatsModal(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="View Career Stats"
            style={({ pressed }) => [styles.statsBtn, pressed && styles.statsBtnPressed]}
            android_disableSound={true}
          >
            <Icon name="trophy-outline" size={18} color={colors.cyanPrimary} />
            <Text style={styles.statsBtnText}>STATS</Text>
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: compact ? spacing.xs : spacing.sm,
              paddingBottom: (compact ? spacing.lg : spacing.xxl) + Math.max(insets.bottom, spacing.sm),
            },
          ]}
        >
          <View style={[styles.content, { width: contentWidth }]}>
            <Text style={[styles.title, { fontSize: titleSize }]}>SELECT MODE</Text>
            <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>Choose how you want to play</Text>
            <View pointerEvents="none" style={styles.heroFlare} />

            {/* Daily Mission Capsule Card */}
            <View style={styles.dailyMissionCard}>
              <Icon name="sparkles-outline" size={14} color={colors.warning} />
              <Text style={styles.dailyMissionText}>
                DAILY MISSION: Duel the hard AI to earn a Supernova Token
              </Text>
            </View>

            <View style={[styles.previewWrap, { width: boardSize, height: boardSize }]}>
              <View pointerEvents="none" style={styles.previewOuterPinkAura} />
              <View pointerEvents="none" style={styles.previewOuterCyanAura} />
              <View style={styles.previewBoard}>
                <View pointerEvents="none" style={styles.previewBoardInnerShade} />
                {PREVIEW_PATTERN.map((symbol, index) => (
                  <View key={`preview-cell-${index}`} style={styles.previewCell}>
                    <View pointerEvents="none" style={styles.previewCellShade} />
                    <PreviewNeonMark symbol={symbol} size={previewMarkSize} colors={colors} emphasized={index === 4} />
                  </View>
                ))}

                <View pointerEvents="none" style={styles.gridOverlay}>
                  <View style={[styles.gridLineVertical, { left: '33.3333%' }]} />
                  <View style={[styles.gridLineVertical, { left: '66.6666%' }]} />
                  <View style={[styles.gridLineHorizontal, { top: '33.3333%' }]} />
                  <View style={[styles.gridLineHorizontal, { top: '66.6666%' }]} />
                </View>
              </View>
            </View>

            <View style={styles.menuStack}>
              {/* PvBot Card */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Play against AI (Bot)"
                style={({ pressed }) => [
                  styles.modeCard,
                  styles.modeCardPink,
                  pressed && styles.modeCardPressed,
                ]}
                onPress={() => {
                  playSound('tap');
                  handlePvAI();
                }}
                android_disableSound={true}
              >
                <View style={styles.modeCardContent}>
                  <View style={[styles.modeCardIconOrb, styles.modeCardIconOrbPink]}>
                    <Icon name="hardware-chip-outline" size={22} color={colors.pinkPrimary} />
                  </View>
                  <View style={styles.modeCardTextWrap}>
                    <Text style={[styles.modeCardTitle, { fontSize: buttonLabelSize, color: colors.pinkPrimary }]}>YOU VS AI</Text>
                    <Text style={styles.modeCardDesc}>Play against our smart computer opponent.</Text>
                  </View>
                  <Icon name="chevron-forward" size={18} color={colors.pinkPrimary} />
                </View>
              </Pressable>

              {/* PvP Card */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Play against another player (PVP)"
                style={({ pressed }) => [
                  styles.modeCard,
                  styles.modeCardCyan,
                  pressed && styles.modeCardPressed,
                ]}
                onPress={() => {
                  playSound('tap');
                  handlePvp();
                }}
                android_disableSound={true}
              >
                <View style={styles.modeCardContent}>
                  <View style={[styles.modeCardIconOrb, styles.modeCardIconOrbCyan]}>
                    <Icon name="people-outline" size={22} color={colors.cyanPrimary} />
                  </View>
                  <View style={styles.modeCardTextWrap}>
                    <Text style={[styles.modeCardTitle, { fontSize: buttonLabelSize }]}>PLAYER VS PLAYER</Text>
                    <Text style={styles.modeCardDesc}>Play with a friend on the same device.</Text>
                  </View>
                  <Icon name="chevron-forward" size={18} color={colors.cyanPrimary} />
                </View>
              </Pressable>
            </View>

            {/* Translucent Glass Career Stats Summary */}
            {menuStats && (
              <View style={styles.dashboardCard}>
                <Text style={styles.dashboardTitle}>CAREER OVERVIEW</Text>
                <View style={styles.dashboardDivider} />
                <View style={styles.dashboardGrid}>
                  <View style={styles.dashboardItem}>
                    <Text style={styles.dashboardVal}>
                      {menuStats.pvpWinsX + menuStats.pvpWinsO + menuStats.pvaiWinsUser}
                    </Text>
                    <Text style={styles.dashboardLabel}>Wins</Text>
                  </View>
                  <View style={styles.dashboardItem}>
                    <Text style={[styles.dashboardVal, { color: colors.pinkPrimary }]}>
                      {menuStats.pvpPlayed + menuStats.pvaiPlayed}
                    </Text>
                    <Text style={styles.dashboardLabel}>Played</Text>
                  </View>
                  <View style={styles.dashboardItem}>
                    <Text style={[styles.dashboardVal, { color: colors.warning }]}>
                      {Math.round(
                        ((menuStats.pvpWinsX + menuStats.pvpWinsO + menuStats.pvaiWinsUser) /
                          Math.max(1, menuStats.pvpPlayed + menuStats.pvaiPlayed)) *
                          100
                      )}
                      %
                    </Text>
                    <Text style={styles.dashboardLabel}>WinRate</Text>
                  </View>
                </View>
              </View>
            )}

            {/* {adsReady ? <AdBanner compact /> : null} */}

              {adsReady && (
          <View style={styles.adWrap}>
            <AdBanner compact />
          </View>
        )}
          </View>
        </ScrollView>

        {/* AI Difficulty Modal */}
        <Modal
          transparent
          visible={showDifficultyModal}
          animationType="fade"
          onRequestClose={() => setShowDifficultyModal(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              playSound('tap');
              setShowDifficultyModal(false);
            }}
            android_disableSound={true}
          >
            <Pressable
              style={[styles.modalCard, { width: Math.min(contentWidth, 380) }]}
              onPress={() => {}}
              android_disableSound={true}
            >
              <View style={styles.modalTopRow}>
                <View style={styles.modalHeaderTag}>
                  <Icon name="sparkles-outline" size={16} color={colors.pinkPrimary} />
                  <Text style={styles.modalHeaderTagText}>PLAYER VS AI</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close difficulty modal"
                  onPress={() => {
                    playSound('tap');
                    setShowDifficultyModal(false);
                  }}
                  style={({ pressed }) => [styles.modalCloseButton, pressed && styles.modalCloseButtonPressed]}
                  android_disableSound={true}
                >
                  <Icon name="close" size={18} color={colors.backgroundAlt} />
                </Pressable>
              </View>

              <Text style={[styles.modalTitle, { fontSize: modalTitleSize }]}>Choose Your Challenge</Text>
              <Text style={styles.modalSubtitle}>Select the AI difficulty for this match</Text>
              <View pointerEvents="none" style={styles.modalFlare} />

              <View style={styles.modalPanel}>
                <Text style={styles.modalPanelLabel}>Difficulty</Text>
                <Text style={[styles.modalDifficultyValue, { fontSize: modalLabelSize }]}>{selectedDifficulty.toUpperCase()}</Text>

                <View style={styles.sliderWrap}>
                  <View pointerEvents="none" style={styles.sliderTrack} />
                  {LEVELS.map((level, index) => {
                    const active = selectedIndex === index;
                    return (
                      <Pressable
                        key={level}
                        accessibilityRole="button"
                        accessibilityLabel={`Set difficulty ${level}`}
                        onPress={() => {
                          playSound('tap');
                          setSelectedDifficulty(level);
                        }}
                        style={styles.sliderNodeHitArea}
                        android_disableSound={true}
                      >
                        <View style={[styles.sliderNodeOuter, active && styles.sliderNodeOuterActive]}>
                          <View style={[styles.sliderNodeInner, active && styles.sliderNodeInnerActive]} />
                        </View>
                        <Text style={[styles.sliderLabel, active && styles.sliderLabelActive]}>{level}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Start player versus AI game"
                  onPress={() => {
                    playSound('tap');
                    confirmPvAI();
                  }}
                  style={({ pressed }) => [styles.modalStartButton, pressed && styles.modeCardPressed]}
                  android_disableSound={true}
                >
                  <Text style={styles.modalStartButtonText}>START</Text>
                </Pressable>
              </View>

              <View style={styles.modalHintPill}>
                <Text style={styles.modalHintText}>Improve your strategy and skills</Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Lifetime Career Stats Modal */}
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
            <Pressable
              style={[styles.modalCard, { width: Math.min(contentWidth, 380), maxHeight: '80%' }]}
              onPress={() => {}}
              android_disableSound={true}
            >
              <View style={styles.modalTopRow}>
                <View style={styles.modalHeaderTag}>
                  <Icon name="trophy-outline" size={16} color={colors.pinkPrimary} />
                  <Text style={styles.modalHeaderTagText}>LIFETIME STATS</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close stats modal"
                  onPress={() => {
                    playSound('tap');
                    setShowStatsModal(false);
                  }}
                  style={({ pressed }) => [styles.modalCloseButton, pressed && styles.modalCloseButtonPressed]}
                  android_disableSound={true}
                >
                  <Icon name="close" size={18} color={colors.backgroundAlt} />
                </Pressable>
              </View>

              <Text style={[styles.modalTitle, { fontSize: modalTitleSize }]}>Your Performance</Text>
              <Text style={styles.modalSubtitle}>Lifetime matches history and stats</Text>
              <View pointerEvents="none" style={styles.modalFlare} />

              {careerStats ? (
                <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.statsContent} showsVerticalScrollIndicator={false}>
                  {/* Streak Card */}
                  <View style={styles.streakGrid}>
                    <View style={styles.streakBox}>
                      <Text style={styles.streakNum}>{careerStats.currentStreak}</Text>
                      <Text style={styles.streakLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.streakBox}>
                      <Text style={[styles.streakNum, { color: colors.pinkPrimary }]}>{careerStats.bestStreak}</Text>
                      <Text style={styles.streakLabel}>Best Streak</Text>
                    </View>
                  </View>

                  {/* PVAI EASY Stats */}
                  <Text style={styles.statsSectionTitle}>VS AI - EASY</Text>
                  <View style={styles.statsCard}>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Played</Text>
                      <Text style={styles.statVal}>{careerStats.aiEasyPlayed || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Wins</Text>
                      <Text style={[styles.statVal, { color: colors.cyanPrimary }]}>{careerStats.aiEasyWinsUser || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Losses</Text>
                      <Text style={[styles.statVal, { color: colors.pinkPrimary }]}>{careerStats.aiEasyWinsAi || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Draws</Text>
                      <Text style={styles.statVal}>{careerStats.aiEasyDraws || 0}</Text>
                    </View>
                  </View>

                  {/* PVAI MEDIUM Stats */}
                  <Text style={styles.statsSectionTitle}>VS AI - MEDIUM</Text>
                  <View style={styles.statsCard}>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Played</Text>
                      <Text style={styles.statVal}>{careerStats.aiMediumPlayed || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Wins</Text>
                      <Text style={[styles.statVal, { color: colors.cyanPrimary }]}>{careerStats.aiMediumWinsUser || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Losses</Text>
                      <Text style={[styles.statVal, { color: colors.pinkPrimary }]}>{careerStats.aiMediumWinsAi || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Draws</Text>
                      <Text style={styles.statVal}>{careerStats.aiMediumDraws || 0}</Text>
                    </View>
                  </View>

                  {/* PVAI HARD Stats */}
                  <Text style={styles.statsSectionTitle}>VS AI - HARD</Text>
                  <View style={styles.statsCard}>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Played</Text>
                      <Text style={styles.statVal}>{careerStats.aiHardPlayed || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Wins</Text>
                      <Text style={[styles.statVal, { color: colors.cyanPrimary }]}>{careerStats.aiHardWinsUser || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Losses</Text>
                      <Text style={[styles.statVal, { color: colors.pinkPrimary }]}>{careerStats.aiHardWinsAi || 0}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Draws</Text>
                      <Text style={styles.statVal}>{careerStats.aiHardDraws || 0}</Text>
                    </View>
                  </View>

                  {/* PVP Stats */}
                  <Text style={styles.statsSectionTitle}>VS LOCAL PLAYER</Text>
                  <View style={styles.statsCard}>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Played</Text>
                      <Text style={styles.statVal}>{careerStats.pvpPlayed}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Wins X</Text>
                      <Text style={styles.statVal}>{careerStats.pvpWinsX}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Wins O</Text>
                      <Text style={styles.statVal}>{careerStats.pvpWinsO}</Text>
                    </View>
                    <View style={styles.statLine}>
                      <Text style={styles.statText}>Draws</Text>
                      <Text style={styles.statVal}>{careerStats.pvpDraws}</Text>
                    </View>
                  </View>

                  {/* Reset Button */}
                  <Pressable
                    onPress={() => {
                      playSound('tap');
                      handleResetStats();
                    }}
                    style={({ pressed }) => [styles.resetStatsBtn, pressed && styles.statsBtnPressed]}
                    android_disableSound={true}
                  >
                    <Icon name="trash-outline" size={16} color={colors.pinkPrimary} />
                    <Text style={styles.resetStatsText}>RESET STATS</Text>
                  </Pressable>
                </ScrollView>
              ) : (
                <Text style={styles.modalSubtitle}>Loading statistics...</Text>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, shadows: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
    },
    container: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
    },
    topHeaderBar: {
      alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      zIndex: 10,
    },
    headerLeftCol: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: radii.md,
      borderWidth: 1.2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.cyanSoft,
    },
    backBtnPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
    profileBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: radii.pill,
      borderWidth: 1.2,
      borderColor: colors.pinkBorder,
      backgroundColor: colors.cardSurfaceSoft,
      paddingVertical: 6,
      paddingHorizontal: 12,
      ...shadows.pinkSoft,
    },
    profileBadgeText: {
      color: colors.textPrimary,
      fontSize: typography.size.xs,
      fontFamily: typography.family.bold,
    },
    statsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: radii.pill,
      borderWidth: 1.2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceSoft,
      paddingVertical: 6,
      paddingHorizontal: 12,
      ...shadows.cyanSoft,
    },
    statsBtnText: {
      color: colors.textPrimary,
      fontSize: typography.size.xs,
      fontFamily: typography.family.bold,
    },
    statsBtnPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    content: {
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
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
      width: 460,
      height: 460,
      borderRadius: 460,
      right: -250,
      top: 120,
      backgroundColor: colors.glowPrimary,
    },
    bottomGlow: {
      position: 'absolute',
      width: 560,
      height: 560,
      borderRadius: 560,
      left: -270,
      bottom: -280,
      backgroundColor: colors.glowSecondary,
    },
    sparkA: {
      position: 'absolute',
      top: '19%',
      left: '17%',
      width: 5,
      height: 5,
      borderRadius: 5,
      backgroundColor: colors.cyanPrimary,
      shadowColor: colors.cyanGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 8,
      elevation: 8,
    },
    sparkB: {
      position: 'absolute',
      top: '27%',
      right: '16%',
      width: 4,
      height: 4,
      borderRadius: 4,
      backgroundColor: colors.pinkPrimary,
      shadowColor: colors.pinkGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 8,
      elevation: 8,
    },
    sparkC: {
      position: 'absolute',
      top: '59%',
      right: '26%',
      width: 4,
      height: 4,
      borderRadius: 4,
      backgroundColor: colors.cyanBright,
      shadowColor: colors.cyanGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
      elevation: 6,
    },
    title: {
      color: colors.textPrimary,
      letterSpacing: typography.tracking.xwide,
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      fontFamily: typography.family.black,
    },
    subtitle: {
      marginTop: 4,
      color: colors.textSecondary,
      letterSpacing: typography.tracking.normal,
      textAlign: 'center',
      fontFamily: typography.family.semibold,
    },
    heroFlare: {
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
      width: '74%',
      height: 2,
      borderRadius: radii.pill,
      backgroundColor: colors.cyanSoft,
      shadowColor: colors.cyanGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 9,
      elevation: 6,
    },
    dailyMissionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.warning,
      backgroundColor: 'rgba(255, 179, 0, 0.08)',
      paddingVertical: 10,
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.md,
      width: '100%',
    },
    dailyMissionText: {
      color: colors.warning,
      fontSize: typography.size.xs,
      flex: 1,
      fontFamily: typography.family.semibold,
    },
    previewWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
      borderRadius: radii.xxl + 4,
    },
    previewOuterPinkAura: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radii.xxl + 8,
      borderWidth: 3,
      borderColor: colors.glowSecondary,
    },
    previewOuterCyanAura: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radii.xxl + 8,
      borderWidth: 2,
      borderColor: colors.cyanBorder,
      ...shadows.cyanStrong,
    },
    previewBoard: {
      width: '100%',
      height: '100%',
      borderRadius: radii.xxl,
      borderWidth: 2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.previewBoardBg,
      flexDirection: 'row',
      flexWrap: 'wrap',
      overflow: 'hidden',
    },
    previewBoardInnerShade: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radii.xxl,
      borderWidth: 6,
      borderColor: colors.previewBoardSecondaryBorder,
    },
    previewCell: {
      width: '33.3333%',
      height: '33.3333%',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    previewCellShade: {
      position: 'absolute',
      width: '82%',
      height: '82%',
      backgroundColor: colors.previewCellBg,
    },
    markWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    markWrapEmphasized: {
      transform: [{ scale: 1.05 }],
    },
    oRingLayer: {
      position: 'absolute',
    },
    oRingOuter: {
      borderColor: colors.markOOuter,
    },
    oRingGlow: {
      borderColor: colors.markOGlow,
    },
    oRingCore: {
      borderColor: colors.markCore,
    },
    xStroke: {
      position: 'absolute',
    },
    xStrokeOne: {
      transform: [{ rotate: '45deg' }],
    },
    xStrokeTwo: {
      transform: [{ rotate: '-45deg' }],
    },
    xStrokeOuter: {
      backgroundColor: colors.markXOuter,
    },
    xStrokeGlow: {
      backgroundColor: colors.markXGlow,
    },
    xStrokeCore: {
      backgroundColor: colors.markCore,
    },
    gridOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    gridLineVertical: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 2,
      marginLeft: -1,
      backgroundColor: colors.boardGridLine,
    },
    gridLineHorizontal: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      marginTop: -1,
      backgroundColor: colors.boardGridLine,
    },
    menuStack: {
      width: '100%',
      gap: spacing.sm,
    },
    modeCard: {
      minHeight: 80,
      borderRadius: radii.xl,
      borderWidth: 1.8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
    },
    modeCardCyan: {
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurface,
      ...shadows.cyanSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    modeCardPink: {
      borderColor: colors.pinkBorder,
      backgroundColor: colors.cardSurfaceAlt,
      ...shadows.pinkSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    modeCardPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.985 }],
    },
    modeCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    modeCardIconOrb: {
      width: 44,
      height: 44,
      borderRadius: radii.pill,
      borderWidth: 1.2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeCardIconOrbCyan: {
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceSoft,
    },
    modeCardIconOrbPink: {
      borderColor: colors.pinkBorder,
      backgroundColor: colors.cardSurfaceSoft,
    },
    modeCardTextWrap: {
      flex: 1,
      marginLeft: spacing.sm,
      marginRight: spacing.xs,
    },
    modeCardTitle: {
      color: colors.cyanPrimary,
      letterSpacing: typography.tracking.wide,
      textShadowColor: hexToRgba(colors.cyanGlow, 0.4),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 7,
      fontFamily: typography.family.black,
    },
    modeCardDesc: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 2,
      fontFamily: typography.family.semibold,
    },
    dashboardCard: {
      width: '100%',
      borderRadius: radii.xl,
      borderWidth: 1.4,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      padding: spacing.md,
      marginTop: spacing.xl,
      marginBottom: spacing.xs,
    },
    dashboardTitle: {
      color: colors.textPrimary,
      fontSize: 11,
      letterSpacing: typography.tracking.wide,
      textAlign: 'center',
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      fontFamily: typography.family.black,
    },
    dashboardDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      marginVertical: spacing.sm,
    },
    dashboardGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    dashboardItem: {
      alignItems: 'center',
    },
    dashboardVal: {
      color: colors.cyanPrimary,
      fontSize: 20,
      textShadowColor: hexToRgba(colors.cyanGlow, 0.4),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      fontFamily: typography.family.black,
    },
    dashboardLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 2,
      letterSpacing: 0.5,
      fontFamily: typography.family.bold,
    },
      adWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
  },
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.overlayDark,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    modalCard: {
      borderRadius: radii.xxl,
      borderWidth: 2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceStrong,
      padding: spacing.lg,
      ...shadows.cyanStrong,
    },
    modalTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    modalHeaderTag: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.glowSecondary,
      backgroundColor: colors.cardSurfaceSoft,
      paddingVertical: 4,
      paddingHorizontal: 10,
      gap: 6,
    },
    modalHeaderTagText: {
      color: colors.textPrimary,
      fontSize: typography.size.xs,
      letterSpacing: typography.tracking.tight,
      fontFamily: typography.family.bold,
    },
    modalCloseButton: {
      width: 34,
      height: 34,
      borderRadius: radii.pill,
      borderWidth: 1.4,
      borderColor: colors.textPrimary,
      backgroundColor: colors.cyanPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.cyanSoft,
    },
    modalCloseButtonPressed: {
      opacity: 0.86,
      transform: [{ scale: 0.96 }],
    },
    modalTitle: {
      color: colors.textPrimary,
      letterSpacing: typography.tracking.normal,
      textShadowColor: hexToRgba(colors.cyanGlow, 0.4),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontFamily: typography.family.body,
    },
    modalSubtitle: {
      marginTop: 6,
      color: colors.textSecondary,
      letterSpacing: typography.tracking.tight,
      fontFamily: typography.family.medium,
    },
    modalFlare: {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
      width: '72%',
      height: 2,
      borderRadius: radii.pill,
      backgroundColor: colors.cyanSoft,
      shadowColor: colors.cyanGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.75,
      shadowRadius: 8,
      elevation: 5,
    },
    modalPanel: {
      borderRadius: radii.xl,
      borderWidth: 1.4,
      borderColor: colors.modalPanelBorder,
      backgroundColor: colors.modalPanelBg,
      padding: spacing.md,
    },
    modalPanelLabel: {
      color: colors.textPrimary,
      textAlign: 'center',
      letterSpacing: typography.tracking.tight,
      fontSize: typography.size.md,
      fontFamily: typography.family.semibold,
    },
    modalDifficultyValue: {
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      color: colors.warning,
      textAlign: 'center',
      letterSpacing: typography.tracking.wide,
      textShadowColor: hexToRgba(colors.warning, 0.4),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontFamily: typography.family.black,
    },
    sliderWrap: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      position: 'relative',
      paddingHorizontal: spacing.xs,
    },
    sliderTrack: {
      position: 'absolute',
      left: '16.6667%',
      right: '16.6667%',
      top: 10,
      height: 3,
      borderRadius: radii.pill,
      backgroundColor: colors.sliderTrack,
    },
    sliderNodeHitArea: {
      flex: 1,
      alignItems: 'center',
    },
    sliderNodeOuter: {
      width: 22,
      height: 22,
      borderRadius: radii.pill,
      backgroundColor: colors.sliderNodeBg,
      borderWidth: 2,
      borderColor: colors.backgroundAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sliderNodeOuterActive: {
      backgroundColor: colors.sliderNodeActiveBg,
      borderColor: colors.textPrimary,
      transform: [{ scale: 1.12 }],
      shadowColor: colors.sliderNodeActiveGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.75,
      shadowRadius: 8,
      elevation: 6,
    },
    sliderNodeInner: {
      width: 8,
      height: 8,
      borderRadius: 8,
      backgroundColor: colors.sliderNodeInnerBg,
    },
    sliderNodeInnerActive: {
      backgroundColor: colors.sliderNodeInnerActiveBg,
    },
    sliderLabel: {
      marginTop: spacing.xs,
      color: colors.textSecondary,
      fontSize: typography.size.xs,
      letterSpacing: typography.tracking.tight,
      fontFamily: typography.family.bold,
    },
    sliderLabelActive: {
      color: colors.textPrimary,
    },
    modalStartButton: {
      marginTop: spacing.md,
      borderRadius: radii.lg,
      borderWidth: 1.6,
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurface,
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.cyanSoft,
    },
    modalStartButtonText: {
      color: colors.textPrimary,
      letterSpacing: typography.tracking.wide,
      fontSize: typography.size.lg,
      fontFamily: typography.family.black,
    },
    modalHintPill: {
      marginTop: spacing.md,
      borderRadius: radii.lg,
      borderWidth: 1.2,
      borderColor: colors.modalHintPillBorder,
      backgroundColor: colors.modalHintPillBg,
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
    },
    modalHintText: {
      color: colors.modalHintText,
      letterSpacing: typography.tracking.tight,
      textAlign: 'center',
      fontSize: typography.size.sm,
      fontFamily: typography.family.medium,
    },
    statsContent: {
      width: '100%',
      marginTop: spacing.xs,
    },
    streakGrid: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    streakBox: {
      flex: 1,
      borderWidth: 1.2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceSoft,
      borderRadius: radii.lg,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    streakNum: {
      color: colors.cyanPrimary,
      fontSize: 22,
      textShadowColor: hexToRgba(colors.cyanGlow, 0.4),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontFamily: typography.family.black,
    },
    streakLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 2,
      fontFamily: typography.family.bold,
    },
    statsSectionTitle: {
      color: colors.textPrimary,
      fontSize: 10,
      letterSpacing: 1,
      marginTop: spacing.xs,
      marginBottom: 6,
      fontFamily: typography.family.black,
    },
    statsCard: {
      borderRadius: radii.lg,
      borderWidth: 1.2,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      backgroundColor: colors.cardSurfaceSoft,
      padding: spacing.sm,
      gap: 6,
      marginBottom: spacing.xs,
    },
    statLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statText: {
      color: colors.textSecondary,
      fontSize: typography.size.sm,
      fontFamily: typography.family.semibold,
    },
    statVal: {
      color: colors.textPrimary,
      fontSize: typography.size.sm,
      fontFamily: typography.family.bold,
    },
    resetStatsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: radii.md,
      borderWidth: 1.2,
      borderColor: colors.pinkBorder,
      backgroundColor: colors.glowSecondary,
      marginTop: spacing.md,
    },
    resetStatsText: {
      color: colors.pinkPrimary,
      fontSize: 11,
      letterSpacing: 0.8,
      fontFamily: typography.family.black,
    },
  });

export default LevelSelectionScreen;
