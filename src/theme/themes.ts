import { colors as baseColors } from './tokens';

export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || typeof hex !== 'string') return 'transparent';
  if (hex.startsWith('rgba')) return hex;
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

export type ThemeName = 'cyber' | 'matrix' | 'gold' | 'nordic' | 'swiss';

export interface ThemeColors {
  backgroundBase: string;
  backgroundAlt: string;
  overlayDark: string;
  cardSurface: string;
  cardSurfaceStrong: string;
  cardSurfaceSoft: string;
  cardSurfaceAlt: string;
  boardSurface: string;
  cyanPrimary: string;
  cyanBright: string;
  cyanBorder: string;
  cyanSoft: string;
  cyanGlow: string;
  pinkPrimary: string;
  pinkBorder: string;
  pinkGlow: string;
  pinkBright: string;
  markCore: string;
  markOPrimary: string;
  markOGlow: string;
  markOOuter: string;
  markXPrimary: string;
  markXGlow: string;
  markXOuter: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  warning: string;
  glowPrimary: string;
  glowSecondary: string;
  dotInactiveBorder: string;
  dotInactiveBackground: string;
  boardGridLine: string;
  boardSecondaryGlow: string;
  boardSweepLarge: string;
  boardSweepSmall: string;
  previewBoardBg: string;
  previewBoardSecondaryBorder: string;
  previewCellBg: string;
  sliderTrack: string;
  sliderNodeBg: string;
  sliderNodeActiveBg: string;
  sliderNodeActiveGlow: string;
  sliderNodeInnerBg: string;
  sliderNodeInnerActiveBg: string;
  modalPanelBorder: string;
  modalPanelBg: string;
  modalHintPillBorder: string;
  modalHintPillBg: string;
  modalHintText: string;
}

export interface ThemeShadows {
  cyanSoft: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  cyanStrong: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  pinkSoft: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  pinkStrong: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface AppTheme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
  shadows: ThemeShadows;
}

const getShadowsForColors = (colors: ThemeColors): ThemeShadows => ({
  cyanSoft: {
    shadowColor: colors.cyanGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.34,
    shadowRadius: 8,
    elevation: 4,
  },
  cyanStrong: {
    shadowColor: colors.cyanGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 18,
    elevation: 14,
  },
  pinkSoft: {
    shadowColor: colors.pinkGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 9,
    elevation: 6,
  },
  pinkStrong: {
    shadowColor: colors.pinkGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 12,
  },
});

