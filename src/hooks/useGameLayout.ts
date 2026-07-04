import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getContentWidth, scaleSize } from '../theme/responsive';
import { spacing } from '../theme/tokens';

export interface GameLayout {
  width: number;
  height: number;
  topUiPadding: number;
  contentWidth: number;
  viewportHeight: number;
  bottomSafeSpace: number;
  boardCompactLayout: boolean;
  boardTightLayout: boolean;
  ultraCompactLayout: boolean;
  topCompactLayout: boolean;
  topTightLayout: boolean;
  boardSize: number;
  boardCellSize: number;
  iconFontSize: number;
  iconButtonSize: number;
  iconButtonRadius: number;
  levelFontSize: number;
  statusFontSize: number;
  replayIconSize: number;
  replayButtonSize: number;
  replayButtonRadius: number;
  headerTitleSize: number;
  headerSubtitleSize: number;
  settingsTitleSize: number;
}

export const useGameLayout = (adsReady: boolean, shouldRenderAds: boolean): GameLayout => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const adVisible = adsReady && shouldRenderAds;

  const topUiPadding = insets.top >= 28 ? spacing.xs : insets.top >= 18 ? spacing.sm : spacing.md;
  const contentWidth = getContentWidth(width, 16, 760);
  const viewportHeight = height - insets.top - insets.bottom;
  const bottomSafeSpace = Math.max(insets.bottom, spacing.sm);

  const boardCompactLayout = viewportHeight < 840 || width < 395;
  const boardTightLayout = adVisible && (viewportHeight < 780 || width < 370);
  const ultraCompactLayout = adVisible && viewportHeight < 720;

  const topCompactLayout = adVisible
    ? viewportHeight < 940 || width < 430
    : boardCompactLayout;

  const topTightLayout = adVisible
    ? viewportHeight < 850 || width < 385
    : boardTightLayout;

  const boardWidthLimit = Math.min(contentWidth, 620);
  const topReserve = ultraCompactLayout ? 212 : boardTightLayout ? 228 : boardCompactLayout ? 252 : 278;
  const bottomReserve = ultraCompactLayout ? 84 : boardTightLayout ? 94 : boardCompactLayout ? 108 : 122;
  const adReserve = adVisible ? (ultraCompactLayout ? 58 : boardCompactLayout ? 62 : 70) : 0;

  const boardHeightLimit = Math.max(220, viewportHeight - topReserve - bottomReserve - adReserve);
  const preferredBoard = Math.min(
    boardWidthLimit,
    boardTightLayout ? boardWidthLimit : boardCompactLayout ? 392 : 420,
  );
  const minimumBoard = Math.min(
    boardWidthLimit,
    ultraCompactLayout ? 230 : boardTightLayout ? 260 : boardCompactLayout ? 270 : 290,
  );

  const boardSize = Math.min(preferredBoard, Math.max(boardHeightLimit, minimumBoard));
  const boardCellSize = boardSize / 3;

  const iconFontSize = topTightLayout
    ? scaleSize(26, width)
    : topCompactLayout
    ? scaleSize(30, width)
    : scaleSize(34, width);

  const iconButtonSize = topTightLayout
    ? scaleSize(44, width)
    : topCompactLayout
    ? scaleSize(50, width)
    : scaleSize(56, width);

  const iconButtonRadius = Math.round(iconButtonSize * 0.28);

  const levelFontSize = topTightLayout
    ? Math.max(10, scaleSize(11, width))
    : topCompactLayout
    ? Math.max(11, scaleSize(12, width))
    : Math.max(12, scaleSize(14, width));

  const statusFontSize = topTightLayout
    ? Math.max(11, scaleSize(12, width))
    : topCompactLayout
    ? Math.max(12, scaleSize(13, width))
    : Math.max(13, scaleSize(15, width));

  const replayIconSize = topTightLayout
    ? scaleSize(28, width)
    : topCompactLayout
    ? scaleSize(32, width)
    : scaleSize(44, width);

  const replayButtonSize = topTightLayout
    ? scaleSize(60, width)
    : topCompactLayout
    ? scaleSize(72, width)
    : scaleSize(94, width);

  const replayButtonRadius = Math.round(replayButtonSize * 0.22);

  const headerTitleSize = topTightLayout ? Math.max(11, scaleSize(12, width)) : Math.max(12, scaleSize(13, width));
  const headerSubtitleSize = topTightLayout ? Math.max(9, scaleSize(10, width)) : Math.max(10, scaleSize(11, width));
  const settingsTitleSize = Math.max(19, scaleSize(22, width));

  return {
    width,
    height,
    topUiPadding,
    contentWidth,
    viewportHeight,
    bottomSafeSpace,
    boardCompactLayout,
    boardTightLayout,
    ultraCompactLayout,
    topCompactLayout,
    topTightLayout,
    boardSize,
    boardCellSize,
    iconFontSize,
    iconButtonSize,
    iconButtonRadius,
    levelFontSize,
    statusFontSize,
    replayIconSize,
    replayButtonSize,
    replayButtonRadius,
    headerTitleSize,
    headerSubtitleSize,
    settingsTitleSize,
  };
};
