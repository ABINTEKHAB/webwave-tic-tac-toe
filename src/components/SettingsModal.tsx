import React, { useMemo } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';
import { ThemeName, themes } from '../theme/themes';
import { radii, spacing, typography } from '../theme/tokens';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  bgmEnabled: boolean;
  isAdFree: boolean;
  onToggleSound: () => void;
  onToggleVibration: () => void;
  onToggleBgm: () => void;
  onToggleAdFree: () => void;
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
  bgmEnabled,
  isAdFree,
  onToggleSound,
  onToggleVibration,
  onToggleBgm,
  onToggleAdFree,
  onResetMatch,
  onOpenPrivacyPolicy,
  onOpenPrivacyOptions,
  shouldRenderAds,
  contentWidth,
  settingsTitleSize,
}: SettingsModalProps) => {
  const { theme, setTheme } = useTheme();
  const { colors, shadows } = theme;

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.settingsBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.settingsCard, { width: Math.min(contentWidth, 360) }]}
          onPress={() => {}}
        >
          <View style={styles.settingsHeaderRow}>
            <Text style={[styles.settingsTitle, { fontSize: settingsTitleSize }]}>GAME SETTINGS</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close game settings"
              style={({ pressed }) => [styles.settingsCloseBtn, pressed && styles.settingsCloseBtnPressed]}
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
                <Switch
                  value={soundEnabled}
                  onValueChange={onToggleSound}
                  thumbColor={soundEnabled ? colors.cyanBright : '#b7c8df'}
                  trackColor={{
                    false: 'rgba(153, 174, 206, 0.38)',
                    true: colors.cyanBorder,
                  }}
                />
              </View>

              {/* BGM Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingLabelRow}>
                  <View style={styles.settingIconWrap}>
                    <Icon name="musical-notes-outline" size={16} color={colors.cyanPrimary} />
                  </View>
                  <View style={styles.settingTextWrap}>
                    <Text style={styles.settingLabel}>Background Music</Text>
                    <Text style={styles.settingHint}>Ambient retro-wave music loop</Text>
                  </View>
                </View>
                <Switch
                  value={bgmEnabled}
                  onValueChange={onToggleBgm}
                  thumbColor={bgmEnabled ? colors.cyanBright : '#b7c8df'}
                  trackColor={{
                    false: 'rgba(153, 174, 206, 0.38)',
                    true: colors.cyanBorder,
                  }}
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
                <Switch
                  value={vibrationEnabled}
                  onValueChange={onToggleVibration}
                  thumbColor={vibrationEnabled ? colors.textPrimary : '#c7cde2'}
                  trackColor={{
                    false: 'rgba(153, 174, 206, 0.38)',
                    true: colors.pinkBorder,
                  }}
                />
              </View>
            </View>

            {/* VISUAL ENGINE */}
            <View style={styles.sectionHeader}>
              <Icon name="eye-outline" size={14} color={colors.pinkPrimary} />
              <Text style={styles.sectionTitleText}>VISUAL ENGINE</Text>
            </View>
            <View style={styles.sectionContainer}>
              <View style={styles.themeSection}>
                <Text style={styles.themeTitle}>ACTIVE THEME</Text>
                <View style={styles.themePickerRow}>
                  {(Object.keys(themes) as ThemeName[]).map(name => {
                    const isSelected = theme.name === name;
                    const activeThemeColors = themes[name].colors;
                    return (
                      <Pressable
                        key={name}
                        onPress={() => setTheme(name)}
                        style={[
                          styles.themeOption,
                          { borderColor: isSelected ? colors.cyanPrimary : 'rgba(255, 255, 255, 0.12)' },
                          isSelected && styles.themeOptionActive,
                        ]}
                      >
                        <View style={styles.themeDotRow}>
                          <View style={[styles.themeDot, { backgroundColor: activeThemeColors.cyanPrimary }]} />
                          <View style={[styles.themeDot, { backgroundColor: activeThemeColors.pinkPrimary }]} />
                        </View>
                        <Text style={[styles.themeOptionText, isSelected && { color: colors.cyanPrimary }]}>
                          {themes[name].label.split(' ')[0]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* SYSTEM NODES */}
            <View style={styles.sectionHeader}>
              <Icon name="construct-outline" size={14} color={colors.warning} />
              <Text style={styles.sectionTitleText}>SYSTEM NODES</Text>
            </View>
            <View style={styles.sectionContainer}>
              {/* Remove Ads Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingLabelRow}>
                  <View style={styles.settingIconWrap}>
                    <Icon name="star-outline" size={16} color={colors.cyanPrimary} />
                  </View>
                  <View style={styles.settingTextWrap}>
                    <Text style={styles.settingLabel}>Ad-Free Mode</Text>
                    <Text style={styles.settingHint}>Simulate IAP to remove all ads</Text>
                  </View>
                </View>
                <Switch
                  value={isAdFree}
                  onValueChange={onToggleAdFree}
                  thumbColor={isAdFree ? colors.cyanBright : '#b7c8df'}
                  trackColor={{
                    false: 'rgba(153, 174, 206, 0.38)',
                    true: colors.cyanBorder,
                  }}
                />
              </View>

              {/* Privacy Policy */}
              <Pressable
                onPress={onOpenPrivacyPolicy}
                accessibilityRole="button"
                accessibilityLabel="Open privacy policy website page"
                style={({ pressed }) => [styles.settingsPolicyBtn, pressed && styles.settingsResetBtnPressed]}
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
      fontWeight: typography.weight.heavy,
      letterSpacing: typography.tracking.normal,
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    settingsSubtitle: {
      color: colors.textSecondary,
      fontWeight: typography.weight.medium,
      fontSize: typography.size.xs - 1,
      marginBottom: spacing.sm,
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
      fontWeight: typography.weight.heavy,
      fontSize: 10,
      letterSpacing: typography.tracking.wide,
      textShadowColor: colors.glowPrimary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
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
      fontWeight: typography.weight.bold,
      fontSize: typography.size.sm,
    },
    settingHint: {
      color: colors.textSecondary,
      fontSize: 9,
      marginTop: 2,
    },
    themeSection: {
      paddingVertical: spacing.xs,
    },
    themeTitle: {
      color: colors.textPrimary,
      fontWeight: typography.weight.bold,
      fontSize: typography.size.xs,
      letterSpacing: typography.tracking.wide,
      marginBottom: spacing.xs,
    },
    themePickerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    themeOption: {
      flex: 1,
      borderRadius: radii.md,
      borderWidth: 1.5,
      paddingVertical: spacing.xs,
      alignItems: 'center',
      backgroundColor: colors.cardSurfaceSoft,
    },
    themeOptionActive: {
      backgroundColor: colors.glowPrimary,
      ...shadows.cyanSoft,
    },
    themeOptionText: {
      color: colors.textSecondary,
      fontWeight: typography.weight.bold,
      fontSize: 10,
      marginTop: 4,
    },
    themeDotRow: {
      flexDirection: 'row',
      gap: 4,
    },
    themeDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
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
      fontWeight: typography.weight.bold,
      fontSize: typography.size.xs,
      letterSpacing: typography.tracking.normal,
    },
    settingsPrivacyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs + 4,
    },
    settingsPrivacyText: {
      color: colors.pinkPrimary,
      fontWeight: typography.weight.bold,
      fontSize: typography.size.xs,
      letterSpacing: typography.tracking.normal,
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
      fontWeight: typography.weight.heavy,
      fontSize: typography.size.sm,
      letterSpacing: typography.tracking.wide,
    },
    settingsResetBtnPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.98 }],
    },
  });

export default SettingsModal;
