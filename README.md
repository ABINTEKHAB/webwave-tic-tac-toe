# Webwave Tic Tac Toe (React Native)

Neon-themed Tic Tac Toe game built with React Native CLI for Android, with AdMob monetization, Firebase Analytics, and Crashlytics.

## Features

- Player vs AI and Player vs Player modes
- Difficulty selector (Easy, Medium, Hard)
- Sound + vibration controls
- In-app settings modal (privacy policy + ad consent entry)
- Interstitial + adaptive banner ads (AdMob)
- Crash reporting + analytics (Firebase)

## Tech Stack

- React Native `0.84.x`
- TypeScript
- Firebase (`@react-native-firebase/app`, `analytics`, `crashlytics`)
- `react-native-google-mobile-ads`

## Prerequisites

- Node.js `>= 20.19.4`
- JDK 17
- Android Studio + SDKs
- A connected Android device or emulator

## Install

```bash
npm install
```

## Run (Debug)

```bash
npm run start
```

In another terminal:

```bash
npm run android
```

## Build (Release)

### 1) Configure signing (local machine only)

Create `~/.gradle/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

Place `upload-keystore.jks` in `android/app/`.

### 2) Build AAB

```bash
npm run bundle:android
```

Output:

`android/app/build/outputs/bundle/release/app-release.aab`

### 3) Optional APK

```bash
npm run build:android:apk
```

## Versioning for Play Console

Android version values come from Gradle properties in `android/app/build.gradle`:

- `APP_VERSION_CODE` (must be unique for each upload)
- `APP_VERSION_NAME` (human-readable)

One-off build example:

```bash
cd android && ./gradlew bundleRelease -PAPP_VERSION_CODE=3 -PAPP_VERSION_NAME=1.1.1
```

## AdMob + Firebase Notes

- AdMob App ID is configured in `app.json`
- Ad unit IDs are in `src/ads/adMobConfig.ts`
- Firebase Android config file is `android/app/google-services.json` (ignored in git)
- Consent flow is initialized at app startup in `App.tsx`

## Play Store Docs Included

- `PLAY_STORE_RELEASE_CHECKLIST.md`
- `docs/PLAY_CONSOLE_DATA_SAFETY_ANSWERS.md`
- `docs/PLAY_STORE_LISTING_TEMPLATE.md`
- `docs/PRIVACY_POLICY.md`
- `docs/MONETIZATION_SETUP.md`

## NPM Scripts

- `npm run start` - Start Metro
- `npm run android` - Install and run debug app on Android
- `npm run bundle:android` - Build release AAB
- `npm run build:android:apk` - Build release APK
- `npm run clean:android` - Clean Android build

## Security

Do not commit:

- `android/app/google-services.json`
- Keystore files (`*.jks`, `*.keystore`)
- local env files (`.env`, `.env.local`)

Use `.env.example` and `android/app/google-services.json.example` as templates.
