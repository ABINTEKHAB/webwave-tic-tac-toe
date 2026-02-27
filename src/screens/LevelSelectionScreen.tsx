import React, {useMemo, useState} from 'react';
import {
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
import Icon from '@react-native-vector-icons/ionicons';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AdBanner from '../components/AdBanner';
import {Difficulty, GameMode} from '../types';
import {getContentWidth, scaleSize} from '../theme/responsive';
import {colors, radii, shadows, spacing, typography} from '../theme/tokens';

interface LevelSelectionScreenProps {
  adsReady: boolean;
  onStartGame: (mode: GameMode, difficulty?: Difficulty) => void;
}

type PreviewSymbol = 'O' | 'X';

const LEVELS: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const PREVIEW_PATTERN: PreviewSymbol[] = ['O', 'X', 'O', 'X', 'O', 'X', 'O', 'X', 'O'];

interface PreviewMarkProps {
  symbol: PreviewSymbol;
  size: number;
  emphasized?: boolean;
}

const PreviewNeonMark = ({symbol, size, emphasized = false}: PreviewMarkProps) => {
  if (symbol === 'O') {
    const core = size;
    const glow = Math.round(size * 1.1);
    const outer = Math.round(size * 1.18);
    const coreBorder = Math.max(5, Math.round(size * 0.14));
    const glowBorder = Math.max(coreBorder + 2, Math.round(size * 0.2));
    const outerBorder = Math.max(glowBorder + 2, Math.round(size * 0.24));

    return (
      <View style={[styles.markWrap, {width: outer, height: outer}, emphasized && styles.markWrapEmphasized]}>
        <View style={[styles.oRingLayer, {width: outer, height: outer, borderRadius: outer / 2, borderWidth: outerBorder}, styles.oRingOuter]} />
        <View style={[styles.oRingLayer, {width: glow, height: glow, borderRadius: glow / 2, borderWidth: glowBorder}, styles.oRingGlow]} />
        <View style={[styles.oRingLayer, {width: core, height: core, borderRadius: core / 2, borderWidth: coreBorder}, styles.oRingCore]} />
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
    <View style={[styles.markWrap, {width: outerW, height: outerW}, emphasized && styles.markWrapEmphasized]}>
      <View style={[styles.xStroke, styles.xStrokeOne, {width: outerW, height: outerH, borderRadius: outerH}, styles.xStrokeOuter]} />
      <View style={[styles.xStroke, styles.xStrokeTwo, {width: outerW, height: outerH, borderRadius: outerH}, styles.xStrokeOuter]} />
      <View style={[styles.xStroke, styles.xStrokeOne, {width: glowW, height: glowH, borderRadius: glowH}, styles.xStrokeGlow]} />
      <View style={[styles.xStroke, styles.xStrokeTwo, {width: glowW, height: glowH, borderRadius: glowH}, styles.xStrokeGlow]} />
      <View style={[styles.xStroke, styles.xStrokeOne, {width: coreW, height: coreH, borderRadius: coreH}, styles.xStrokeCore]} />
      <View style={[styles.xStroke, styles.xStrokeTwo, {width: coreW, height: coreH, borderRadius: coreH}, styles.xStrokeCore]} />
    </View>
  );
};

const LevelSelectionScreen = ({adsReady, onStartGame}: LevelSelectionScreenProps) => {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');

  const selectedIndex = useMemo(() => LEVELS.indexOf(selectedDifficulty), [selectedDifficulty]);

  const handlePvAI = () => setShowDifficultyModal(true);
  const handlePvp = () => onStartGame('PVP');
  const confirmPvAI = () => {
    setShowDifficultyModal(false);
    onStartGame('PVAI', selectedDifficulty);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundAlt} translucent={false} hidden={false} />

      <View style={styles.container}>
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.midGlow} />
        <View pointerEvents="none" style={styles.bottomGlow} />
        <View pointerEvents="none" style={styles.sparkA} />
        <View pointerEvents="none" style={styles.sparkB} />
        <View pointerEvents="none" style={styles.sparkC} />

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: compact ? spacing.md : spacing.lg,
              paddingBottom: (compact ? spacing.lg : spacing.xxl) + Math.max(insets.bottom, spacing.sm),
            },
          ]}>
          <View style={[styles.content, {width: contentWidth}]}> 
            <Text style={[styles.title, {fontSize: titleSize}]}>SELECT MODE</Text>
            <Text style={[styles.subtitle, {fontSize: subtitleSize}]}>Choose how you want to play</Text>
            <View pointerEvents="none" style={styles.heroFlare} />

            <View style={[styles.previewWrap, {width: boardSize, height: boardSize}]}> 
              <View pointerEvents="none" style={styles.previewOuterPinkAura} />
              <View pointerEvents="none" style={styles.previewOuterCyanAura} />
              <View style={styles.previewBoard}>
                <View pointerEvents="none" style={styles.previewBoardInnerShade} />
                {PREVIEW_PATTERN.map((symbol, index) => (
                  <View key={`preview-cell-${index}`} style={styles.previewCell}>
                    <View pointerEvents="none" style={styles.previewCellShade} />
                    <PreviewNeonMark symbol={symbol} size={previewMarkSize} emphasized={index === 4} />
                  </View>
                ))}

                <View pointerEvents="none" style={styles.gridOverlay}>
                  <View style={[styles.gridLineVertical, {left: '33.3333%'}]} />
                  <View style={[styles.gridLineVertical, {left: '66.6666%'}]} />
                  <View style={[styles.gridLineHorizontal, {top: '33.3333%'}]} />
                  <View style={[styles.gridLineHorizontal, {top: '66.6666%'}]} />
                </View>
              </View>
            </View>

            <View style={styles.menuStack}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Play against AI"
                style={({pressed}) => [styles.modeButton, styles.modeButtonCyan, pressed && styles.modeButtonPressed]}
                onPress={handlePvAI}>
                <View style={[styles.modeButtonIconOrb, styles.modeButtonIconOrbCyan]}>
                  <Icon name="hardware-chip-outline" size={20} color={colors.cyanPrimary} />
                </View>
                <Text style={[styles.modeButtonText, styles.modeButtonTextCyan, {fontSize: buttonLabelSize}]}>PLAYER VS AI</Text>
                <Icon name="chevron-forward" size={22} color={colors.cyanPrimary} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Play against another player"
                style={({pressed}) => [styles.modeButton, styles.modeButtonPink, pressed && styles.modeButtonPressed]}
                onPress={handlePvp}>
                <View style={[styles.modeButtonIconOrb, styles.modeButtonIconOrbPink]}>
                  <Icon name="people-outline" size={20} color={colors.pinkPrimary} />
                </View>
                <Text style={[styles.modeButtonText, styles.modeButtonTextPink, {fontSize: buttonLabelSize}]}>PLAYER VS PLAYER</Text>
                <Icon name="chevron-forward" size={22} color={colors.pinkPrimary} />
              </Pressable>

              <View style={[styles.modeButton, styles.modeButtonDisabled]}>
                <View style={[styles.modeButtonIconOrb, styles.modeButtonIconOrbDisabled]}>
                  <Icon name="lock-closed-outline" size={18} color="rgba(220, 231, 255, 0.58)" />
                </View>
                <Text style={[styles.modeButtonText, styles.modeButtonTextDisabled, {fontSize: buttonLabelSize - 1}]}>CAMPAIGN (SOON)</Text>
                <Icon name="chevron-forward" size={22} color="rgba(220, 231, 255, 0.38)" />
              </View>
            </View>

            {adsReady ? <AdBanner compact /> : null}
          </View>
        </ScrollView>

        <Modal
          transparent
          visible={showDifficultyModal}
          animationType="fade"
          onRequestClose={() => setShowDifficultyModal(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowDifficultyModal(false)}>
            <Pressable style={[styles.modalCard, {width: Math.min(contentWidth, 380)}]} onPress={() => {}}>
              <View style={styles.modalTopRow}>
                <View style={styles.modalHeaderTag}>
                  <Icon name="sparkles-outline" size={16} color={colors.pinkPrimary} />
                  <Text style={styles.modalHeaderTagText}>PLAYER VS AI</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close difficulty modal"
                  onPress={() => setShowDifficultyModal(false)}
                  style={({pressed}) => [styles.modalCloseButton, pressed && styles.modalCloseButtonPressed]}>
                  <Icon name="close" size={18} color={colors.backgroundAlt} />
                </Pressable>
              </View>

              <Text style={[styles.modalTitle, {fontSize: modalTitleSize}]}>Choose Your Challenge</Text>
              <Text style={styles.modalSubtitle}>Select the AI difficulty for this match</Text>
              <View pointerEvents="none" style={styles.modalFlare} />

              <View style={styles.modalPanel}>
                <Text style={styles.modalPanelLabel}>Difficulty</Text>
                <Text style={[styles.modalDifficultyValue, {fontSize: modalLabelSize}]}>{selectedDifficulty.toUpperCase()}</Text>

                <View style={styles.sliderWrap}>
                  <View pointerEvents="none" style={styles.sliderTrack} />
                  {LEVELS.map((level, index) => {
                    const active = selectedIndex === index;
                    return (
                      <Pressable
                        key={level}
                        accessibilityRole="button"
                        accessibilityLabel={`Set difficulty ${level}`}
                        onPress={() => setSelectedDifficulty(level)}
                        style={styles.sliderNodeHitArea}>
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
                  onPress={confirmPvAI}
                  style={({pressed}) => [styles.modalStartButton, pressed && styles.modeButtonPressed]}>
                  <Text style={styles.modalStartButtonText}>START</Text>
                </Pressable>
              </View>

              <View style={styles.modalHintPill}>
                <Text style={styles.modalHintText}>Improve your strategy and skills</Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
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
    backgroundColor: 'rgba(41, 110, 255, 0.3)',
  },
  midGlow: {
    position: 'absolute',
    width: 460,
    height: 460,
    borderRadius: 460,
    right: -250,
    top: 120,
    backgroundColor: 'rgba(28, 107, 241, 0.22)',
  },
  bottomGlow: {
    position: 'absolute',
    width: 560,
    height: 560,
    borderRadius: 560,
    left: -270,
    bottom: -280,
    backgroundColor: 'rgba(171, 44, 255, 0.25)',
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
    shadowOffset: {width: 0, height: 0},
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
    shadowOffset: {width: 0, height: 0},
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
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.xwide,
    textShadowColor: 'rgba(95, 244, 255, 0.32)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.tracking.normal,
    textAlign: 'center',
  },
  heroFlare: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    width: '74%',
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(80, 222, 255, 0.92)',
    shadowColor: colors.cyanGlow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 9,
    elevation: 6,
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
    borderColor: 'rgba(244, 108, 255, 0.18)',
  },
  previewOuterCyanAura: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.xxl + 8,
    borderWidth: 2,
    borderColor: 'rgba(49, 234, 255, 0.28)',
    ...shadows.cyanStrong,
  },
  previewBoard: {
    width: '100%',
    height: '100%',
    borderRadius: radii.xxl,
    borderWidth: 2,
    borderColor: colors.cyanBorder,
    backgroundColor: 'rgba(4, 17, 71, 0.68)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  previewBoardInnerShade: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.xxl,
    borderWidth: 6,
    borderColor: 'rgba(81, 145, 255, 0.07)',
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
    backgroundColor: 'rgba(7, 31, 96, 0.28)',
  },
  markWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markWrapEmphasized: {
    transform: [{scale: 1.05}],
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
    transform: [{rotate: '45deg'}],
  },
  xStrokeTwo: {
    transform: [{rotate: '-45deg'}],
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
    backgroundColor: 'rgba(39, 207, 255, 0.34)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    marginTop: -1,
    backgroundColor: 'rgba(39, 207, 255, 0.34)',
  },
  menuStack: {
    width: '100%',
    gap: spacing.sm,
  },
  modeButton: {
    minHeight: 60,
    borderRadius: radii.xl,
    borderWidth: 1.8,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  modeButtonCyan: {
    borderColor: colors.cyanPrimary,
    backgroundColor: 'rgba(8, 45, 118, 0.9)',
    ...shadows.cyanSoft,
    ...(Platform.OS === 'android' ? {elevation: 0} : {}),
  },
  modeButtonPink: {
    borderColor: colors.pinkBorder,
    backgroundColor: 'rgba(47, 21, 95, 0.9)',
    ...shadows.pinkSoft,
    ...(Platform.OS === 'android' ? {elevation: 0} : {}),
  },
  modeButtonDisabled: {
    borderColor: 'rgba(148, 166, 214, 0.32)',
    backgroundColor: 'rgba(22, 32, 77, 0.86)',
  },
  modeButtonPressed: {
    opacity: 0.88,
    transform: [{scale: 0.985}],
  },
  modeButtonIconOrb: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonIconOrbCyan: {
    borderColor: 'rgba(58, 235, 255, 0.6)',
    backgroundColor: 'rgba(11, 78, 156, 0.72)',
  },
  modeButtonIconOrbPink: {
    borderColor: 'rgba(244, 108, 255, 0.55)',
    backgroundColor: 'rgba(95, 31, 123, 0.72)',
  },
  modeButtonIconOrbDisabled: {
    borderColor: 'rgba(167, 182, 229, 0.3)',
    backgroundColor: 'rgba(46, 58, 100, 0.36)',
  },
  modeButtonText: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.wide,
  },
  modeButtonTextCyan: {
    textShadowColor: 'rgba(55, 238, 255, 0.22)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 7,
  },
  modeButtonTextPink: {
    textShadowColor: 'rgba(255, 91, 247, 0.2)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 7,
  },
  modeButtonTextDisabled: {
    color: 'rgba(220, 231, 255, 0.58)',
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
    backgroundColor: 'rgba(8, 37, 116, 0.96)',
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
    borderColor: 'rgba(221, 145, 255, 0.35)',
    backgroundColor: 'rgba(71, 30, 111, 0.26)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
  },
  modalHeaderTagText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xs,
    letterSpacing: typography.tracking.tight,
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
    transform: [{scale: 0.96}],
  },
  modalTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.normal,
    textShadowColor: 'rgba(130, 223, 255, 0.26)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  modalSubtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
    letterSpacing: typography.tracking.tight,
  },
  modalFlare: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    width: '72%',
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(76, 225, 255, 0.86)',
    shadowColor: colors.cyanGlow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.75,
    shadowRadius: 8,
    elevation: 5,
  },
  modalPanel: {
    borderRadius: radii.xl,
    borderWidth: 1.4,
    borderColor: 'rgba(100, 223, 255, 0.44)',
    backgroundColor: 'rgba(9, 39, 101, 0.66)',
    padding: spacing.md,
  },
  modalPanelLabel: {
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: typography.tracking.tight,
    fontSize: typography.size.md,
  },
  modalDifficultyValue: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    color: colors.warning,
    fontWeight: typography.weight.heavy,
    textAlign: 'center',
    letterSpacing: typography.tracking.wide,
    textShadowColor: 'rgba(255, 208, 100, 0.32)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
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
    backgroundColor: 'rgba(110, 210, 255, 0.45)',
  },
  sliderNodeHitArea: {
    flex: 1,
    alignItems: 'center',
  },
  sliderNodeOuter: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(174, 194, 255, 0.72)',
    borderWidth: 2,
    borderColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderNodeOuterActive: {
    backgroundColor: 'rgba(255, 219, 105, 0.92)',
    borderColor: colors.textPrimary,
    transform: [{scale: 1.12}],
    shadowColor: 'rgba(255, 211, 104, 0.75)',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.75,
    shadowRadius: 8,
    elevation: 6,
  },
  sliderNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(12, 18, 71, 0.7)',
  },
  sliderNodeInnerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  sliderLabel: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xs,
    letterSpacing: typography.tracking.tight,
  },
  sliderLabelActive: {
    color: colors.textPrimary,
  },
  modalStartButton: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.6,
    borderColor: colors.cyanPrimary,
    backgroundColor: 'rgba(8, 66, 146, 0.88)',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cyanSoft,
  },
  modalStartButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.wide,
    fontSize: typography.size.lg,
  },
  modalHintPill: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(145, 161, 255, 0.28)',
    backgroundColor: 'rgba(16, 20, 72, 0.5)',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  modalHintText: {
    color: 'rgba(230, 240, 255, 0.84)',
    fontWeight: typography.weight.medium,
    letterSpacing: typography.tracking.tight,
    textAlign: 'center',
    fontSize: typography.size.sm,
  },
});

export default LevelSelectionScreen;
