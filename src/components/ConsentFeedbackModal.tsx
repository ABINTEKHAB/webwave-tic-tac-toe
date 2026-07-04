import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';
import { radii, spacing, typography } from '../theme/tokens';

interface ConsentFeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  contentWidth: number;
}

const ConsentFeedbackModal = ({
  visible,
  title,
  message,
  onClose,
  contentWidth,
}: ConsentFeedbackModalProps) => {
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
      <Pressable style={styles.settingsBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.consentFeedbackCard, { width: Math.min(contentWidth, 360) }]}
          onPress={() => {}}
        >
          <View style={styles.consentFeedbackHeader}>
            <View style={styles.consentFeedbackBadge}>
              <Icon name="shield-checkmark-outline" size={18} color={colors.pinkPrimary} />
            </View>
            <Text style={styles.consentFeedbackTitle}>{title}</Text>
          </View>

          <Text style={styles.consentFeedbackMessage}>{message}</Text>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close consent information"
            style={({ pressed }) => [
              styles.consentFeedbackOkBtn,
              pressed && styles.settingsResetBtnPressed,
            ]}
          >
            <Text style={styles.consentFeedbackOkText}>OK</Text>
          </Pressable>
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
    consentFeedbackCard: {
      borderRadius: radii.xxl,
      borderWidth: 2,
      borderColor: colors.cyanBorder,
      backgroundColor: colors.cardSurfaceStrong,
      padding: spacing.lg,
      alignItems: 'center',
      ...shadows.cyanStrong,
    },
    consentFeedbackHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
      width: '100%',
    },
    consentFeedbackBadge: {
      width: 34,
      height: 34,
      borderRadius: radii.pill,
      borderWidth: 1.2,
      borderColor: colors.pinkBorder,
      backgroundColor: colors.glowSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    consentFeedbackTitle: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.size.md,
      letterSpacing: typography.tracking.tight,
      textShadowColor: colors.glowSecondary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontFamily: typography.family.black,
    },
    consentFeedbackMessage: {
      color: colors.textSecondary,
      fontSize: typography.size.sm,
      lineHeight: 20,
      textAlign: 'left',
      width: '100%',
      marginBottom: spacing.lg,
      fontFamily: typography.family.medium,
    },
    consentFeedbackOkBtn: {
      width: '100%',
      borderRadius: radii.lg,
      borderWidth: 1.6,
      borderColor: colors.cyanPrimary,
      backgroundColor: colors.cardSurface,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.cyanSoft,
    },
    consentFeedbackOkText: {
      color: colors.textPrimary,
      letterSpacing: typography.tracking.wide,
      fontSize: typography.size.md,
      fontFamily: typography.family.black,
    },
    settingsResetBtnPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.98 }],
    },
  });

export default ConsentFeedbackModal;
