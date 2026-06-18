import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { Player } from '../types';
import { scaleSize } from '../theme/responsive';
import { radii, spacing, typography } from '../theme/tokens';
import { useTheme } from '../theme/ThemeContext';

interface GameOverModalProps {
  visible: boolean;
  winner: Player | 'Draw';
  onHome: () => void;
  onReplay: () => void;
  titleText?: string;
  resultText?: string;
}

const TACTICAL_TIPS = [
  "Control the central node early to maximize branching vectors.",
  "Secure corner coordinates to establish dual-alignment traps.",
  "Force the opponent into defensive blocks to hijack match tempo.",
  "Check diagonal paths regularly to prevent sudden alignment collapse."
];

const GameOverModal = ({
  visible,
  winner,
  onHome,
  onReplay,
  titleText,
  resultText,
}: GameOverModalProps) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const scaleValue = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Scale-in spring animation
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Continuous rotation for graphic elements
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible, scaleValue, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const titleFontSize = Math.max(22, scaleSize(24, width));
  const winnerFontSize = Math.max(72, scaleSize(80, width));
  const bodyFontSize = Math.max(14, scaleSize(16, width));

  // Determine game state styling/themes
  const isVictory = winner === 'O'; // Human plays O in PvAI and is usually O
  const isDefeat = winner === 'X'; // AI plays X in PvAI
  const isDraw = winner === 'Draw';

  const modalTitleText = useMemo(() => {
    if (titleText) return titleText;
    if (isDraw) return 'EQUILIBRIUM STASIS';
    if (isVictory) return 'ALIGNMENT SUCCESS';
    return 'SINGULARITY DETECTED';
  }, [winner, titleText, isDraw, isVictory]);

  const subtext = useMemo(() => {
    if (isDraw) return 'CHRONO-LOCK INITIATED';
    if (isVictory) return 'NEO-SPACE STABILIZED';
    return 'TIMELINE DECAY DETECTED';
  }, [isDraw, isVictory]);

  const randomTip = useMemo(() => {
    const idx = Math.floor(Math.random() * TACTICAL_TIPS.length);
    return TACTICAL_TIPS[idx];
  }, [visible]);

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onHome}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }]}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: titleFontSize }, isVictory && styles.titleVictory, isDefeat && styles.titleDefeat, isDraw && styles.titleDraw]}>
              {modalTitleText}
            </Text>
            <Text style={styles.subtitle}>{subtext}</Text>
          </View>

          {/* Visual pays-off layout */}
          <View style={styles.visualContainer}>
            {isVictory && (
              <View style={styles.graphicWrap}>
                {/* Rotating stardust vector orbits */}
                <Animated.View style={[styles.orbitRing, { transform: [{ rotate: rotation }] }]}>
                  <View style={[styles.orbitDot, { backgroundColor: colors.cyanPrimary }]} />
                  <View style={[styles.orbitDot, { backgroundColor: colors.cyanPrimary, bottom: 0, top: undefined }]} />
                </Animated.View>
                <View style={styles.iconCircleCyan}>
                  <Icon name="trophy" size={42} color={colors.cyanBright} />
                </View>
              </View>
            )}

            {isDefeat && (
              <View style={styles.graphicWrap}>
                {/* Micro black-hole rotation */}
                <Animated.View style={[styles.blackHoleOuter, { transform: [{ rotate: rotation }] }]}>
                  <View style={styles.blackHoleBlade} />
                  <View style={[styles.blackHoleBlade, { transform: [{ rotate: '90deg' }] }]} />
                  <View style={[styles.blackHoleBlade, { transform: [{ rotate: '180deg' }] }]} />
                  <View style={[styles.blackHoleBlade, { transform: [{ rotate: '270deg' }] }]} />
                </Animated.View>
                <View style={styles.iconCirclePink}>
                  <Icon name="nuclear" size={40} color={colors.pinkPrimary} />
                </View>
              </View>
            )}

            {isDraw && (
              <View style={styles.graphicWrap}>
                {/* Mirroring stasis vector halos */}
                <Animated.View style={[styles.orbitRing, { transform: [{ rotate: rotation }] }]}>
                  <View style={[styles.orbitDot, { backgroundColor: colors.warning }]} />
                  <View style={[styles.orbitDot, { backgroundColor: colors.warning, right: 0, left: undefined }]} />
                </Animated.View>
                <View style={styles.iconCircleWarning}>
                  <Icon name="sync" size={42} color={colors.warning} />
                </View>
              </View>
            )}

            <View style={styles.winnerTextContainer}>
              {winner === 'X' && <Text style={[styles.winnerText, styles.xColor, { fontSize: winnerFontSize }]}>X</Text>}
              {winner === 'O' && <Text style={[styles.winnerText, styles.oColor, { fontSize: winnerFontSize }]}>O</Text>}
              {winner === 'Draw' && <Text style={[styles.drawText, { fontSize: winnerFontSize - 20 }]}>DRAW</Text>}
              <Text style={[styles.resultText, { fontSize: bodyFontSize }]}>
                {resultText ?? (winner === 'Draw' ? 'MUTUAL INTERSECTION' : 'MATCH DOMINATOR')}
              </Text>
            </View>
          </View>

          {/* Tactical tip for defeat */}
          {isDefeat && (
            <View style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Icon name="bulb-outline" size={14} color={colors.warning} />
                <Text style={styles.tipTitle}>TACTICAL ANALYTICS</Text>
              </View>
              <Text style={styles.tipText}>{randomTip}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onHome}
              accessibilityRole="button"
              accessibilityLabel="Go home"
              style={({ pressed }) => [styles.btn, styles.homeBtn, pressed && styles.pressed]}
            >
              <Text style={styles.btnText}>HOME</Text>
            </Pressable>

            <Pressable
              onPress={onReplay}
              accessibilityRole="button"
              accessibilityLabel="Replay round"
              style={({ pressed }) => [styles.btn, styles.replayBtn, pressed && styles.pressed]}
            >
              <Text style={styles.btnText}>REPLAY</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: any, shadows: any) =>
  StyleSheet.create({
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
      borderRadius: radii.xxl,
      borderWidth: 2,
      borderColor: colors.cyanBorder,
      padding: spacing.lg,
      alignItems: 'center',
      ...shadows.cyanStrong,
    },
    header: {
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    title: {
      fontWeight: typography.weight.heavy,
      letterSpacing: typography.tracking.wide,
      textAlign: 'center',
    },
    titleVictory: {
      color: colors.cyanPrimary,
      textShadowColor: colors.cyanGlow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    },
    titleDefeat: {
      color: colors.pinkPrimary,
      textShadowColor: colors.pinkGlow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    },
    titleDraw: {
      color: colors.warning,
      textShadowColor: colors.warning,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    },
    subtitle: {
      color: colors.textSecondary,
      fontWeight: typography.weight.semibold,
      fontSize: 10,
      letterSpacing: 1.2,
      marginTop: 4,
      textTransform: 'uppercase',
    },
    visualContainer: {
      alignItems: 'center',
      width: '100%',
      marginBottom: spacing.md,
    },
    graphicWrap: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      marginBottom: spacing.sm,
    },
    iconCircleCyan: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 1.4,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceSoft,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.cyanSoft,
    },
    iconCirclePink: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 1.4,
      borderColor: colors.pinkBorder,
      backgroundColor: colors.cardSurfaceSoft,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.pinkSoft,
    },
    iconCircleWarning: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 1.4,
      borderColor: colors.warning,
      backgroundColor: colors.cardSurfaceSoft,
      justifyContent: 'center',
      alignItems: 'center',
    },
    orbitRing: {
      position: 'absolute',
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 1.2,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    orbitDot: {
      position: 'absolute',
      top: -4,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    blackHoleOuter: {
      position: 'absolute',
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    blackHoleBlade: {
      position: 'absolute',
      width: 2,
      height: 100,
      backgroundColor: colors.pinkBorder,
      opacity: 0.38,
    },
    winnerTextContainer: {
      alignItems: 'center',
    },
    winnerText: {
      fontWeight: typography.weight.heavy,
      marginBottom: spacing.xs,
      letterSpacing: typography.tracking.wide,
    },
    xColor: {
      color: colors.pinkPrimary,
      textShadowColor: colors.pinkGlow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 14,
    },
    oColor: {
      color: colors.cyanPrimary,
      textShadowColor: colors.cyanGlow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 14,
    },
    drawText: {
      color: colors.warning,
      fontWeight: typography.weight.heavy,
      letterSpacing: typography.tracking.wide,
      marginBottom: spacing.xs,
      textShadowColor: colors.warning,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 12,
    },
    resultText: {
      color: colors.textSecondary,
      fontWeight: typography.weight.bold,
      letterSpacing: typography.tracking.normal,
      textTransform: 'uppercase',
      fontSize: 12,
    },
    tipCard: {
      width: '100%',
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.warning,
      backgroundColor: 'rgba(255, 179, 0, 0.04)',
      padding: spacing.sm,
      marginBottom: spacing.md,
    },
    tipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    tipTitle: {
      color: colors.warning,
      fontWeight: typography.weight.heavy,
      fontSize: 9,
      letterSpacing: 0.8,
    },
    tipText: {
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: typography.weight.semibold,
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
      backgroundColor: colors.cardSurfaceAlt,
      ...shadows.pinkSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    replayBtn: {
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurface,
      ...shadows.cyanSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    pressed: {
      opacity: 0.78,
      transform: [{ scale: 0.98 }],
    },
    btnText: {
      color: colors.textPrimary,
      fontWeight: typography.weight.heavy,
      fontSize: typography.size.sm,
      letterSpacing: typography.tracking.wide,
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
  });

export default GameOverModal;
