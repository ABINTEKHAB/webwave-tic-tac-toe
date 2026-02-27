import React from 'react';
import {Platform, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {GameMode, Player, Score} from '../types';
import {scaleSize} from '../theme/responsive';
import {colors, radii, shadows, spacing, typography} from '../theme/tokens';

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

interface SideProps {
  symbol: Mark;
  label: string;
  active: boolean;
  tone: 'cyan' | 'pink';
  dense: boolean;
  sideHeight: number;
  markSize: number;
  ringSize: number;
  ringBorderWidth: number;
  strokeWidth: number;
  strokeHeight: number;
  labelFontSize: number;
}

interface NeonMarkProps {
  symbol: Mark;
  tone: 'cyan' | 'pink';
  active: boolean;
  markSize: number;
  ringSize: number;
  ringBorderWidth: number;
  strokeWidth: number;
  strokeHeight: number;
}

const NeonMark = ({
  symbol,
  active,
  markSize,
  ringSize,
  ringBorderWidth,
  strokeWidth,
  strokeHeight,
}: NeonMarkProps) => {
  if (symbol === 'O') {
    const outerSize = Math.round(ringSize * 1.18);
    const glowSize = Math.round(ringSize * 1.08);
    const outerBorderWidth = Math.max(ringBorderWidth + 4, Math.round(ringBorderWidth * 1.5));
    const glowBorderWidth = Math.max(ringBorderWidth + 2, Math.round(ringBorderWidth * 1.25));

    return (
      <View style={[styles.topORingWrap, {width: outerSize, height: outerSize}, active && styles.topMarkActive]}>
        <View
          style={[
            styles.topORingBase,
            {
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              borderWidth: outerBorderWidth,
            },
            styles.topORingOuter,
          ]}
        />
        <View
          style={[
            styles.topORingBase,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              borderWidth: glowBorderWidth,
            },
            styles.topORingGlow,
          ]}
        />
        <View
          style={[
            styles.topORingBase,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderWidth: ringBorderWidth,
            },
            styles.topORingCore,
          ]}
        />
      </View>
    );
  }

  const outerWidth = Math.round(strokeWidth * 1.16);
  const glowWidth = Math.round(strokeWidth * 1.08);
  const outerHeight = strokeHeight + 6;
  const glowHeight = strokeHeight + 3;

  return (
    <View style={[styles.topXWrap, {width: markSize, height: markSize}, active && styles.topMarkActive]}>
      <View style={[styles.topXStroke, styles.topXStrokeOne, {width: outerWidth, height: outerHeight, borderRadius: outerHeight}, styles.topXStrokeOuter]} />
      <View style={[styles.topXStroke, styles.topXStrokeTwo, {width: outerWidth, height: outerHeight, borderRadius: outerHeight}, styles.topXStrokeOuter]} />
      <View style={[styles.topXStroke, styles.topXStrokeOne, {width: glowWidth, height: glowHeight, borderRadius: glowHeight}, styles.topXStrokeGlow]} />
      <View style={[styles.topXStroke, styles.topXStrokeTwo, {width: glowWidth, height: glowHeight, borderRadius: glowHeight}, styles.topXStrokeGlow]} />
      <View style={[styles.topXStroke, styles.topXStrokeOne, {width: strokeWidth, height: strokeHeight, borderRadius: strokeHeight}, styles.topXStrokeCore]} />
      <View style={[styles.topXStroke, styles.topXStrokeTwo, {width: strokeWidth, height: strokeHeight, borderRadius: strokeHeight}, styles.topXStrokeCore]} />
    </View>
  );
};

