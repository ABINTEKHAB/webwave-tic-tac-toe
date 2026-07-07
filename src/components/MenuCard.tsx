import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, Image, StyleProp, ViewStyle } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba } from '../theme/themes';
import { radii, spacing, typography } from '../theme/tokens';
import { useGameSounds } from '../hooks/useGameSounds';

export type MenuCardVariant = 'cyan' | 'pink' | 'warning';

interface MenuCardProps {
  title: string;
  description: string;
  imageSource: any;
  variant: MenuCardVariant;
  onPress: () => void;
  tagText?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  soundEnabled?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  imageSource,
  variant,
  onPress,
  tagText,
  accessibilityLabel,
  style,
  soundEnabled = true,
}) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;
  const { playSound } = useGameSounds(soundEnabled);

  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);

  let cardStyle, titleStyle, tagContainerStyle, tagTextStyle, iconColor;

  if (variant === 'cyan') {
    cardStyle = [styles.cardBase, { borderColor: colors.cyanPrimary, backgroundColor: colors.cardSurface }, shadows.cyanSoft, Platform.OS === 'android' ? { elevation: 0 } : {}];
    titleStyle = [styles.titleBase, { color: colors.cyanPrimary, textShadowColor: hexToRgba(colors.cyanGlow, 0.4) }];
    tagContainerStyle = [styles.tagBase, { borderColor: 'rgba(0, 245, 255, 0.15)', backgroundColor: 'rgba(0, 245, 255, 0.03)' }];
    tagTextStyle = [styles.tagTextBase, { color: colors.cyanPrimary }];
    iconColor = colors.cyanPrimary;
  } else if (variant === 'pink') {
    cardStyle = [styles.cardBase, { borderColor: colors.pinkBorder, backgroundColor: colors.cardSurfaceAlt }, shadows.pinkSoft, Platform.OS === 'android' ? { elevation: 0 } : {}];
    titleStyle = [styles.titleBase, { color: colors.pinkPrimary, textShadowColor: hexToRgba(colors.pinkGlow, 0.4) }];
    tagContainerStyle = [styles.tagBase, { borderColor: 'rgba(255, 117, 195, 0.15)', backgroundColor: 'rgba(255, 117, 195, 0.03)' }];
    tagTextStyle = [styles.tagTextBase, { color: colors.pinkPrimary }];
    iconColor = colors.pinkPrimary;
  } else {
    // warning
    cardStyle = [styles.cardBase, { borderColor: colors.warning, backgroundColor: colors.cardSurface }];
    titleStyle = [styles.titleBase, { color: colors.warning, textShadowColor: hexToRgba(colors.warning, 0.4) }];
    tagContainerStyle = [styles.tagBase, { borderColor: 'rgba(255, 179, 0, 0.15)', backgroundColor: 'rgba(255, 179, 0, 0.03)' }];
    tagTextStyle = [styles.tagTextBase, { color: colors.warning }];
    iconColor = colors.warning;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [cardStyle, style, pressed && styles.cardPressed]}
      onPress={() => {
        playSound('tap');
        onPress();
      }}
      android_disableSound={true}
    >
      <View style={styles.cardContent}>
        <Image source={imageSource} style={styles.image} />
        
        <View style={styles.textWrap}>
          <Text style={titleStyle}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
          
          {tagText && (
            <View style={tagContainerStyle}>
              <Text style={tagTextStyle}>{tagText}</Text>
            </View>
          )}
        </View>

        <Icon name="chevron-forward" size={20} color={iconColor} />
      </View>
    </Pressable>
  );
};

const getStyles = (colors: any, shadows: any) =>
  StyleSheet.create({
    cardBase: {
      borderRadius: radii.xxl,
      borderWidth: 1.8,
      padding: spacing.md,
      overflow: 'hidden',
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
    image: {
      width: 72,
      height: 72,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    textWrap: {
      flex: 1,
      marginLeft: spacing.md,
      marginRight: spacing.xs,
    },
    titleBase: {
      fontSize: typography.size.md,
      letterSpacing: typography.tracking.wide,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
      fontFamily: typography.family.bold,
    },
    desc: {
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 14,
      marginTop: 3,
      fontFamily: typography.family.semibold,
    },
    tagBase: {
      alignSelf: 'flex-start',
      marginTop: 8,
      borderRadius: radii.sm,
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    tagTextBase: {
      fontSize: 8,
      letterSpacing: 0.5,
      fontFamily: typography.family.bold,
    },
  });

export default MenuCard;
