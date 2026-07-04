import React, { useMemo } from 'react';
import { ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const BACKGROUND_IMG = require('../assets/images/bgr_1.png');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radii, spacing, typography } from '../theme/tokens';
import { getContentWidth, scaleSize } from '../theme/responsive';
import AdBanner from '../components/AdBanner';
import { useGameSounds } from '../hooks/useGameSounds';
import { hexToRgba } from '../theme/themes';

interface GameSelectionScreenProps {
  onSelectGame: (game: 'TIC_TAC_TOE' | 'WATER_SORT' | 'LUDO') => void;
  adsReady: boolean;
  onOpenSettings: () => void;
  soundEnabled: boolean;
}

const GameSelectionScreen = ({ onSelectGame, adsReady, onOpenSettings, soundEnabled }: GameSelectionScreenProps) => {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const { playSound } = useGameSounds(soundEnabled);

  const contentWidth = getContentWidth(width, 16, 560);
  const compact = height < 760;

  const titleSize = Math.max(26, scaleSize(compact ? 30 : 34, width));
  const subtitleSize = Math.max(12, scaleSize(compact ? 12 : 14, width));

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundAlt} translucent={false} hidden={false} />

      <View style={styles.container}>
        <ImageBackground source={BACKGROUND_IMG} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.midGlow} />
        <View pointerEvents="none" style={styles.bottomGlow} />

        {/* Floating Settings Gear */}
        <Pressable
          onPress={() => {
            playSound('tap');
            onOpenSettings();
          }}
          accessibilityRole="button"
          accessibilityLabel="Open Settings"
          style={({ pressed }) => [styles.floatingSettingsBtn, pressed && styles.settingsPressed]}
          android_disableSound={true}
        >
          <Icon name="settings-outline" size={20} color={colors.cyanBright} />
        </Pressable>

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: compact ? spacing.sm : spacing.md,
              paddingBottom: spacing.xl,
            },
          ]}
        >
          <View style={[styles.content, { width: contentWidth }]}>
            {/* Neural Hub Header */}
            <View style={styles.header}>
              <View style={styles.hubBadge}>
                <Icon name="pulse-outline" size={14} color={colors.cyanPrimary} />
                <Text style={styles.hubBadgeText}>WEBWAVE HUB</Text>
              </View>
              <Text style={[styles.title, { fontSize: titleSize }]}>WEBWAVE GLOBAL</Text>
              <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
                Enjoy classic puzzle and board games with neon styles.
              </Text>
              <View pointerEvents="none" style={styles.divider} />
            </View>

            {/* Games Stack */}
            <View style={styles.gamesStack}>
              {/* Tic Tac Toe Module */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Tic Tac Toe"
                style={({ pressed }) => [styles.gameCard, styles.cardCyan, pressed && styles.cardPressed]}
                onPress={() => {
                  playSound('tap');
                  onSelectGame('TIC_TAC_TOE');
                }}
                android_disableSound={true}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconOrb, styles.orbCyan]}>
                    <Icon name="grid-outline" size={26} color={colors.cyanPrimary} />
                  </View>
                  <View style={styles.textWrap}>
                    <Text style={styles.cardTitleCyan}>TIC TAC TOE</Text>
                    <Text style={styles.cardDesc}>Place X and O marks on a 3x3 grid to win the match.</Text>
                    <View style={styles.moduleTag}>
                      <Text style={[styles.moduleTagText, { color: colors.cyanPrimary }]}>NEON BOARD</Text>
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.cyanPrimary} />
                </View>
              </Pressable>

              {/* Water Sort Module */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Water Sort"
                style={({ pressed }) => [styles.gameCard, styles.cardPink, pressed && styles.cardPressed]}
                onPress={() => {
                  playSound('tap');
                  onSelectGame('WATER_SORT');
                }}
                android_disableSound={true}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconOrb, styles.orbPink]}>
                    <Icon name="flask-outline" size={26} color={colors.pinkPrimary} />
                  </View>
                  <View style={styles.textWrap}>
                    <Text style={styles.cardTitlePink}>WATER SORT</Text>
                    <Text style={styles.cardDesc}>Sort colored water elements inside vials to clear the screen.</Text>
                    <View style={[styles.moduleTag, { borderColor: 'rgba(255, 117, 195, 0.15)', backgroundColor: 'rgba(255, 117, 195, 0.03)' }]}>
                      <Text style={[styles.moduleTagText, { color: colors.pinkPrimary }]}>COLOR PUZZLE</Text>
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.pinkPrimary} />
                </View>
              </Pressable>

              {/* Ludo Module */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Ludo"
                style={({ pressed }) => [styles.gameCard, styles.cardWarning, pressed && styles.cardPressed]}
                onPress={() => {
                  playSound('tap');
                  onSelectGame('LUDO');
                }}
                android_disableSound={true}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconOrb, styles.orbWarning]}>
                    <Icon name="disc-outline" size={26} color={colors.warning} />
                  </View>
                  <View style={styles.textWrap}>
                    <Text style={styles.cardTitleWarning}>LUDO</Text>
                    <Text style={styles.cardDesc}>Roll the dice and race your tokens around the 15x15 board.</Text>
                    <View style={[styles.moduleTag, { borderColor: 'rgba(255, 179, 0, 0.15)', backgroundColor: 'rgba(255, 179, 0, 0.03)' }]}>
                      <Text style={[styles.moduleTagText, { color: colors.warning }]}>NEON BOARD</Text>
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.warning} />
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Ad space fixed */}
        {adsReady && (
          <View style={styles.adWrap}>
            <AdBanner compact />
          </View>
        )}
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
      top: 200,
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
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    content: {
      alignSelf: 'center',
      alignItems: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.lg,
      width: '100%',
    },
    hubBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceSoft,
      paddingVertical: 4,
      paddingHorizontal: 10,
      marginBottom: spacing.sm,
      ...shadows.cyanSoft,
    },
    hubBadgeText: {
      color: colors.textPrimary,
      fontSize: 9,
      letterSpacing: 1,
      fontFamily: typography.family.black,
    },
    title: {
      color: colors.textPrimary,
      letterSpacing: typography.tracking.xwide,
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      textAlign: 'center',
      fontFamily: typography.family.black,
    },
    subtitle: {
      marginTop: 6,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.md,
      lineHeight: 18,
      fontFamily: typography.family.semibold,
    },
    divider: {
      marginTop: spacing.md,
      width: '90%',
      height: 1.5,
      borderRadius: radii.pill,
      backgroundColor: colors.cyanSoft,
      shadowColor: colors.cyanGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
      elevation: 4,
    },
    gamesStack: {
      width: '100%',
      gap: spacing.md,
    },
    gameCard: {
      borderRadius: radii.xxl,
      borderWidth: 1.8,
      padding: spacing.md,
      overflow: 'hidden',
    },
    cardCyan: {
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurface,
      ...shadows.cyanSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    cardPink: {
      borderColor: colors.pinkBorder,
      backgroundColor: colors.cardSurfaceAlt,
      ...shadows.pinkSoft,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    cardWarning: {
      borderColor: colors.warning,
      backgroundColor: colors.cardSurface,
    },
    cardPressed: {
      opacity: 0.86,
      transform: [{ scale: 0.985 }],
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconOrb: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 1.2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orbCyan: {
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceSoft,
    },
    orbPink: {
      borderColor: colors.pinkBorder,
      backgroundColor: colors.cardSurfaceSoft,
    },
    orbWarning: {
      borderColor: colors.warning,
      backgroundColor: colors.cardSurfaceSoft,
    },
    textWrap: {
      flex: 1,
      marginLeft: spacing.md,
      marginRight: spacing.xs,
    },
    cardTitleCyan: {
      color: colors.cyanPrimary,
      fontSize: typography.size.md,
      letterSpacing: typography.tracking.wide,
      textShadowColor: hexToRgba(colors.cyanGlow, 0.4),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
      fontFamily: typography.family.bold,
    },
    cardTitlePink: {
      color: colors.pinkPrimary,
      fontSize: typography.size.md,
      letterSpacing: typography.tracking.wide,
      textShadowColor: hexToRgba(colors.pinkGlow, 0.4),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
      fontFamily: typography.family.bold,
    },
    cardTitleWarning: {
      color: colors.warning,
      fontSize: typography.size.md,
      letterSpacing: typography.tracking.wide,
      textShadowColor: hexToRgba(colors.warning, 0.4),
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
      fontFamily: typography.family.bold,
    },
    cardDesc: {
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 14,
      marginTop: 3,
      fontFamily: typography.family.semibold,
    },
    moduleTag: {
      alignSelf: 'flex-start',
      marginTop: 8,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: 'rgba(0, 245, 255, 0.15)',
      backgroundColor: 'rgba(0, 245, 255, 0.03)',
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    moduleTagText: {
      fontSize: 8,
      letterSpacing: 0.5,
      fontFamily: typography.family.bold,
    },
    adWrap: {
      width: '100%',
      alignItems: 'center',
    },
    adWrapFixed: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      // paddingVertical: spacing.xs,
      backgroundColor: colors.backgroundAlt,
      // borderTopWidth: 1.2,
      // borderTopColor: 'rgba(255, 255, 255, 0.06)',
    },
    floatingSettingsBtn: {
      position: 'absolute',
      top: 14,
      right: 16,
      width: 42,
      height: 42,
      borderRadius: radii.md,
      borderWidth: 1.2,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      backgroundColor: colors.cardSurfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
    },
    settingsPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
  });

export default GameSelectionScreen;