const ScoreSide = ({
  symbol,
  label,
  active,
  tone,
  dense,
  sideHeight,
  markSize,
  ringSize,
  ringBorderWidth,
  strokeWidth,
  strokeHeight,
  labelFontSize,
}: SideProps) => (
  <View
    style={[
      styles.sideWrap,
      dense && styles.sideWrapDense,
      {minHeight: sideHeight},
      active && styles.sideWrapActive,
      tone === 'pink' && styles.sideWrapPink,
      active && tone === 'pink' && styles.sideWrapPinkActive,
    ]}>
    <View style={[styles.sideMarkArea, dense && styles.sideMarkAreaDense]}>
      <NeonMark
        symbol={symbol}
        tone={tone}
        active={active}
        markSize={markSize}
        ringSize={ringSize}
        ringBorderWidth={ringBorderWidth}
        strokeWidth={strokeWidth}
        strokeHeight={strokeHeight}
      />
    </View>
    <Text
      style={[
        styles.sideLabel,
        tone === 'pink' ? styles.sideLabelPink : styles.sideLabelCyan,
        dense && styles.sideLabelDense,
        {fontSize: labelFontSize},
      ]}>
      {label}
    </Text>
  </View>
);

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
  const {width} = useWindowDimensions();
  const ringMin = dense ? 48 : compact ? 56 : 76;
  const ringMax = dense ? 84 : compact ? 94 : 118;
  const xMin = dense ? 46 : compact ? 52 : 72;
  const xMax = dense ? 86 : compact ? 98 : 124;
  const boardBasedRing = Math.round(referenceCellSize * 0.58);
  const boardBasedX = Math.round(referenceCellSize * 0.62);
  const ringSize = Math.max(ringMin, Math.min(ringMax, boardBasedRing));
  const ringBorderWidth = dense ? 7 : compact ? 8 : 10;
  const strokeWidth = Math.max(xMin, Math.min(xMax, boardBasedX));
  const markSize = strokeWidth;
  const strokeHeight = dense ? 7 : compact ? 8 : 11;
  const sideHeight = dense
    ? Math.max(scaleSize(82, width), ringSize + 22)
    : compact
    ? Math.max(scaleSize(96, width), ringSize + 28)
    : Math.max(scaleSize(136, width), ringSize + 44);
  const labelFontSize = dense
    ? Math.max(9, scaleSize(10, width))
    : compact
    ? Math.max(10, scaleSize(10, width))
    : Math.max(12, scaleSize(12, width));
  const vsFontSize = dense
    ? Math.max(20, scaleSize(22, width))
    : compact
    ? Math.max(22, scaleSize(25, width))
    : Math.max(28, scaleSize(34, width));
  const metaFontSize = dense
    ? Math.max(9, scaleSize(9, width))
    : compact
    ? Math.max(9, scaleSize(10, width))
    : Math.max(11, scaleSize(12, width));

  const leftSymbol: Mark = mode === 'PVAI' ? humanMark : 'O';
  const rightSymbol: Mark = mode === 'PVAI' ? aiMark : 'X';
  const roundRunning = winner === null;
  const leftActive = roundRunning && currentTurn === leftSymbol;
  const rightActive = roundRunning && currentTurn === rightSymbol;

  const leftOwner = mode === 'PVAI' ? 'PLAYER' : 'PLAYER O';
  const rightOwner = mode === 'PVAI' ? 'AI' : 'PLAYER X';
  const xOwner = mode === 'PVAI' ? (aiMark === 'X' ? 'AI' : 'YOU') : 'X';
  const oOwner = mode === 'PVAI' ? (aiMark === 'O' ? 'AI' : 'YOU') : 'O';

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact, dense && styles.wrapperDense]}>
      <View style={[styles.duelRow, compact && styles.duelRowCompact, dense && styles.duelRowDense]}>
        <ScoreSide
          symbol={leftSymbol}
          label={leftOwner}
          active={leftActive}
          tone="cyan"
          dense={dense}
          sideHeight={sideHeight}
          markSize={markSize}
          ringSize={ringSize}
          ringBorderWidth={ringBorderWidth}
          strokeWidth={strokeWidth}
          strokeHeight={strokeHeight}
          labelFontSize={labelFontSize}
        />
        <View style={[styles.vsWrap, dense && styles.vsWrapDense]}>
          <Text style={[styles.vsText, {fontSize: vsFontSize}]}>VS</Text>
        </View>
        <ScoreSide
          symbol={rightSymbol}
          label={rightOwner}
          active={rightActive}
          tone="pink"
          dense={dense}
          sideHeight={sideHeight}
          markSize={markSize}
          ringSize={ringSize}
          ringBorderWidth={ringBorderWidth}
          strokeWidth={strokeWidth}
          strokeHeight={strokeHeight}
          labelFontSize={labelFontSize}
        />
      </View>

      <View style={[styles.metaRow, compact && styles.metaRowCompact, dense && styles.metaRowDense]}>
        <View style={[styles.metaPill, compact && styles.metaPillCompact, dense && styles.metaPillDense]}>
          <Text style={[styles.metaText, {fontSize: metaFontSize}]}>
            {xOwner} {score.x}
          </Text>
        </View>
        <View style={[styles.metaPill, compact && styles.metaPillCompact, dense && styles.metaPillDense]}>
          <Text style={[styles.metaText, {fontSize: metaFontSize}]}>DRAW {score.draws}</Text>
        </View>
        <View style={[styles.metaPill, compact && styles.metaPillCompact, dense && styles.metaPillDense]}>
          <Text style={[styles.metaText, {fontSize: metaFontSize}]}>
            {oOwner} {score.o}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    paddingTop: spacing.xs / 2,
    paddingBottom: spacing.sm,
  },
  wrapperCompact: {
    paddingTop: 2,
    paddingBottom: spacing.xs,
  },
  wrapperDense: {
    paddingTop: 0,
    paddingBottom: 2,
  },
  duelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  duelRowCompact: {
    paddingHorizontal: 4,
  },
  duelRowDense: {
    paddingHorizontal: 2,
  },
  sideWrap: {
    width: '35%',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(68, 231, 255, 0.58)',
    backgroundColor: colors.cardSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  sideWrapDense: {
    borderRadius: radii.lg,
  },
  sideWrapPink: {
    borderColor: 'rgba(255, 131, 202, 0.55)',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sideWrapActive: {
    backgroundColor: 'rgba(8, 44, 117, 0.64)',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sideWrapPinkActive: {
    backgroundColor: 'rgba(79, 27, 106, 0.42)',
  },
  topMarkActive: {
    transform: [{scale: 1.04}],
  },
  topXWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topXStroke: {
    position: 'absolute',
  },
  topXStrokeOne: {
    transform: [{rotate: '45deg'}],
  },
  topXStrokeTwo: {
    transform: [{rotate: '-45deg'}],
  },
  topXStrokeOuter: {
    backgroundColor: colors.markXOuter,
  },
  topXStrokeGlow: {
    backgroundColor: colors.markXGlow,
  },
  topXStrokeCore: {
    backgroundColor: colors.markCore,
  },
  topORingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topORingBase: {
    position: 'absolute',
  },
  sideMarkArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  sideMarkAreaDense: {
    paddingBottom: 8,
  },
  topORingOuter: {
    borderColor: colors.markOOuter,
  },
  topORingGlow: {
    borderColor: colors.markOGlow,
  },
  topORingCore: {
    borderColor: colors.markCore,
  },
  sideLabel: {
    position: 'absolute',
    bottom: 2,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.normal,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 9,
  },
  sideLabelCyan: {
    color: colors.cyanPrimary,
    textShadowColor: 'rgba(55, 238, 255, 0.48)',
  },
  sideLabelPink: {
    color: colors.pinkPrimary,
    textShadowColor: 'rgba(255, 91, 247, 0.46)',
  },
  sideLabelDense: {
    bottom: 1,
  },
  vsWrap: {
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsWrapDense: {
    width: '16%',
  },
  vsText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.xwide,
    textShadowColor: 'rgba(143, 232, 255, 0.76)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 12,
  },
  metaRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  metaRowCompact: {
    marginTop: 6,
    gap: 6,
  },
  metaRowDense: {
    marginTop: 4,
    gap: 4,
  },
  metaPill: {
    flex: 1,
    borderRadius: radii.sm + 1,
    borderWidth: 1.2,
    borderColor: colors.cyanBorder,
    backgroundColor: 'rgba(8, 44, 113, 0.9)',
    paddingVertical: spacing.xs,
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.cyanSoft,
    ...(Platform.OS === 'android' ? {elevation: 0} : {}),
  },
  metaPillCompact: {
    paddingVertical: 5,
  },
  metaPillDense: {
    paddingVertical: 4,
    borderWidth: 1,
  },
  metaText: {
    color: colors.textAccent,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.normal,
  },
});

export default ScoreBoard;
