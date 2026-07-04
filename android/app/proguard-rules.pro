# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Required for Google Mobile Ads SDK (react-native-google-mobile-ads).
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.ads.rewardedinterstitial.** { *; }
-keep class com.google.android.gms.ads.rewarded.** { *; }
-keep interface com.google.android.gms.ads.** { *; }
-keep interface com.google.android.gms.ads.rewardedinterstitial.** { *; }
-keep interface com.google.android.gms.ads.rewarded.** { *; }

# Required for Google UMP consent flow.
-keep class com.google.android.gms.internal.consent_sdk.** { *; }
-keep interface com.google.android.gms.internal.consent_sdk.** { *; }

# Required for React Native Sound library.
-keep class com.zmxv.RNSound.** { *; }
-keepclassmembers class com.zmxv.RNSound.** { *; }

# Preserve sound resource references.
-keepclasseswithmembernames class * {
  public static final int sound*;
}
