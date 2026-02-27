import React from 'react';
import {StyleSheet, View} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdUnitId, shouldRenderAds} from '../ads/adMobConfig';

interface AdBannerProps {
  compact?: boolean;
}

const AdBanner = ({compact = false}: AdBannerProps) => {
  if (!shouldRenderAds) {
    return null;
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  wrapCompact: {
    marginTop: 4,
    marginBottom: 0,
  },
});

export default AdBanner;
