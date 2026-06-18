import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Player } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface SquareProps {
  value: Player;
  onPress: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
  index: number;
}

const Square = ({ value, onPress, isWinningSquare, disabled, index }: SquareProps) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const isX = value === 'X';
  const isO = value === 'O';

  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value) {
      scaleValue.setValue(0.3);
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3.5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [value, scaleValue]);

  // Calculate accessibility label
  const cellNumber = index + 1;
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const stateText = value ? `marked with ${value}` : 'empty';
  const accessibilityLabel = `Row ${row}, Column ${col}, Cell ${cellNumber}, ${stateText}`;

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      disabled={disabled || !!value}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.square, isWinningSquare && styles.winningSquare]}
    >
      {isWinningSquare && <View pointerEvents="none" style={styles.winningGlow} />}

      {isX ? (
        <Animated.View pointerEvents="none" style={[styles.xWrap, { transform: [{ scale: scaleValue }] }]}>
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeOne, styles.xStrokeViolet]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeTwo, styles.xStrokeViolet]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeOne, styles.xStrokeCyan]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeTwo, styles.xStrokeCyan]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeOne, styles.xStrokeCore]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeTwo, styles.xStrokeCore]} />
        </Animated.View>
      ) : null}

      {isO ? (
        <Animated.View pointerEvents="none" style={[styles.oWrap, { transform: [{ scale: scaleValue }] }]}>
          <View pointerEvents="none" style={[styles.oRing, styles.oRingViolet]} />
          <View pointerEvents="none" style={[styles.oRing, styles.oRingCyan]} />
          <View pointerEvents="none" style={[styles.oRing, styles.oRingCore]} />
        </Animated.View>
      ) : null}
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    square: {
      width: '33.3333%',
      height: '33.3333%',
      backgroundColor: colors.cardSurfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    winningSquare: {
      backgroundColor: colors.glowPrimary,
    },
    xWrap: {
      width: '64%',
      height: '64%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    xStroke: {
      position: 'absolute',
      width: '100%',
      height: 11,
      borderRadius: 22,
    },
    xStrokeOne: {
      transform: [{ rotate: '45deg' }],
    },
    xStrokeTwo: {
      transform: [{ rotate: '-45deg' }],
    },
    xStrokeCore: {
      backgroundColor: colors.markCore,
    },
    xStrokeCyan: {
      width: '108%',
      height: 16,
      borderRadius: 28,
      backgroundColor: colors.markXGlow,
    },
    xStrokeViolet: {
      width: '120%',
      height: 22,
      borderRadius: 34,
      backgroundColor: colors.markXOuter,
    },
    oWrap: {
      width: '64%',
      height: '64%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    oRing: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: 999,
      borderWidth: 10,
    },
    oRingCore: {
      borderColor: colors.markCore,
    },
    oRingCyan: {
      width: '110%',
      height: '110%',
      borderWidth: 14,
      borderColor: colors.markOGlow,
    },
    oRingViolet: {
      width: '120%',
      height: '120%',
      borderWidth: 18,
      borderColor: colors.markOOuter,
    },
    winningGlow: {
      position: 'absolute',
      width: '84%',
      height: '84%',
      borderRadius: 999,
      backgroundColor: colors.glowPrimary,
    },
  });

export default memo(Square);
