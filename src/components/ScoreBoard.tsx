import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GameMode, Player, Score } from '../types';
import { scaleSize } from '../theme/responsive';
import { radii, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';

type Mark = Exclude<Player, null>;

interface ScoreBoardProps {
  score: Score;
  mode: GameMode;
  currentTurn: Mark;
  winner: Player | 'Draw';
  humanMark: Mark;
  aiMark: Mark;
  referenceCellSize: number;
  compact?: boolean;
  dense?: boolean;
}

const ScoreBoard = ({
  score,
  mode,
  currentTurn,
  winner,
  humanMark,
  aiMark,
  referenceCellSize,
  compact = false,
  dense = false,
}: ScoreBoardProps) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const leftSymbol: Mark = mode === 'PVAI' ? humanMark : 'O';
  const rightSymbol: Mark = mode === 'PVAI' ? aiMark : 'X';
  const roundRunning = winner === null;
  const leftActive = roundRunning && currentTurn === leftSymbol;
  const rightActive = roundRunning && currentTurn === rightSymbol;

  const leftLabelText = mode === 'PVAI' ? 'YOU' : 'O';
  const rightLabelText = mode === 'PVAI' ? 'AI' : 'X';
  const leftScoreVal = leftSymbol === 'X' ? score.x : score.o;
  const rightScoreVal = rightSymbol === 'X' ? score.x : score.o;

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact, dense && styles.wrapperDense]}>
      <View style={styles.scoreRow}>
        {/* Left Score Box (YOU) */}
        <View
          style={[
            styles.scoreBox,
            styles.scoreBoxLeft,
            leftActive && styles.scoreBoxLeftActive,
            compact && styles.scoreBoxCompact,
            dense && styles.scoreBoxDense,
          ]}
        >
          <Text style={styles.scoreLabel}>{leftLabelText}</Text>
          <Text style={[styles.scoreVal, { color: colors.cyanPrimary }]}>{leftScoreVal}</Text>
        </View>

        {/* Middle Score Box (DRAW) */}
        <View
          style={[
            styles.scoreBox,
            styles.scoreBoxMiddle,
            compact && styles.scoreBoxCompact,
            dense && styles.scoreBoxDense,
          ]}
        >
          <Text style={styles.scoreLabel}>DRAW</Text>
          <Text style={[styles.scoreVal, { color: colors.warning }]}>{score.draws}</Text>
        </View>

        {/* Right Score Box (AI / P2) */}
        <View
          style={[
            styles.scoreBox,
            styles.scoreBoxRight,
            rightActive && styles.scoreBoxRightActive,
            compact && styles.scoreBoxCompact,
            dense && styles.scoreBoxDense,
          ]}
        >
          <Text style={styles.scoreLabel}>{rightLabelText}</Text>
          <Text style={[styles.scoreVal, { color: colors.pinkPrimary }]}>{rightScoreVal}</Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: any, shadows: any) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      maxWidth: 540,
      alignSelf: 'center',
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
    },
    wrapperCompact: {
      paddingTop: 4,
      paddingBottom: spacing.xs,
    },
    wrapperDense: {
      paddingTop: 2,
      paddingBottom: 2,
    },
    scoreRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
      width: '100%',
      paddingHorizontal: spacing.xs,
    },
    scoreBox: {
      flex: 1,
      borderRadius: radii.md,
      borderWidth: 1.5,
      backgroundColor: colors.cardSurfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      minHeight: 64,
    },
    scoreBoxCompact: {
      paddingVertical: spacing.xs,
      minHeight: 56,
      borderRadius: radii.sm,
    },
    scoreBoxDense: {
      paddingVertical: 4,
      minHeight: 48,
      borderWidth: 1.2,
    },
    scoreBoxLeft: {
      borderColor: 'rgba(44, 236, 255, 0.22)',
    },
    scoreBoxMiddle: {
      borderColor: 'rgba(255, 203, 85, 0.22)',
    },
    scoreBoxRight: {
      borderColor: 'rgba(244, 108, 255, 0.22)',
    },
    scoreBoxLeftActive: {
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurface,
      ...shadows.cyanSoft,
      ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
    },
    scoreBoxRightActive: {
      borderColor: colors.pinkPrimary,
      backgroundColor: colors.cardSurfaceAlt,
      ...shadows.pinkSoft,
      ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
    },
    scoreLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 3,
      fontFamily: typography.family.black,
    },
    scoreVal: {
      fontSize: 18,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontFamily: typography.family.black,
    },
  });

export default ScoreBoard;
