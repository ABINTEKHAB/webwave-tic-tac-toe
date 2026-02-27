import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

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
    await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
  } catch {
    // Do not block app startup for telemetry failures.
  }

  try {
    await analytics().setAnalyticsCollectionEnabled(true);
  } catch {
    // Do not block app startup for telemetry failures.
  }
};

export const logScreenView = async (screenName: string) => {
  try {
    await analytics().logScreenView({
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
  try {
    await analytics().logEvent(
      eventName as Parameters<ReturnType<typeof analytics>['logEvent']>[0],
      params,
    );
  } catch {
    // Ignore telemetry-only failures.
  }
};

export const recordCrashlyticsError = (error: unknown, context?: string) => {
  try {
    if (context) {
      crashlytics().log(context);
    }
    crashlytics().recordError(normalizeError(error));
  } catch {
    // Ignore telemetry-only failures.
  }
};

export const triggerCrashlyticsTestCrash = async () => {
  await crashlytics().setCrashlyticsCollectionEnabled(true);
  crashlytics().log('manual_crashlytics_test_triggered');
  crashlytics().crash();
};
