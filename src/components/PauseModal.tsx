import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';
import { radii, spacing, typography } from '../theme/tokens';
import { hexToRgba } from '../theme/themes';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  contentWidth: number;
}

const PauseModal = ({
  visible,
  onResume,
  onRestart,
  onHome,
  contentWidth,
}: PauseModalProps) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  // Staggered items opacity animations
  const item1Anim = useRef(new Animated.Value(0)).current;
  const item2Anim = useRef(new Animated.Value(0)).current;
  const item3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      scaleValue.setValue(0.9);
      opacityValue.setValue(0);
      item1Anim.setValue(0);
      item2Anim.setValue(0);
      item3Anim.setValue(0);

      // Animate modal entry
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Staggered list fade-in
        Animated.stagger(100, [
          Animated.timing(item1Anim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(item2Anim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(item3Anim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [visible, scaleValue, opacityValue, item1Anim, item2Anim, item3Anim]);

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onResume}
    >
      <Pressable style={styles.backdrop} onPress={onResume} android_disableSound={true}>
        <Animated.View
          style={[
            styles.card,
            {
              width: Math.min(contentWidth, 340),
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <View pointerEvents="none" style={styles.panelGlow} />
          
          <View style={styles.header}>
            <View style={styles.headerIconOrb}>
              <Icon name="pause" size={24} color={colors.cyanPrimary} />
            </View>
            <Text style={styles.title}>GAME PAUSED</Text>
            <Text style={styles.subtitle}>Game is paused. Select an option to proceed.</Text>
          </View>

          <View style={styles.buttonStack}>
            {/* Resume Button */}
            <Animated.View style={{ opacity: item1Anim, transform: [{ translateY: item1Anim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }}>
              <Pressable
                onPress={onResume}
                accessibilityRole="button"
                accessibilityLabel="Resume current game"
                style={({ pressed }) => [styles.btn, styles.resumeBtn, pressed && styles.pressed]}
                android_disableSound={true}
              >
                <Icon name="play" size={18} color={colors.cyanBright} />
                <Text style={styles.btnText}>RESUME GAME</Text>
              </Pressable>
            </Animated.View>

            {/* Restart Button */}
            <Animated.View style={{ opacity: item2Anim, transform: [{ translateY: item2Anim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }}>
              <Pressable
                onPress={onRestart}
                accessibilityRole="button"
                accessibilityLabel="Restart game match"
                style={({ pressed }) => [styles.btn, styles.restartBtn, pressed && styles.pressed]}
                android_disableSound={true}
              >
                <Icon name="refresh" size={18} color={colors.pinkPrimary} />
                <Text style={styles.btnText}>RESTART MATCH</Text>
              </Pressable>
            </Animated.View>

            {/* Home/Exit Button */}
            <Animated.View style={{ opacity: item3Anim, transform: [{ translateY: item3Anim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }}>
              <Pressable
                onPress={onHome}
                accessibilityRole="button"
                accessibilityLabel="Exit to main menu"
                style={({ pressed }) => [styles.btn, styles.exitBtn, pressed && styles.pressed]}
                android_disableSound={true}
              >
                <Icon name="home-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.btnText, { color: colors.textSecondary }]}>MAIN MENU</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </Pressable>
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
      borderRadius: radii.xxl,
      borderWidth: 2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceStrong,
      padding: spacing.lg,
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      ...shadows.cyanStrong,
    },
    panelGlow: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      top: -75,
      right: -75,
      backgroundColor: colors.glowPrimary,
      opacity: 0.8,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.lg,
      width: '100%',
    },
    headerIconOrb: {
      width: 54,
      height: 54,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
      ...shadows.cyanSoft,
    },
    title: {
      color: colors.textPrimary,
      fontSize: typography.size.lg + 2,
      letterSpacing: typography.tracking.wide,
      textShadowColor: hexToRgba(colors.cyanGlow, 0.45),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      textAlign: 'center',
      marginTop: spacing.xs,
      fontFamily: typography.family.black,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.size.xs,
      textAlign: 'center',
      marginTop: 4,
      fontFamily: typography.family.medium,
    },
    buttonStack: {
      width: '100%',
      gap: spacing.sm,
    },
    btn: {
      width: '100%',
      paddingVertical: spacing.sm + 2,
      borderRadius: radii.lg,
      borderWidth: 1.6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: 52,
    },
    resumeBtn: {
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurface,
      ...shadows.cyanSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    restartBtn: {
      borderColor: colors.pinkBorder,
      backgroundColor: colors.cardSurfaceAlt,
      ...shadows.pinkSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    exitBtn: {
      borderColor: colors.boardGridLine,
      backgroundColor: colors.cardSurfaceSoft,
    },
    pressed: {
      opacity: 0.82,
      transform: [{ scale: 0.98 }],
    },
    btnText: {
      color: colors.textPrimary,
      fontSize: typography.size.sm,
      letterSpacing: typography.tracking.wide,
      fontFamily: typography.family.black,
    },
  });

export default PauseModal;
