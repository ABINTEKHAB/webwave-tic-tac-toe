import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  log as logCrashlytics,
  recordError,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';

let analyticsCollectionEnabled = false;

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  return new Error('Unknown error');
};

export const initializeTelemetry = async () => {
  try {
    // Keep debug sessions clean; enable crash reports for release users.
    await setCrashlyticsCollectionEnabled(getCrashlytics(), !__DEV__);
  } catch {
    // Do not block app startup for telemetry failures.
  }

  analyticsCollectionEnabled = false;
  try {
    await setAnalyticsCollectionEnabled(getAnalytics(), false);
  } catch {
    // Do not block app startup for telemetry failures.
  }
};

export const setAnalyticsEnabled = async (enabled: boolean) => {
  analyticsCollectionEnabled = enabled;

  try {
    await setAnalyticsCollectionEnabled(getAnalytics(), enabled);
  } catch {
    if (!enabled) {
      analyticsCollectionEnabled = false;
    }
  }
};

export const logScreenView = async (screenName: string) => {
  if (!analyticsCollectionEnabled) {
    return;
  }

  try {
    await logEvent(getAnalytics(), 'screen_view', {
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch {
    // Keep UI responsive if analytics SDK is unavailable.
  }
};

export const logAnalyticsEvent = async (
  eventName: string,
  params: Record<string, string | number | boolean | null | undefined> = {},
) => {
  if (!analyticsCollectionEnabled) {
    return;
  }

  try {
    await logEvent(getAnalytics(), eventName, params);
  } catch {
    // Ignore telemetry-only failures.
  }
};

export const recordCrashlyticsError = (error: unknown, context?: string) => {
  try {
    const crashlyticsInstance = getCrashlytics();
    if (context) {
      logCrashlytics(crashlyticsInstance, context);
    }
    recordError(crashlyticsInstance, normalizeError(error));
  } catch {
    // Ignore telemetry-only failures.
  }
};

export const triggerCrashlyticsTestCrash = async () => {
  const crashlyticsInstance = getCrashlytics();
  await setCrashlyticsCollectionEnabled(crashlyticsInstance, true);
  logCrashlytics(crashlyticsInstance, 'manual_crashlytics_test_triggered');
  crashlyticsInstance.crash();
};
