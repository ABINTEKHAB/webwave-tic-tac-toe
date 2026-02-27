export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getScaleFactor = (width: number) => clamp(width / 390, 0.86, 1.18);

export const scaleSize = (size: number, width: number) =>
  Math.round(size * getScaleFactor(width));

export const getContentWidth = (width: number, gutter = 24, maxWidth = 560) =>
  Math.min(width - gutter, maxWidth);
