# Play Console Data Safety Answers (Webwave Tic Tac Toe)

Use this as a project-specific reference while filling Play Console -> `App content` -> `Data safety`.

Package: `com.webwavetictactoe`

## Assumptions (Current App)

- No user account/login
- No backend user profile storage
- AdMob ads enabled (banner + interstitial)
- Firebase Analytics enabled
- Firebase Crashlytics enabled
- Local settings (sound/vibration) stored only on-device via AsyncStorage

If app functionality changes later (login, cloud sync, IAP backend, etc.), update these answers.

## Top-Level Answers

### Does your app collect or share any of the required user data types?

- **Yes**

### Is all user data collected by your app encrypted in transit?

- **Yes**

### Do you provide a way for users to request that their data is deleted?

- **No** (current app scope)

## Data Types to Declare

### 1) Location -> Approximate location

- Collected: **Yes**
- Shared: **Yes**
- Processed ephemerally: **No**
- Required or optional: **Required**
- Purposes:
  - **Advertising or marketing**
  - **Analytics**
  - **Fraud prevention, security, and compliance**

### 2) App activity -> App interactions

- Collected: **Yes**
- Shared: **Yes**
- Processed ephemerally: **No**
- Required or optional: **Required**
- Purposes:
  - **Advertising or marketing**
  - **Analytics**
  - **Fraud prevention, security, and compliance**

### 3) App info and performance -> Crash logs

- Collected: **Yes**
- Shared: **No**
- Processed ephemerally: **No**
- Required or optional: **Required**
- Purposes:
  - **App functionality**
  - **Analytics**

### 4) App info and performance -> Diagnostics

- Collected: **Yes**
- Shared: **Yes**
- Processed ephemerally: **No**
- Required or optional: **Required**
- Purposes:
  - **App functionality**
  - **Analytics**
  - **Fraud prevention, security, and compliance**

### 5) Identifiers -> Device or other IDs

- Collected: **Yes**
- Shared: **Yes**
- Processed ephemerally: **No**
- Required or optional: **Required**
- Purposes:
  - **Advertising or marketing**
  - **Analytics**
  - **Fraud prevention, security, and compliance**

## Data Types Not Declared (Current App)

These are not collected/shared by the current app implementation:

- Name
- Email address
- Phone number
- Physical address
- Contacts
- Photos/videos
- Audio recordings (the app plays sounds but does not record audio)
- Files and docs
- Calendar
- Precise location
- Health and fitness data
- Financial/payment info
- Messages
- Web browsing history

## Notes for Consistency (Policy + Forms)

- Ads declaration must be **Yes** (AdMob is integrated).
- Privacy policy should mention:
  - AdMob
  - Firebase Analytics
  - Firebase Crashlytics
- If you change monetization or SDKs, re-check this form before the next release.

## Related Project Files

- `src/ads/adMobConfig.ts`
- `app.json`
- `src/services/firebaseTelemetry.ts`
- `docs/PRIVACY_POLICY.md`