export const themes: Record<ThemeName, AppTheme> = {
  cyber: {
    name: 'cyber',
    label: 'Cyber Neon',
    colors: {
      backgroundBase: '#05050a',
      backgroundAlt: '#010103',
      overlayDark: 'rgba(5, 5, 10, 0.9)',
      cardSurface: 'rgba(14, 12, 34, 0.72)',
      cardSurfaceStrong: 'rgba(20, 18, 45, 0.88)',
      cardSurfaceSoft: 'rgba(255, 255, 255, 0.08)',
      cardSurfaceAlt: 'rgba(47, 21, 95, 0.72)',
      boardSurface: 'rgba(10, 8, 30, 0.78)',
      cyanPrimary: '#00f5ff', // Nebula Cyan
      cyanBright: '#f8f9fa', // Starlight White
      cyanBorder: 'rgba(0, 245, 255, 0.78)',
      cyanSoft: 'rgba(0, 245, 255, 0.88)',
      cyanGlow: '#00f5ff',
      pinkPrimary: '#ff75c3', // Nova Magenta
      pinkBorder: 'rgba(255, 117, 195, 0.86)',
      pinkGlow: '#ff75c3',
      pinkBright: '#ffe5f2',
      markCore: '#ffffff',
      markOPrimary: '#fff5fa',
      markOGlow: 'rgba(255, 0, 127, 0.5)',
      markOOuter: 'rgba(255, 0, 127, 0.24)',
      markXPrimary: '#f8f9fa',
      markXGlow: 'rgba(0, 245, 255, 0.5)',
      markXOuter: 'rgba(0, 245, 255, 0.24)',
      textPrimary: '#f8f9fa', // Starlight White
      textSecondary: '#9295af', // Starlight Dim
      textAccent: '#00f5ff',
      warning: '#ffd700', // Aurora Glow
      glowPrimary: 'rgba(0, 245, 255, 0.34)',
      glowSecondary: 'rgba(255, 117, 195, 0.28)',
      dotInactiveBorder: 'rgba(0, 245, 255, 0.5)',
      dotInactiveBackground: 'rgba(14, 12, 34, 0.7)',
      boardGridLine: 'rgba(0, 245, 255, 0.22)',
      boardSecondaryGlow: 'rgba(0, 245, 255, 0.16)',
      boardSweepLarge: 'rgba(0, 245, 255, 0.18)',
      boardSweepSmall: 'rgba(0, 245, 255, 0.12)',
      previewBoardBg: 'rgba(14, 12, 34, 0.68)',
      previewBoardSecondaryBorder: 'rgba(0, 245, 255, 0.07)',
      previewCellBg: 'rgba(20, 18, 45, 0.28)',
      sliderTrack: 'rgba(0, 245, 255, 0.35)',
      sliderNodeBg: 'rgba(0, 245, 255, 0.62)',
      sliderNodeActiveBg: '#ffd700',
      sliderNodeActiveGlow: 'rgba(255, 215, 0, 0.75)',
      sliderNodeInnerBg: 'rgba(5, 5, 10, 0.7)',
      sliderNodeInnerActiveBg: '#ffffff',
      modalPanelBorder: 'rgba(0, 245, 255, 0.44)',
      modalPanelBg: 'rgba(14, 12, 34, 0.66)',
      modalHintPillBorder: 'rgba(255, 117, 195, 0.28)',
      modalHintPillBg: 'rgba(47, 21, 95, 0.5)',
      modalHintText: 'rgba(255, 230, 242, 0.84)',
    },
    shadows: getShadowsForColors({
      backgroundBase: '#05050a',
      backgroundAlt: '#010103',
      overlayDark: 'rgba(5, 5, 10, 0.9)',
      cardSurface: 'rgba(14, 12, 34, 0.72)',
      cardSurfaceStrong: 'rgba(20, 18, 45, 0.88)',
      cardSurfaceSoft: 'rgba(255, 255, 255, 0.08)',
      cardSurfaceAlt: 'rgba(47, 21, 95, 0.72)',
      boardSurface: 'rgba(10, 8, 30, 0.78)',
      cyanPrimary: '#00f5ff',
      cyanBright: '#f8f9fa',
      cyanBorder: 'rgba(0, 245, 255, 0.78)',
      cyanSoft: 'rgba(0, 245, 255, 0.88)',
      cyanGlow: '#00f5ff',
      pinkPrimary: '#ff75c3',
      pinkBorder: 'rgba(255, 117, 195, 0.86)',
      pinkGlow: '#ff75c3',
      pinkBright: '#ffe5f2',
      markCore: '#ffffff',
      markOPrimary: '#fff5fa',
      markOGlow: 'rgba(255, 0, 127, 0.5)',
      markOOuter: 'rgba(255, 0, 127, 0.24)',
      markXPrimary: '#f8f9fa',
      markXGlow: 'rgba(0, 245, 255, 0.5)',
      markXOuter: 'rgba(0, 245, 255, 0.24)',
      textPrimary: '#f8f9fa',
      textSecondary: '#9295af',
      textAccent: '#00f5ff',
      warning: '#ffd700',
      glowPrimary: 'rgba(0, 245, 255, 0.34)',
      glowSecondary: 'rgba(255, 117, 195, 0.28)',
      dotInactiveBorder: 'rgba(0, 245, 255, 0.5)',
      dotInactiveBackground: 'rgba(14, 12, 34, 0.7)',
      boardGridLine: 'rgba(0, 245, 255, 0.22)',
      boardSecondaryGlow: 'rgba(0, 245, 255, 0.16)',
      boardSweepLarge: 'rgba(0, 245, 255, 0.18)',
      boardSweepSmall: 'rgba(0, 245, 255, 0.12)',
      previewBoardBg: 'rgba(14, 12, 34, 0.68)',
      previewBoardSecondaryBorder: 'rgba(0, 245, 255, 0.07)',
      previewCellBg: 'rgba(20, 18, 45, 0.28)',
      sliderTrack: 'rgba(0, 245, 255, 0.35)',
      sliderNodeBg: 'rgba(0, 245, 255, 0.62)',
      sliderNodeActiveBg: '#ffd700',
      sliderNodeActiveGlow: 'rgba(255, 215, 0, 0.75)',
      sliderNodeInnerBg: 'rgba(5, 5, 10, 0.7)',
      sliderNodeInnerActiveBg: '#ffffff',
      modalPanelBorder: 'rgba(0, 245, 255, 0.44)',
      modalPanelBg: 'rgba(14, 12, 34, 0.66)',
      modalHintPillBorder: 'rgba(255, 117, 195, 0.28)',
      modalHintPillBg: 'rgba(47, 21, 95, 0.5)',
      modalHintText: 'rgba(255, 230, 242, 0.84)',
    }),
  },
  matrix: {
    name: 'matrix',
    label: 'Fluid Frost',
    colors: {
      backgroundBase: '#1e293b',
      backgroundAlt: '#0f172a',
      overlayDark: 'rgba(15, 23, 42, 0.85)',
      cardSurface: 'rgba(30, 41, 59, 0.75)',
      cardSurfaceStrong: 'rgba(51, 65, 85, 0.9)',
      cardSurfaceSoft: 'rgba(255, 255, 255, 0.12)',
      cardSurfaceAlt: 'rgba(30, 41, 59, 0.9)',
      boardSurface: 'rgba(15, 23, 42, 0.7)',
      cyanPrimary: '#00f5ff',
      cyanBright: '#f8fafc',
      cyanBorder: 'rgba(0, 245, 255, 0.65)',
      cyanSoft: 'rgba(0, 245, 255, 0.88)',
      cyanGlow: '#00f5ff',
      pinkPrimary: '#a29bfe',
      pinkBorder: 'rgba(162, 155, 254, 0.75)',
      pinkGlow: '#a29bfe',
      pinkBright: '#eef2ff',
      markCore: '#ffffff',
      markOPrimary: '#00f5ff',
      markOGlow: 'rgba(0, 245, 255, 0.35)',
      markOOuter: 'rgba(0, 245, 255, 0.18)',
      markXPrimary: '#a29bfe',
      markXGlow: 'rgba(162, 155, 254, 0.35)',
      markXOuter: 'rgba(162, 155, 254, 0.18)',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      textAccent: '#38bdf8',
      warning: '#f59e0b',
      glowPrimary: 'rgba(0, 245, 255, 0.22)',
      glowSecondary: 'rgba(162, 155, 254, 0.22)',
      dotInactiveBorder: 'rgba(0, 245, 255, 0.45)',
      dotInactiveBackground: 'rgba(0, 245, 255, 0.12)',
      boardGridLine: 'rgba(56, 189, 248, 0.4)',
      boardSecondaryGlow: 'rgba(162, 155, 254, 0.12)',
      boardSweepLarge: 'rgba(0, 245, 255, 0.08)',
      boardSweepSmall: 'rgba(162, 155, 254, 0.06)',
      previewBoardBg: '#0f172a',
      previewBoardSecondaryBorder: 'rgba(0, 245, 255, 0.06)',
      previewCellBg: 'rgba(30, 41, 59, 0.4)',
      sliderTrack: 'rgba(0, 245, 255, 0.24)',
      sliderNodeBg: '#94a3b8',
      sliderNodeActiveBg: '#00f5ff',
      sliderNodeActiveGlow: 'rgba(0, 245, 255, 0.35)',
      sliderNodeInnerBg: '#1e293b',
      sliderNodeInnerActiveBg: '#f8fafc',
      modalPanelBorder: 'rgba(0, 245, 255, 0.3)',
      modalPanelBg: 'rgba(30, 41, 59, 0.85)',
      modalHintPillBorder: 'rgba(255, 255, 255, 0.08)',
      modalHintPillBg: 'rgba(255, 255, 255, 0.03)',
      modalHintText: '#cbd5e1',
    },
    shadows: getShadowsForColors({
      backgroundBase: '#1e293b',
      backgroundAlt: '#0f172a',
      overlayDark: 'rgba(15, 23, 42, 0.85)',
      cardSurface: 'rgba(30, 41, 59, 0.75)',
      cardSurfaceStrong: 'rgba(51, 65, 85, 0.9)',
      cardSurfaceSoft: 'rgba(255, 255, 255, 0.12)',
      cardSurfaceAlt: 'rgba(30, 41, 59, 0.9)',
      boardSurface: 'rgba(15, 23, 42, 0.7)',
      cyanPrimary: '#00f5ff',
      cyanBright: '#f8fafc',
      cyanBorder: 'rgba(0, 245, 255, 0.65)',
      cyanSoft: 'rgba(0, 245, 255, 0.88)',
      cyanGlow: '#00f5ff',
      pinkPrimary: '#a29bfe',
      pinkBorder: 'rgba(162, 155, 254, 0.75)',
      pinkGlow: '#a29bfe',
      pinkBright: '#eef2ff',
      markCore: '#ffffff',
      markOPrimary: '#00f5ff',
      markOGlow: 'rgba(0, 245, 255, 0.35)',
      markOOuter: 'rgba(0, 245, 255, 0.18)',
      markXPrimary: '#a29bfe',
      markXGlow: 'rgba(162, 155, 254, 0.35)',
      markXOuter: 'rgba(162, 155, 254, 0.18)',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      textAccent: '#38bdf8',
      warning: '#f59e0b',
      glowPrimary: 'rgba(0, 245, 255, 0.22)',
      glowSecondary: 'rgba(162, 155, 254, 0.22)',
      dotInactiveBorder: 'rgba(0, 245, 255, 0.45)',
      dotInactiveBackground: 'rgba(0, 245, 255, 0.12)',
      boardGridLine: 'rgba(56, 189, 248, 0.4)',
      boardSecondaryGlow: 'rgba(162, 155, 254, 0.12)',
      boardSweepLarge: 'rgba(0, 245, 255, 0.08)',
      boardSweepSmall: 'rgba(162, 155, 254, 0.06)',
      previewBoardBg: '#0f172a',
      previewBoardSecondaryBorder: 'rgba(0, 245, 255, 0.06)',
      previewCellBg: 'rgba(30, 41, 59, 0.4)',
      sliderTrack: 'rgba(0, 245, 255, 0.24)',
      sliderNodeBg: '#94a3b8',
      sliderNodeActiveBg: '#00f5ff',
      sliderNodeActiveGlow: 'rgba(0, 245, 255, 0.35)',
      sliderNodeInnerBg: '#1e293b',
      sliderNodeInnerActiveBg: '#f8fafc',
      modalPanelBorder: 'rgba(0, 245, 255, 0.3)',
      modalPanelBg: 'rgba(30, 41, 59, 0.85)',
      modalHintPillBorder: 'rgba(255, 255, 255, 0.08)',
      modalHintPillBg: 'rgba(255, 255, 255, 0.03)',
      modalHintText: '#cbd5e1',
    }),
  },
  gold: {
    name: 'gold',
    label: 'Royalty Gold',
    colors: {
      backgroundBase: '#121212',
      backgroundAlt: '#0b0b0b',
      overlayDark: 'rgba(15, 15, 15, 0.9)',
      cardSurface: 'rgba(32, 32, 32, 0.82)',
      cardSurfaceStrong: 'rgba(42, 42, 42, 0.9)',
      cardSurfaceSoft: 'rgba(255, 255, 255, 0.04)',
      cardSurfaceAlt: 'rgba(22, 22, 22, 0.82)',
      boardSurface: 'rgba(25, 25, 25, 0.85)',
      cyanPrimary: '#ffd700', // Gold
      cyanBright: '#fff8e7',
      cyanBorder: 'rgba(255, 215, 0, 0.7)',
      cyanSoft: 'rgba(255, 215, 0, 0.8)',
      cyanGlow: '#ffd700',
      pinkPrimary: '#f8f9fa', // Marble White
      pinkBorder: 'rgba(248, 249, 250, 0.7)',
      pinkGlow: '#ffffff',
      pinkBright: '#ffffff',
      markCore: '#ffffff',
      markOPrimary: '#fff8e7',
      markOGlow: 'rgba(255, 215, 0, 0.4)',
      markOOuter: 'rgba(255, 215, 0, 0.18)',
      markXPrimary: '#ffffff',
      markXGlow: 'rgba(248, 249, 250, 0.4)',
      markXOuter: 'rgba(248, 249, 250, 0.18)',
      textPrimary: '#fff8e7',
      textSecondary: '#a8a69f',
      textAccent: '#ffd700',
      warning: '#ffa500',
      glowPrimary: 'rgba(255, 215, 0, 0.28)',
      glowSecondary: 'rgba(255, 255, 255, 0.22)',
      dotInactiveBorder: 'rgba(255, 215, 0, 0.4)',
      dotInactiveBackground: 'rgba(32, 32, 32, 0.7)',
      boardGridLine: 'rgba(255, 215, 0, 0.18)',
      boardSecondaryGlow: 'rgba(255, 215, 0, 0.12)',
      boardSweepLarge: 'rgba(255, 215, 0, 0.14)',
      boardSweepSmall: 'rgba(255, 215, 0, 0.08)',
      previewBoardBg: 'rgba(25, 25, 25, 0.7)',
      previewBoardSecondaryBorder: 'rgba(255, 215, 0, 0.06)',
      previewCellBg: 'rgba(32, 32, 32, 0.3)',
      sliderTrack: 'rgba(255, 215, 0, 0.24)',
      sliderNodeBg: 'rgba(255, 215, 0, 0.5)',
      sliderNodeActiveBg: '#ffd700',
      sliderNodeActiveGlow: 'rgba(255, 215, 0, 0.6)',
      sliderNodeInnerBg: 'rgba(11, 11, 11, 0.7)',
      sliderNodeInnerActiveBg: '#ffffff',
      modalPanelBorder: 'rgba(255, 215, 0, 0.3)',
      modalPanelBg: 'rgba(32, 32, 32, 0.7)',
      modalHintPillBorder: 'rgba(255, 255, 255, 0.1)',
      modalHintPillBg: 'rgba(255, 255, 255, 0.03)',
      modalHintText: 'rgba(255, 255, 255, 0.65)',
    },
    shadows: getShadowsForColors({
      backgroundBase: '#121212',
      backgroundAlt: '#0b0b0b',
      overlayDark: 'rgba(15, 15, 15, 0.9)',
      cardSurface: 'rgba(32, 32, 32, 0.82)',
      cardSurfaceStrong: 'rgba(42, 42, 42, 0.9)',
      cardSurfaceSoft: 'rgba(255, 255, 255, 0.04)',
      cardSurfaceAlt: 'rgba(22, 22, 22, 0.82)',
      boardSurface: 'rgba(25, 25, 25, 0.85)',
      cyanPrimary: '#ffd700',
      cyanBright: '#fff8e7',
      cyanBorder: 'rgba(255, 215, 0, 0.7)',
      cyanSoft: 'rgba(255, 215, 0, 0.8)',
      cyanGlow: '#ffd700',
      pinkPrimary: '#f8f9fa',
      pinkBorder: 'rgba(248, 249, 250, 0.7)',
      pinkGlow: '#ffffff',
      pinkBright: '#ffffff',
      markCore: '#ffffff',
      markOPrimary: '#fff8e7',
      markOGlow: 'rgba(255, 215, 0, 0.4)',
      markOOuter: 'rgba(255, 215, 0, 0.18)',
      markXPrimary: '#ffffff',
      markXGlow: 'rgba(248, 249, 250, 0.4)',
      markXOuter: 'rgba(248, 249, 250, 0.18)',
      textPrimary: '#fff8e7',
      textSecondary: '#a8a69f',
      textAccent: '#ffd700',
      warning: '#ffa500',
      glowPrimary: 'rgba(255, 215, 0, 0.28)',
      glowSecondary: 'rgba(255, 255, 255, 0.22)',
      dotInactiveBorder: 'rgba(255, 215, 0, 0.4)',
      dotInactiveBackground: 'rgba(32, 32, 32, 0.7)',
      boardGridLine: 'rgba(255, 215, 0, 0.18)',
      boardSecondaryGlow: 'rgba(255, 215, 0, 0.12)',
      boardSweepLarge: 'rgba(255, 215, 0, 0.14)',
      boardSweepSmall: 'rgba(255, 215, 0, 0.08)',
      previewBoardBg: 'rgba(25, 25, 25, 0.7)',
      previewBoardSecondaryBorder: 'rgba(255, 215, 0, 0.06)',
      previewCellBg: 'rgba(32, 32, 32, 0.3)',
      sliderTrack: 'rgba(255, 215, 0, 0.24)',
      sliderNodeBg: 'rgba(255, 215, 0, 0.5)',
      sliderNodeActiveBg: '#ffd700',
      sliderNodeActiveGlow: 'rgba(255, 215, 0, 0.6)',
      sliderNodeInnerBg: 'rgba(11, 11, 11, 0.7)',
      sliderNodeInnerActiveBg: '#ffffff',
      modalPanelBorder: 'rgba(255, 215, 0, 0.3)',
      modalPanelBg: 'rgba(32, 32, 32, 0.7)',
      modalHintPillBorder: 'rgba(255, 255, 255, 0.1)',
      modalHintPillBg: 'rgba(255, 255, 255, 0.03)',
      modalHintText: 'rgba(255, 255, 255, 0.65)',
    }),
  },
  nordic: {
    name: 'nordic',
    label: 'Nordic Craft',
    colors: {
      backgroundBase: '#f3efe6',
      backgroundAlt: '#eae4d5',
      overlayDark: 'rgba(50, 48, 44, 0.65)',
      cardSurface: '#ffffff',
      cardSurfaceStrong: '#ffffff',
      cardSurfaceSoft: '#fcfbfa',
      cardSurfaceAlt: '#faf9f6',
      boardSurface: '#dfd9c8',
      cyanPrimary: '#2d563a', // Organic Pine Green
      cyanBright: '#1c3825',
      cyanBorder: '#3b6b4c',
      cyanSoft: 'rgba(45, 86, 58, 0.88)',
      cyanGlow: '#2d563a',
      pinkPrimary: '#a3493e', // Terracotta Red
      pinkBorder: '#b35e55',
      pinkGlow: '#a3493e',
      pinkBright: '#722d25',
      markCore: '#24221f', // Dark charcoal/slate brown for Tic-Tac-Toe X/O cores
      markOPrimary: '#2d563a',
      markOGlow: 'rgba(45, 86, 58, 0.35)',
      markOOuter: 'rgba(45, 86, 58, 0.18)',
      markXPrimary: '#a3493e',
      markXGlow: 'rgba(163, 73, 62, 0.35)',
      markXOuter: 'rgba(163, 73, 62, 0.18)',
      textPrimary: '#2c2621', // Darker text for readability
      textSecondary: '#5c544b', // Darker secondary text
      textAccent: '#2d563a',
      warning: '#a36c0f', // Darker warning color for visibility
      glowPrimary: 'rgba(45, 86, 58, 0.22)',
      glowSecondary: 'rgba(163, 73, 62, 0.22)',
      dotInactiveBorder: 'rgba(45, 86, 58, 0.45)',
      dotInactiveBackground: 'rgba(45, 86, 58, 0.12)',
      boardGridLine: '#5c544b', // Darker grid lines for TTT & Ludo boards
      boardSecondaryGlow: '#cfc7b5',
      boardSweepLarge: 'rgba(45, 86, 58, 0.08)',
      boardSweepSmall: 'rgba(163, 73, 62, 0.06)',
      previewBoardBg: '#eae4d5',
      previewBoardSecondaryBorder: '#cfc7b5',
      previewCellBg: '#ffffff',
      sliderTrack: '#cfc7b5',
      sliderNodeBg: '#5c544b',
      sliderNodeActiveBg: '#2d563a',
      sliderNodeActiveGlow: 'rgba(45, 86, 58, 0.35)',
      sliderNodeInnerBg: '#f3efe6',
      sliderNodeInnerActiveBg: '#f3efe6',
      modalPanelBorder: '#cfc7b5',
      modalPanelBg: '#ffffff',
      modalHintPillBorder: 'rgba(0, 0, 0, 0.12)',
      modalHintPillBg: 'rgba(0, 0, 0, 0.04)',
      modalHintText: '#5c544b',
    },
    shadows: getShadowsForColors({
      backgroundBase: '#f3efe6',
      backgroundAlt: '#eae4d5',
      overlayDark: 'rgba(50, 48, 44, 0.65)',
      cardSurface: '#ffffff',
      cardSurfaceStrong: '#ffffff',
      cardSurfaceSoft: '#fcfbfa',
      cardSurfaceAlt: '#faf9f6',
      boardSurface: '#dfd9c8',
      cyanPrimary: '#2d563a',
      cyanBright: '#1c3825',
      cyanBorder: '#3b6b4c',
      cyanSoft: 'rgba(45, 86, 58, 0.88)',
      cyanGlow: 'rgba(40, 36, 32, 0.22)',
      pinkPrimary: '#a3493e',
      pinkBorder: '#b35e55',
      pinkGlow: 'rgba(40, 36, 32, 0.18)',
      pinkBright: '#722d25',
      markCore: '#24221f',
      markOPrimary: '#2d563a',
      markOGlow: 'rgba(45, 86, 58, 0.35)',
      markOOuter: 'rgba(45, 86, 58, 0.18)',
      markXPrimary: '#a3493e',
      markXGlow: 'rgba(163, 73, 62, 0.35)',
      markXOuter: 'rgba(163, 73, 62, 0.18)',
      textPrimary: '#2c2621',
      textSecondary: '#5c544b',
      textAccent: '#2d563a',
      warning: '#a36c0f',
      glowPrimary: 'rgba(45, 86, 58, 0.22)',
      glowSecondary: 'rgba(163, 73, 62, 0.22)',
      dotInactiveBorder: 'rgba(45, 86, 58, 0.45)',
      dotInactiveBackground: 'rgba(45, 86, 58, 0.12)',
      boardGridLine: '#5c544b',
      boardSecondaryGlow: '#cfc7b5',
      boardSweepLarge: 'rgba(45, 86, 58, 0.08)',
      boardSweepSmall: 'rgba(163, 73, 62, 0.06)',
      previewBoardBg: '#eae4d5',
      previewBoardSecondaryBorder: '#cfc7b5',
      previewCellBg: '#ffffff',
      sliderTrack: '#cfc7b5',
      sliderNodeBg: '#5c544b',
      sliderNodeActiveBg: '#2d563a',
      sliderNodeActiveGlow: 'rgba(45, 86, 58, 0.35)',
      sliderNodeInnerBg: '#f3efe6',
      sliderNodeInnerActiveBg: '#f3efe6',
      modalPanelBorder: '#cfc7b5',
      modalPanelBg: '#ffffff',
      modalHintPillBorder: 'rgba(0, 0, 0, 0.12)',
      modalHintPillBg: 'rgba(0, 0, 0, 0.04)',
      modalHintText: '#5c544b',
    }),
  },
  swiss: {
    name: 'swiss',
    label: 'Swiss Grid',
    colors: {
      backgroundBase: '#191919',
      backgroundAlt: '#111111',
      overlayDark: 'rgba(10, 10, 10, 0.92)',
      cardSurface: '#242424',
      cardSurfaceStrong: '#2c2c2c',
      cardSurfaceSoft: 'rgba(255, 255, 255, 0.04)',
      cardSurfaceAlt: '#202020',
      boardSurface: '#1d1d1d',
      cyanPrimary: '#ff3b30', // Electric Red
      cyanBright: '#ffffff',
      cyanBorder: 'rgba(255, 59, 48, 0.78)',
      cyanSoft: 'rgba(255, 59, 48, 0.88)',
      cyanGlow: '#ff3b30',
      pinkPrimary: '#e5e5ea',
      pinkBorder: 'rgba(229, 229, 234, 0.78)',
      pinkGlow: '#ffffff',
      pinkBright: '#ffffff',
      markCore: '#ffffff',
      markOPrimary: '#ff3b30',
      markOGlow: 'rgba(255, 59, 48, 0.3)',
      markOOuter: 'rgba(255, 59, 48, 0.15)',
      markXPrimary: '#ffffff',
      markXGlow: 'rgba(255, 255, 255, 0.22)',
      markXOuter: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#aebead',
      textAccent: '#ff3b30',
      warning: '#ff9500',
      glowPrimary: 'rgba(255, 59, 48, 0.18)',
      glowSecondary: 'rgba(255, 255, 255, 0.12)',
      dotInactiveBorder: 'rgba(255, 255, 255, 0.22)',
      dotInactiveBackground: '#242424',
      boardGridLine: 'rgba(255, 255, 255, 0.12)',
      boardSecondaryGlow: 'rgba(255, 255, 255, 0.03)',
      boardSweepLarge: 'rgba(255, 255, 255, 0.05)',
      boardSweepSmall: 'rgba(255, 255, 255, 0.02)',
      previewBoardBg: '#1d1d1d',
      previewBoardSecondaryBorder: 'rgba(255, 255, 255, 0.06)',
      previewCellBg: '#242424',
      sliderTrack: '#2c2c2c',
      sliderNodeBg: '#3a3a3c',
      sliderNodeActiveBg: '#ff3b30',
      sliderNodeActiveGlow: 'rgba(255, 59, 48, 0.3)',
      sliderNodeInnerBg: '#191919',
      sliderNodeInnerActiveBg: '#ffffff',
      modalPanelBorder: '#2c2c2c',
      modalPanelBg: '#242424',
      modalHintPillBorder: 'rgba(255, 255, 255, 0.08)',
      modalHintPillBg: 'rgba(255, 255, 255, 0.03)',
      modalHintText: '#aebead',
    },
    shadows: getShadowsForColors({
      backgroundBase: '#191919',
      backgroundAlt: '#111111',
      overlayDark: 'rgba(10, 10, 10, 0.92)',
      cardSurface: '#242424',
      cardSurfaceStrong: '#2c2c2c',
      cardSurfaceSoft: 'rgba(255, 255, 255, 0.04)',
      cardSurfaceAlt: '#202020',
      boardSurface: '#1d1d1d',
      cyanPrimary: '#ff3b30',
      cyanBright: '#ffffff',
      cyanBorder: 'rgba(255, 59, 48, 0.78)',
      cyanSoft: 'rgba(255, 59, 48, 0.88)',
      cyanGlow: '#ff3b30',
      pinkPrimary: '#e5e5ea',
      pinkBorder: 'rgba(229, 229, 234, 0.78)',
      pinkGlow: '#ffffff',
      pinkBright: '#ffffff',
      markCore: '#ffffff',
      markOPrimary: '#ff3b30',
      markOGlow: 'rgba(255, 59, 48, 0.3)',
      markOOuter: 'rgba(255, 59, 48, 0.15)',
      markXPrimary: '#ffffff',
      markXGlow: 'rgba(255, 255, 255, 0.22)',
      markXOuter: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#aebead',
      textAccent: '#ff3b30',
      warning: '#ff9500',
      glowPrimary: 'rgba(255, 59, 48, 0.18)',
      glowSecondary: 'rgba(255, 255, 255, 0.12)',
      dotInactiveBorder: 'rgba(255, 255, 255, 0.22)',
      dotInactiveBackground: '#242424',
      boardGridLine: 'rgba(255, 255, 255, 0.12)',
      boardSecondaryGlow: 'rgba(255, 255, 255, 0.03)',
      boardSweepLarge: 'rgba(255, 255, 255, 0.05)',
      boardSweepSmall: 'rgba(255, 255, 255, 0.02)',
      previewBoardBg: '#1d1d1d',
      previewBoardSecondaryBorder: 'rgba(255, 255, 255, 0.06)',
      previewCellBg: '#242424',
      sliderTrack: '#2c2c2c',
      sliderNodeBg: '#3a3a3c',
      sliderNodeActiveBg: '#ff3b30',
      sliderNodeActiveGlow: 'rgba(255, 59, 48, 0.3)',
      sliderNodeInnerBg: '#191919',
      sliderNodeInnerActiveBg: '#ffffff',
      modalPanelBorder: '#2c2c2c',
      modalPanelBg: '#242424',
      modalHintPillBorder: 'rgba(255, 255, 255, 0.08)',
      modalHintPillBg: 'rgba(255, 255, 255, 0.03)',
      modalHintText: '#aebead',
    }),
  },
};
