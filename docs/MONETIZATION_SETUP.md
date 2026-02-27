# Monetization Setup Guide (Play Console)

## Option A: Paid App (Fastest)

1. Open Play Console -> your app -> `Monetize` -> `Products` -> `App pricing`.
2. Select `Paid`.
3. Set base price and regional prices.
4. Save and publish with a production release.

## Option B: In-App Ads (AdMob)

1. Create app in AdMob and link with Play app.
2. Create ad units (Banner / Interstitial / Rewarded).
3. Set AdMob App ID in `app.json` under `react-native-google-mobile-ads.android_app_id`.
4. Set production ad unit IDs in `src/ads/adMobConfig.ts`:
   - `PROD_BANNER_UNIT_ID`
   - `PROD_INTERSTITIAL_UNIT_ID`
5. Build and test:
   - `npm run android` (debug test ads)
   - `npm run bundle:android` (release bundle check)
6. In Play Console, complete:
   - Ads declaration = `Yes`
   - Data safety answers aligned with AdMob SDK usage
   - Updated privacy policy URL

## Option C: In-App Purchases

1. Play Console -> `Monetize` -> `Products` -> `In-app products` or `Subscriptions`.
2. Create product IDs and prices.
3. Implement Google Play Billing in app code.
4. Validate purchase flow in Internal testing before production.

## Important

- Publishing app alone does not generate earnings.
- Earnings need active monetization + user installs/engagement.
- Keep policy declarations in sync with the monetization model you use.
- Never ship with placeholder ad unit IDs; use your own production IDs before live release.
