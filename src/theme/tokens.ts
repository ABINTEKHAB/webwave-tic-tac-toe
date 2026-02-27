export const colors = {
  backgroundBase: '#060031',
  backgroundAlt: '#03052f',
  overlayDark: 'rgba(3, 8, 30, 0.9)',
  cardSurface: 'rgba(8, 44, 113, 0.72)',
  cardSurfaceStrong: 'rgba(8, 44, 117, 0.84)',
  cardSurfaceSoft: 'rgba(5, 31, 89, 0.36)',
  boardSurface: 'rgba(8, 28, 92, 0.72)',
  cyanPrimary: '#2cecff',
  cyanBright: '#efffff',
  cyanBorder: 'rgba(34, 226, 255, 0.78)',
  cyanSoft: 'rgba(22, 228, 255, 0.88)',
  cyanGlow: '#37eeff',
  pinkPrimary: '#f46cff',
  pinkBorder: 'rgba(244, 108, 255, 0.86)',
  pinkGlow: '#ff5bf6',
  pinkBright: '#ffe5ff',
  markCore: '#f8fdff',
  markOPrimary: '#e8ffff',
  markOGlow: 'rgba(55, 238, 255, 0.5)',
  markOOuter: 'rgba(40, 127, 255, 0.24)',
  markXPrimary: '#ffe9ff',
  markXGlow: 'rgba(255, 91, 247, 0.5)',
  markXOuter: 'rgba(165, 99, 255, 0.24)',
  textPrimary: '#f4fbff',
  textSecondary: '#9dc0df',
  textAccent: '#3febff',
  warning: '#ffcb55',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  pill: 999,
};

export const typography = {
  weight: {
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '900' as const,
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  tracking: {
    tight: 0.6,
    normal: 0.9,
    wide: 1.2,
    xwide: 1.8,
  },
};

export const shadows = {
  cyanSoft: {
    shadowColor: colors.cyanGlow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.34,
    shadowRadius: 8,
    elevation: 4,
  },
  cyanStrong: {
    shadowColor: colors.cyanGlow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.95,
    shadowRadius: 18,
    elevation: 14,
  },
  pinkSoft: {
    shadowColor: colors.pinkGlow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 9,
    elevation: 6,
  },
  pinkStrong: {
    shadowColor: colors.pinkGlow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 12,
  },
};
