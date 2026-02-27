# Play Store Release Checklist (Android)

Project: `Webwave Tic Tac Toe` (`com.webwavetictactoe`)  
Version: `1.1.0` (update before each release if needed)

Date reference: February 22, 2026

## 1) Code & Build Readiness (Current Status)

- [x] React Native upgraded to `0.84.x` (`package.json`)
- [x] Android package name set to `com.webwavetictactoe`
- [x] Firebase Analytics integrated
- [x] Firebase Crashlytics integrated and test crash verified
- [x] AdMob integrated (banner + interstitial)
- [x] Ads consent flow (UMP) implemented
- [x] Privacy policy file updated with Firebase + AdMob disclosure (`docs/PRIVACY_POLICY.md`)
- [x] Release AAB build working (`npm run bundle:android`)
- [x] Release signing configured via Gradle properties (keep secrets out of repo)

## 2) Secrets & Signing (Required Before Release Builds)

Recommended location for signing credentials:

- `~/.gradle/gradle.properties` (global machine file, not committed)

Required keys:

```properties
MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

Notes:

- Keep `android/app/upload-keystore.jks` backed up safely.
- Do not keep real passwords in `android/gradle.properties`.

## 3) Production Build Commands

Clean (optional before final release):

```bash
npm run clean:android
```

Build Play Store bundle (AAB):

```bash
npm run bundle:android
```

Output:

- `android/app/build/outputs/bundle/release/app-release.aab`

Optional release APK (real-device manual testing):

```bash
npm run build:android:apk
```

## 4) Firebase Final Checks (Current App Scope)

- [x] Real `google-services.json` in `android/app/google-services.json`
- [x] Debug `SHA-1` + `SHA-256` added in Firebase
- [x] Upload `SHA-1` + `SHA-256` added in Firebase
- [x] Analytics events visible in Firebase
- [x] Crashlytics test report received

Later (after Play upload):

- [ ] Add Play App Signing `SHA-1`
- [ ] Add Play App Signing `SHA-256`

Path:

- Play Console -> `Setup` -> `App integrity`
- Firebase -> `Project settings` -> `General` -> Android app -> `SHA certificate fingerprints`

## 5) AdMob Final Checks

- [x] AdMob App ID configured in `app.json`
- [x] Production Banner Ad Unit ID configured in `src/ads/adMobConfig.ts`
- [x] Production Interstitial Ad Unit ID configured in `src/ads/adMobConfig.ts`
- [x] Consent flow button available in settings (`Privacy & Ads Consent`)
- [ ] AdMob app linked to Firebase (recommended)
- [ ] Confirm ad units active/approved in AdMob console

## 6) Play Console Submission Order (Exact Sequence)

### Step A: Internal Testing Track Upload (Do this first)

1. Play Console -> `Testing` -> `Internal testing`
2. `Create new release`
3. Upload `android/app/build/outputs/bundle/release/app-release.aab`
4. Add release notes
5. `Save`
6. `Review release`
7. `Start rollout to Internal testing`
8. Add testers (emails or Google Group)
9. Install from opt-in link and validate app on real device

### Step B: App Content / Compliance

Complete these before production rollout:

1. `App content` -> `Data safety`
2. `App content` -> `Ads` (set `Yes`)
3. `App content` -> `Privacy policy` (public HTTPS URL)
4. `App content` -> `Content rating`
5. `App content` -> `App access` (if applicable; usually `No restrictions` for this game)
6. `Target audience` / `News app` declarations as applicable

### Step C: Store Listing

1. `Store presence` -> `Main store listing`
2. Add:
   - App name
   - Short description
   - Full description
   - Screenshots
   - Icon
   - Feature graphic
   - Contact details
   - Privacy policy URL

Use `docs/PLAY_STORE_LISTING_TEMPLATE.md` for ready copy.

### Step D: Production Release

1. `Production` -> `Create new release`
2. Upload tested AAB (or promote tested release)
3. Review policy warnings/checks
4. Start with staged rollout (recommended)

## 7) Pre-Production QA (Release Build)

- [ ] Test on at least 2-3 real Android devices (small + normal screen)
- [ ] Verify splash/app icon
- [ ] Verify game board layout and ad banner spacing
- [ ] Verify sound/vibration settings persist after app restart
- [ ] Verify ads show correctly and replay button remains above banner
- [ ] Verify no crash on cold start/background-resume
- [ ] Verify no internal QA buttons visible (Crashlytics test button disabled)

## 8) What Generates Earnings (Reality Check)

Publishing app alone does not generate income.

Revenue requires:

- Ads impressions/clicks (AdMob), and/or
- Paid app pricing, and/or
- In-app purchases/subscriptions

For this app, current monetization path is:

- AdMob banner + interstitial ads

## 9) Post-Launch Monitoring (First 72 Hours)

- [ ] Firebase Crashlytics (crashes)
- [ ] Firebase Analytics (active usage events)
- [ ] Play Console -> Android vitals (ANR/crash)
- [ ] AdMob fill rate / requests / impressions
- [ ] User reviews and early bug reports
