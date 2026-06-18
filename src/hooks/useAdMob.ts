import { useCallback, useEffect, useRef } from 'react';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { interstitialAdUnitId, shouldRenderAds } from '../ads/adMobConfig';

export const useAdMob = (adsReady: boolean, isAdFree: boolean) => {
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const interstitialLoadedRef = useRef(false);
  const completedRoundsRef = useRef(0);

  const adsEnabled = adsReady && shouldRenderAds && !isAdFree;

  useEffect(() => {
    if (!adsEnabled) {
      if (interstitialRef.current) {
        interstitialRef.current = null;
        interstitialLoadedRef.current = false;
      }
      return;
    }

    const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });
    interstitialRef.current = interstitial;

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoadedRef.current = true;
    });
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoadedRef.current = false;
      interstitial.load();
    });
    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      interstitialLoadedRef.current = false;
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      interstitialLoadedRef.current = false;
      interstitialRef.current = null;
    };
  }, [adsEnabled]);

  const incrementRoundsAndMaybeShowAd = useCallback(() => {
    completedRoundsRef.current += 1;

    if (!adsEnabled) {
      return;
    }

    // Show interstitial every 4 completed rounds
    if (completedRoundsRef.current > 0 && completedRoundsRef.current % 4 === 0) {
      if (interstitialLoadedRef.current && interstitialRef.current) {
        interstitialRef.current.show().catch(() => {
          // Fail silent
        });
      }
    }
  }, [adsEnabled]);

  const resetRounds = useCallback(() => {
    completedRoundsRef.current = 0;
  }, []);

  return {
    adVisible: adsEnabled,
    incrementRoundsAndMaybeShowAd,
    resetRounds,
  };
};
