import {TestIds} from 'react-native-google-mobile-ads';

const PROD_BANNER_UNIT_ID = 'ca-app-pub-9812515008053738/2996940520';
const PROD_INTERSTITIAL_UNIT_ID = 'ca-app-pub-9812515008053738/7759505559';

const isPlaceholder = (value: string) => value.includes('xxxxxxxx');

export const hasProductionAdUnitIds = !isPlaceholder(PROD_BANNER_UNIT_ID) && !isPlaceholder(PROD_INTERSTITIAL_UNIT_ID);

export const bannerAdUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : PROD_BANNER_UNIT_ID;

export const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL_UNIT_ID;

export const shouldRenderAds = __DEV__ || hasProductionAdUnitIds;
