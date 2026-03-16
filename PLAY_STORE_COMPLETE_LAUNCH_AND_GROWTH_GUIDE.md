# Webwave Tic Tac Toe: Complete Launch + Growth Guide

Project: `Webwave Tic Tac Toe`  
Package: `com.webwavetictactoe`  
Owner: `webwaveglobal@gmail.com`  
Last updated: February 28, 2026

This document is the single source of truth for:

- Production readiness
- Play Console publishing flow
- Firebase + AdMob validation
- app-ads.txt verification
- Post-launch promotion and growth
- Early revenue optimization

---

## 1) Production Readiness (Final Go/No-Go)

## 1.1 Build and Core Config

- [ ] Package name final and consistent: `com.webwavetictactoe`
- [ ] `versionCode` increased for next upload
- [ ] `versionName` updated for release notes clarity
- [ ] Release keystore available and backed up
- [ ] Signing passwords are not committed in repo
- [ ] No debug/test-only code in release build

## 1.2 Functional Stability

- [ ] App opens on emulator and real device
- [ ] No crash on startup
- [ ] No crash on game start/end/reset/settings
- [ ] Privacy policy button opens website URL
- [ ] Manage Ad Consent button triggers consent flow
- [ ] Winner modal and draw modal show correct state

## 1.3 UI/UX Stability

- [ ] Layout tested on small/medium/tall phones
- [ ] Board not clipped by ad banner
- [ ] Reset button visible above banner
- [ ] No random background bars/stripes in buttons/icons
- [ ] Theme colors/font/glow consistent across all screens

## 1.4 Policy/Store Compliance

- [ ] Privacy policy live on HTTPS URL
- [ ] Data Safety form completed
- [ ] Ads declaration set to Yes
- [ ] Content rating completed
- [ ] App access declaration completed (if needed)

---

## 2) Release Build Commands

Run from project root:

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

Release output:

- `android/app/build/outputs/bundle/release/app-release.aab`

Optional release APK (manual install/test):

```bash
cd android
./gradlew assembleRelease
```

---

## 3) Version Code Rule (Important)

If Play Console shows `Version code X has already been used`:

1. Open `android/app/build.gradle`
2. Increase `versionCode` to a new higher integer
3. Optionally increase `versionName`
4. Rebuild AAB and upload again

Example:

- Previous: `versionCode 2`
- New: `versionCode 3`

---

## 4) Play Console Upload Flow (Exact)

## 4.1 Internal Testing

1. Play Console -> Testing -> Internal testing
2. Create new release
3. Upload AAB
4. Add release notes
5. Review and roll out
6. Add testers and test on real device

## 4.2 Closed Testing

1. Testing -> Closed testing
2. Create release with new `versionCode`
3. Add testers group
4. Rollout and gather stability feedback

## 4.3 Production

1. Production -> Create release
2. Prefer promote tested build from Closed track
3. Start staged rollout (recommended): 10% -> 25% -> 50% -> 100%

---

## 5) Firebase Setup and Final Validation

## 5.1 Mandatory SHA fingerprints

Add all in Firebase Android app settings:

- Debug SHA-1
- Debug SHA-256
- Upload SHA-1
- Upload SHA-256
- Play App Signing SHA-1 (after Play setup)
- Play App Signing SHA-256 (after Play setup)

Where Play App Signing SHA milega:

- Play Console -> Setup -> App integrity -> App signing key certificate

Where add karna hai:

- Firebase Console -> Project settings -> General -> Android app -> SHA certificate fingerprints

## 5.2 5-Minute Firebase Verification

Analytics:

1. Open app on real device
2. Do 2-3 events
3. Firebase -> Analytics -> DebugView -> events should appear

Crashlytics:

1. Trigger controlled test crash once
2. Reopen app
3. Firebase -> Crashlytics -> crash report appears
4. Remove test-crash trigger code before production

---

## 6) AdMob Setup and Final Validation

## 6.1 App Side

- [ ] Correct AdMob App ID configured
- [ ] Correct production ad unit IDs configured
- [ ] Consent flow integrated and callable from settings
- [ ] Test device IDs removed for production

## 6.2 AdMob Console Side

- [ ] App added with correct package name
- [ ] Ad units created and active
- [ ] Privacy & Messaging forms created and published:
  - GDPR consent
  - US privacy states form

Note:

- Ads can show during testing even if app review/verification is still pending.

---

## 7) app-ads.txt (Revenue Critical)

Required URL:

