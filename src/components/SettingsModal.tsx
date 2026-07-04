import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';
import { radii, spacing, typography } from '../theme/tokens';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor: string;
  inactiveColor: string;
  thumbColorActive: string;
  thumbColorInactive: string;
}

const CustomSwitch = ({
  value,
  onValueChange,
  activeColor,
  inactiveColor,
  thumbColorActive,
  thumbColorInactive,
}: CustomSwitchProps) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} android_disableSound={true}>
      <Animated.View
        style={{
          width: 46,
          height: 26,
          borderRadius: 13,
          backgroundColor,
          padding: 2,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: value ? thumbColorActive : thumbColorInactive,
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.5,
            elevation: 2,
          }}
        />
      </Animated.View>
    </Pressable>
  );
};

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  onToggleSound: (value: boolean) => void;
  onToggleVibration: (value: boolean) => void;
  onResetMatch: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenPrivacyOptions: () => void;
  shouldRenderAds: boolean;
  contentWidth: number;
  settingsTitleSize: number;
}

const SettingsModal = ({
  visible,
  onClose,
  soundEnabled,
  vibrationEnabled,
  onToggleSound,
  onToggleVibration,
  onResetMatch,
  onOpenPrivacyPolicy,
  onOpenPrivacyOptions,
  shouldRenderAds,
  contentWidth,
  settingsTitleSize,
}: SettingsModalProps) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.settingsBackdrop} onPress={onClose} android_disableSound={true}>
        <Pressable
          style={[styles.settingsCard, { width: Math.min(contentWidth, 360) }]}
          onPress={() => { }}
          android_disableSound={true}
        >
          <View style={styles.settingsHeaderRow}>
            <Text style={[styles.settingsTitle, { fontSize: settingsTitleSize }]}>GAME SETTINGS</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close game settings"
              style={({ pressed }) => [styles.settingsCloseBtn, pressed && styles.settingsCloseBtnPressed]}
              android_disableSound={true}
            >
              <Icon name="close" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Text style={styles.settingsSubtitle}>Control haptics, sounds, and active themes.</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.settingsScroll}>
            {/* AUDIO & SENSORY CHANNELS */}
            <View style={styles.sectionHeader}>
              <Icon name="volume-medium-outline" size={14} color={colors.cyanPrimary} />
              <Text style={styles.sectionTitleText}>AUDIO & SENSORY</Text>
            </View>
            <View style={styles.sectionContainer}>
              {/* Sound Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingLabelRow}>
                  <View style={styles.settingIconWrap}>
                    <Icon name="volume-high-outline" size={16} color={colors.cyanPrimary} />
                  </View>
                  <View style={styles.settingTextWrap}>
                    <Text style={styles.settingLabel}>Sound Effects</Text>
                    <Text style={styles.settingHint}>Move, win, draw and tap sounds</Text>
                  </View>
                </View>
                <CustomSwitch
                  value={soundEnabled}
                  onValueChange={onToggleSound}
                  activeColor={colors.cyanBorder}
                  inactiveColor="rgba(153, 174, 206, 0.38)"
                  thumbColorActive={colors.cyanBright}
                  thumbColorInactive="#b7c8df"
                />
              </View>


              {/* Vibration Toggle */}
              <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                <View style={styles.settingLabelRow}>
                  <View style={styles.settingIconWrap}>
                    <Icon name="phone-portrait-outline" size={16} color={colors.pinkPrimary} />
                  </View>
                  <View style={styles.settingTextWrap}>
                    <Text style={styles.settingLabel}>Vibration</Text>
                    <Text style={styles.settingHint}>Tap and round-result haptics</Text>
                  </View>
                </View>
                <CustomSwitch
                  value={vibrationEnabled}
                  onValueChange={onToggleVibration}
                  activeColor={colors.pinkBorder}
                  inactiveColor="rgba(153, 174, 206, 0.38)"
                  thumbColorActive={colors.textPrimary}
                  thumbColorInactive="#c7cde2"
                />
              </View>
            </View>



            {/* SYSTEM NODES */}
            <View style={styles.sectionHeader}>
              <Icon name="construct-outline" size={14} color={colors.warning} />
              <Text style={styles.sectionTitleText}>SYSTEM NODES</Text>
            </View>
            <View style={styles.sectionContainer}>


              {/* Privacy Policy */}
              <Pressable
                onPress={onOpenPrivacyPolicy}
                accessibilityRole="button"
                accessibilityLabel="Open privacy policy website page"
                style={({ pressed }) => [styles.settingsPolicyBtn, pressed && styles.settingsResetBtnPressed]}
                android_disableSound={true}
              >
                <Icon name="document-text-outline" size={18} color={colors.cyanPrimary} />
                <Text style={styles.settingsPolicyText}>PRIVACY POLICY</Text>
              </Pressable>

              {/* Consent */}
              {shouldRenderAds && (
                <Pressable
                  onPress={onOpenPrivacyOptions}
                  accessibilityRole="button"
                  accessibilityLabel="Manage ad consent and privacy choices"
                  style={({ pressed }) => [styles.settingsPrivacyBtn, pressed && styles.settingsResetBtnPressed]}
                  android_disableSound={true}
                >
                  <Icon name="shield-checkmark-outline" size={18} color={colors.pinkPrimary} />
                  <Text style={styles.settingsPrivacyText}>MANAGE AD CONSENT</Text>
                </Pressable>
              )}
            </View>

            {/* Reset Match */}
            <Pressable
              onPress={onResetMatch}
              accessibilityRole="button"
              accessibilityLabel="Reset score and start a new match"
              style={({ pressed }) => [styles.settingsResetBtn, pressed && styles.settingsResetBtnPressed]}
              android_disableSound={true}
            >
              <Icon name="refresh-circle-outline" size={19} color={colors.cyanPrimary} />
              <Text style={styles.settingsResetText}>RESET MATCH</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const getStyles = (colors: any, shadows: any) =>
  StyleSheet.create({
    settingsBackdrop: {
      flex: 1,
      backgroundColor: colors.overlayDark,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    settingsCard: {
      borderRadius: radii.xxl,
      borderWidth: 2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceStrong,
      padding: spacing.lg,
      maxHeight: '88%',
      ...shadows.cyanStrong,
    },
    settingsHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    settingsTitle: {
      color: colors.textPrimary,
      letterSpacing: typography.tracking.normal,
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontFamily: typography.family.black,
    },
    settingsSubtitle: {
      color: colors.textSecondary,
      fontSize: typography.size.xs - 1,
      marginBottom: spacing.sm,
      fontFamily: typography.family.medium,
    },
    settingsCloseBtn: {
      width: 30,
      height: 30,
      borderRadius: radii.pill,
      borderWidth: 1.2,
      borderColor: colors.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsCloseBtnPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
    settingsScroll: {
      paddingBottom: spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    sectionTitleText: {
      color: colors.textPrimary,
      fontSize: 10,
      letterSpacing: typography.tracking.wide,
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
      fontFamily: typography.family.black,
    },
    sectionContainer: {
      borderRadius: radii.lg,
      borderWidth: 1.2,
      borderColor: 'rgba(255, 255, 255, 0.05)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs + 2,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    settingLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    settingIconWrap: {
      width: 32,
      height: 32,
      borderRadius: radii.md,
      backgroundColor: colors.cardSurfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    settingTextWrap: {
      flex: 1,
    },
    settingLabel: {
      color: colors.textPrimary,
      fontSize: typography.size.sm,
      fontFamily: typography.family.bold,
    },
    settingHint: {
      color: colors.textSecondary,
      fontSize: 9,
      marginTop: 2,
      fontFamily: typography.family.regular,
    },

    settingsPolicyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs + 4,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    settingsPolicyText: {
      color: colors.textAccent,
      fontSize: typography.size.xs,
      letterSpacing: typography.tracking.normal,
      fontFamily: typography.family.bold,
    },
    settingsPrivacyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs + 4,
    },
    settingsPrivacyText: {
      color: colors.pinkPrimary,
      fontSize: typography.size.xs,
      letterSpacing: typography.tracking.normal,
      fontFamily: typography.family.bold,
    },
    settingsResetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: radii.lg,
      borderWidth: 1.4,
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurfaceSoft,
      marginTop: spacing.md,
    },
    settingsResetText: {
      color: colors.textPrimary,
      fontSize: typography.size.sm,
      letterSpacing: typography.tracking.wide,
      fontFamily: typography.family.black,
    },
    settingsResetBtnPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.98 }],
    },
  });

export default SettingsModal;
