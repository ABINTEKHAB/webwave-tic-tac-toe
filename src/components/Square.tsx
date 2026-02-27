import React, {memo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Player} from '../types';
import {colors} from '../theme/tokens';

interface SquareProps {
  value: Player;
  onPress: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}

const Square = ({value, onPress, isWinningSquare, disabled}: SquareProps) => {
  const isX = value === 'X';
  const isO = value === 'O';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      disabled={disabled || !!value}
      style={[styles.square, isWinningSquare && styles.winningSquare]}>
      {isWinningSquare && <View pointerEvents="none" style={styles.winningGlow} />}

      {isX ? (
        <View pointerEvents="none" style={styles.xWrap}>
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeOne, styles.xStrokeViolet]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeTwo, styles.xStrokeViolet]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeOne, styles.xStrokeCyan]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeTwo, styles.xStrokeCyan]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeOne, styles.xStrokeCore]} />
          <View pointerEvents="none" style={[styles.xStroke, styles.xStrokeTwo, styles.xStrokeCore]} />
        </View>
      ) : null}

      {isO ? (
        <View pointerEvents="none" style={styles.oWrap}>
          <View pointerEvents="none" style={[styles.oRing, styles.oRingViolet]} />
          <View pointerEvents="none" style={[styles.oRing, styles.oRingCyan]} />
          <View pointerEvents="none" style={[styles.oRing, styles.oRingCore]} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  square: {
    width: '33.3333%',
    height: '33.3333%',
    backgroundColor: 'rgba(8, 25, 88, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  winningSquare: {
    backgroundColor: 'rgba(77, 242, 255, 0.1)',
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
    transform: [{rotate: '45deg'}],
  },
  xStrokeTwo: {
    transform: [{rotate: '-45deg'}],
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
    backgroundColor: 'rgba(131, 245, 255, 0.12)',
  },
});

export default memo(Square);
