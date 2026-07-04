import { useCallback, useEffect, useRef } from 'react';
import { AdEventType, InterstitialAd, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { interstitialAdUnitId, rewardedAdUnitId, shouldRenderAds } from '../ads/adMobConfig';

export const useAdMob = (adsReady: boolean, isAdFree: boolean) => {
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const interstitialLoadedRef = useRef(false);
  const completedRoundsRef = useRef(0);
  const targetRoundsRef = useRef(3); // Start with target of 3 games

  const rewardedRef = useRef<RewardedAd | null>(null);
  const rewardedLoadedRef = useRef(false);
  const onRewardEarnedCallbackRef = useRef<(() => void) | null>(null);

  const adsEnabled = adsReady && shouldRenderAds && !isAdFree;

  // Interstitial Ad Management
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

  // Rewarded Ad Management
  useEffect(() => {
    if (!adsEnabled) {
      if (rewardedRef.current) {
        rewardedRef.current = null;
        rewardedLoadedRef.current = false;
      }
      return;
    }

    let unsubscribeLoaded: () => void = () => {};
    let unsubscribeEarned: () => void = () => {};
    let unsubscribeClosed: () => void = () => {};
    let unsubscribeError: () => void = () => {};

    const createAndLoadRewarded = () => {
      const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });
      rewardedRef.current = rewarded;

      unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        rewardedLoadedRef.current = true;
      });

      unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (onRewardEarnedCallbackRef.current) {
          onRewardEarnedCallbackRef.current();
          onRewardEarnedCallbackRef.current = null;
        }
      });

      unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        rewardedLoadedRef.current = false;
        cleanupListeners();
        createAndLoadRewarded();
      });

      unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
        rewardedLoadedRef.current = false;
      });

      rewarded.load();
    };

    const cleanupListeners = () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };

    createAndLoadRewarded();

    return () => {
      cleanupListeners();
      rewardedLoadedRef.current = false;
      rewardedRef.current = null;
    };
  }, [adsEnabled]);

  const incrementRoundsAndMaybeShowAd = useCallback(() => {
    completedRoundsRef.current += 1;

    if (!adsEnabled) {
      return;
    }

    if (completedRoundsRef.current >= targetRoundsRef.current) {
      completedRoundsRef.current = 0;
      const currentTarget = targetRoundsRef.current;
      targetRoundsRef.current = currentTarget === 3 ? 5 : 3;

      if (interstitialLoadedRef.current && interstitialRef.current) {
        interstitialRef.current.show().catch(() => {
          // Fail silent
        });
      }
    }
  }, [adsEnabled]);

  const showInterstitial = useCallback(() => {
    if (adsEnabled && interstitialLoadedRef.current && interstitialRef.current) {
      interstitialRef.current.show().catch(() => {
        // Fail silent
      });
    }
  }, [adsEnabled]);

  const showRewarded = useCallback((onReward: () => void, onNotLoaded?: () => void) => {
    if (adsEnabled) {
      if (rewardedLoadedRef.current && rewardedRef.current) {
        onRewardEarnedCallbackRef.current = onReward;
        rewardedRef.current.show().catch(() => {
          // Fallback to reward on show error
          onReward();
        });
      } else {
        if (onNotLoaded) {
          onNotLoaded();
        } else {
          onReward();
        }
      }
    } else {
      onReward();
    }
  }, [adsEnabled]);

  const resetRounds = useCallback(() => {
    completedRoundsRef.current = 0;
    targetRoundsRef.current = 3;
  }, []);

  return {
    adVisible: adsEnabled,
    incrementRoundsAndMaybeShowAd,
    showInterstitial,
    showRewarded,
    resetRounds,
  };
};