- `https://webwaveglobal.com/app-ads.txt`

Required line (example from your account):

```txt
google.com, pub-9812515008053738, DIRECT, f08c47fec0942fa0
```

Must-follow rules:

- File must be plain text, not HTML page
- Domain must exactly match Play Console developer website domain
- No typo in publisher ID
- Wait 24-72 hours for AdMob crawler refresh

If still not verified:

1. Recheck exact line in AdMob setup instructions
2. Recheck Play Console developer website domain
3. Click `Check for updates` in AdMob
4. Wait again (crawler delay is common)

---

## 8) AdMob, Firebase, Google Ads Linking (Clear Reality)

## 8.1 AdMob <-> Firebase

- Useful for deeper analytics and monetization reporting
- Not mandatory for basic ad serving
- UI link option may be hidden/delayed in new/review-pending accounts

## 8.2 AdMob <-> Google Ads

- Needed only if you want advanced campaign/account workflows
- Not required for normal AdMob ad serving in app

## 8.3 Launch Decision Rule

Do not block launch only because linked-services badge says `Not linked`, if:

- App build stable
- Consent works
- Ads are serving
- app-ads.txt correct and live
- Play policy forms complete

---

## 9) Play Console Compliance Checklist

Complete and recheck all:

1. App content -> Privacy policy URL
2. App content -> Ads declaration
3. App content -> Data Safety
4. App content -> Content rating
5. Store listing -> short/full description
6. Store listing -> icon/screenshots/feature graphic
7. Contact details -> support email and website

Use these project docs for final copy:

- `PLAY_STORE_RELEASE_CHECKLIST.md`
- `docs/PLAY_CONSOLE_DATA_SAFETY_ANSWERS.md`
- `docs/PLAY_STORE_LISTING_TEMPLATE.md`
- `docs/PRIVACY_POLICY.md`
- `docs/MONETIZATION_SETUP.md`

---

## 10) Post-Live 30 Day Growth Plan

## Day 0-3: Launch Base

- Publish 10-15 short videos (Reels/Shorts)
- Put Play Store link in profile + bio + story highlights
- Ask testers to leave first reviews
- Track: installs/day, crash-free users, D1 retention

## Day 4-10: Install Ads Start

- Run Google Ads App Campaign (Android installs)
- Test multiple creatives (3-5)
- Start with controlled daily budget
- Pause poor creatives quickly

## Day 11-20: Retention + Revenue Optimization

- Improve first-session experience
- Keep ads non-intrusive
- Show interstitials at natural breaks only
- Add rewarded ad placements thoughtfully

## Day 21-30: Scale Winners

- Increase budget only for profitable campaigns
- A/B test Play listing icon/screenshot/title
- Repeat winning creative style

---

## 11) KPI Targets for Healthy Early Growth

Track weekly:

- Crash-free users >= 99%
- D1 retention >= 25%
- D7 retention >= 8-12%
- Stable ANR/crash trend in Play vitals
- Ad fill rate stable
- eCPM trend improving
- ARPDAU improving gradually

If retention is low, fix product first, then scale paid installs.

---

## 12) Common Issues and Fast Fix

### Issue: `INSTALL_FAILED_USER_RESTRICTED`

Cause:

- Device/user-level install blocked or user canceled install

Fix:

- Allow install prompts on device
- Disable restriction and retry install

### Issue: app-ads.txt not verified

Cause:

- Crawler delay or mismatch in domain/publisher line

Fix:

- Verify plain text URL + exact line + correct domain in Play Console
- Wait 24-72h and recheck

### Issue: version code already used

Fix:

- Increase `versionCode`, rebuild, reupload

---

## 13) Security and Secrets Hygiene

- Never commit real API keys/passwords
- Keep only placeholders in `.env.example`
- Keep keystore passwords in global machine file, not repo
- Rotate any key ever exposed publicly

---

## 14) Final Green Signal (Before Wider Rollout)

Proceed to wider rollout if all are true:

- [ ] Internal/Closed testing stable
- [ ] No critical crash in Crashlytics
- [ ] Privacy policy URL works from app
- [ ] Consent flow works from app settings
- [ ] Ads are serving correctly
- [ ] app-ads.txt URL is live and valid
- [ ] Play forms completed and accepted

If all checked, you can safely move to next rollout stage.

---

## 15) Quick Command Box

Signing report:

```bash
cd android
./gradlew signingReport
```

Release AAB:

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

Run app on Android:

```bash
npm run android
```

