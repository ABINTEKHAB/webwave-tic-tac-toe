import React, {useState, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {bannerAdUnitId, shouldRenderAds} from '../ads/adMobConfig';

interface AdBannerProps {
  compact?: boolean;
  onAdLoaded?: () => void;
}

const AdBanner = ({compact = false, onAdLoaded}: AdBannerProps) => {
  const [loaded, setLoaded] = useState(false);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
    if (onAdLoaded) onAdLoaded();
  }, [onAdLoaded]);

  if (!shouldRenderAds) {
    return null;
  }

  return (
    <View
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        !loaded && styles.hidden,
      ]}
      pointerEvents={loaded ? 'auto' : 'none'}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleLoaded}
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
  hidden: {
    height: 0,
    overflow: 'hidden',
    marginTop: 0,
    marginBottom: 0,
  },
});

export default AdBanner;
