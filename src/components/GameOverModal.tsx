import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {Player} from '../types';
import {scaleSize} from '../theme/responsive';
import {colors, radii, shadows, spacing, typography} from '../theme/tokens';

interface GameOverModalProps {
  visible: boolean;
  winner: Player | 'Draw';
  onHome: () => void;
  onReplay: () => void;
  titleText?: string;
  resultText?: string;
}

const GameOverModal = ({
  visible,
  winner,
  onHome,
  onReplay,
  titleText,
  resultText,
}: GameOverModalProps) => {
  const {width} = useWindowDimensions();
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible, scaleValue]);

  const titleFontSize = Math.max(22, scaleSize(24, width));
  const winnerFontSize = Math.max(72, scaleSize(80, width));
  const bodyFontSize = Math.max(15, scaleSize(18, width));
  const modalTitleText = titleText ?? (winner === 'Draw' ? 'ROUND DRAW' : 'GAME OVER');
  const modalResultText = resultText ?? (winner === 'Draw' ? 'NO WINNER THIS ROUND' : 'WINNER');

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onHome}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, {transform: [{scale: scaleValue}]}]}>
          <View style={styles.header}>
            <Text style={[styles.title, {fontSize: titleFontSize}]}>{modalTitleText}</Text>
          </View>

          <View style={styles.winnerContainer}>
            {winner === 'X' && <Text style={[styles.winnerText, styles.xColor, {fontSize: winnerFontSize}]}>X</Text>}
            {winner === 'O' && <Text style={[styles.winnerText, styles.oColor, {fontSize: winnerFontSize}]}>O</Text>}
            {winner === 'Draw' && <Text style={[styles.drawText, {fontSize: winnerFontSize - 10}]}>DRAW</Text>}
            <Text style={[styles.resultText, {fontSize: bodyFontSize}]}>{modalResultText}</Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onHome}
              accessibilityRole="button"
              accessibilityLabel="Go home"
              style={({pressed}) => [styles.btn, styles.homeBtn, pressed && styles.pressed]}>
              <Text style={styles.btnText}>HOME</Text>
            </Pressable>

            <Pressable
              onPress={onReplay}
              accessibilityRole="button"
              accessibilityLabel="Replay round"
              style={({pressed}) => [styles.btn, styles.replayBtn, pressed && styles.pressed]}>
              <Text style={styles.btnText}>REPLAY</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.cardSurfaceStrong,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.cyanBorder,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.cyanStrong,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.wide,
    textShadowColor: 'rgba(156, 229, 255, 0.45)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  winnerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  winnerText: {
    fontWeight: typography.weight.heavy,
    marginBottom: spacing.xs,
    letterSpacing: typography.tracking.wide,
  },
  xColor: {
    color: colors.markXPrimary,
    textShadowColor: colors.pinkGlow,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 14,
  },
  oColor: {
    color: colors.markOPrimary,
    textShadowColor: colors.cyanGlow,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 14,
  },
  drawText: {
    color: colors.warning,
    fontWeight: typography.weight.heavy,
    letterSpacing: typography.tracking.wide,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(255, 208, 100, 0.45)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 12,
  },
  resultText: {
    color: colors.textSecondary,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.tracking.normal,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    overflow: 'hidden',
  },
  homeBtn: {
    borderColor: colors.pinkPrimary,
    backgroundColor: 'rgba(94, 23, 110, 0.86)',
    ...shadows.pinkSoft,
    ...(Platform.OS === 'android' ? {elevation: 0} : {}),
  },
  replayBtn: {
    borderColor: colors.cyanPrimary,
    backgroundColor: 'rgba(12, 70, 152, 0.86)',
    ...shadows.cyanSoft,
    ...(Platform.OS === 'android' ? {elevation: 0} : {}),
  },
  pressed: {
    opacity: 0.78,
    transform: [{scale: 0.98}],
  },
  btnText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.heavy,
    fontSize: typography.size.sm,
    letterSpacing: typography.tracking.wide,
    textShadowColor: 'rgba(128, 213, 255, 0.32)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
});

export default GameOverModal;
