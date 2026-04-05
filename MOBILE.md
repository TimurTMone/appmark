# Shipping Arc to the App Store & Play Store

## Architecture

Arc ships to native stores as a **Capacitor WebView wrapper** that loads the live
Vercel URL, with native bindings for camera permissions, status bar, and splash
screen. This means:

- Server-side updates deploy to Vercel — no App Store review wait for most changes
- Camera, haptics, and status bar use native iOS/Android APIs
- Same codebase ships to web + iOS + Android

## One-time prerequisites

### Apple (iOS)
- [ ] Mac with Xcode 15+ installed
- [ ] Apple Developer Program membership ($99/yr) — https://developer.apple.com/programs/
- [ ] App Store Connect account — https://appstoreconnect.apple.com
- [ ] Privacy policy URL (required for camera usage). Hosted on your site, e.g. `https://appmark.vercel.app/privacy`

### Google (Android)
- [ ] Android Studio installed
- [ ] Google Play Console account ($25 one-time) — https://play.google.com/console
- [ ] Upload keystore generated (see keystore section below)

### Both
- [ ] App icon 1024×1024 PNG (master — stores resize for you)
- [ ] Screenshots (iPhone 6.5" and 5.5" minimum; Android multiple sizes)
- [ ] App description, keywords, support URL, marketing URL
- [ ] Privacy policy URL

## Step 1 — Generate iOS + Android projects

```bash
# From the repo root
npm run mobile:init
```

This runs `cap add ios && cap add android && cap sync`. It will create:
- `ios/` — Xcode project
- `android/` — Android Studio project

Both folders are generated — don't commit them if you want to regenerate them,
or do commit them if you plan to hand-edit native code.

## Step 2 — Add native permissions

### iOS (Info.plist)

After `cap add ios`, open `ios/App/App/Info.plist` in Xcode and paste in the
keys from [mobile/ios-snippets/Info.plist.additions.xml](mobile/ios-snippets/Info.plist.additions.xml).

Minimum required: `NSCameraUsageDescription` — without this the app crashes
when the camera prompt appears.

### Android (AndroidManifest.xml)

After `cap add android`, open `android/app/src/main/AndroidManifest.xml` and
paste the entries from
[mobile/android-snippets/AndroidManifest.additions.xml](mobile/android-snippets/AndroidManifest.additions.xml).

## Step 3 — App icons + splash screen

Capacitor generates native icons from a single master image. Put a
**1024×1024 PNG** at `resources/icon.png` and a **2732×2732 PNG** at
`resources/splash.png` (centered logo on black bg), then run:

```bash
npx @capacitor/assets generate --ios --android
```

This populates all native icon sizes and splash variants automatically.

## Step 4 — Set your server URL

Edit [capacitor.config.ts](capacitor.config.ts):

```ts
server: {
  url: "https://<your-production-domain>.vercel.app",
}
```

Then sync:
```bash
npm run cap:sync
```

## Step 5 — Build iOS

```bash
npm run cap:ios   # opens Xcode
```

In Xcode:
1. Select the **App** target
2. Set **Team** to your Apple Developer team
3. Set **Bundle Identifier** to `app.arc.coach` (or your own)
4. Set **Version** (e.g. 1.0.0) and **Build** (e.g. 1)
5. Product → **Archive**
6. Distribute App → App Store Connect → Upload
7. Go to App Store Connect → TestFlight → process build → add testers
8. Once happy, submit for review

**First submission typically takes 24–48h for review.**

## Step 6 — Build Android

```bash
npm run cap:android   # opens Android Studio
```

In Android Studio:
1. Build → **Generate Signed Bundle / APK** → **Android App Bundle (.aab)**
2. First time: create a new keystore — save it and the passwords **somewhere safe** (Google Play requires this same key forever)
3. Select **release** build variant
4. The `.aab` file is created in `android/app/release/`
5. Upload in Google Play Console → your app → Production → Create release

**First submission typically takes a few hours to 1–2 days.**

## App Store Connect — text fields you'll need

- **Name**: Arc
- **Subtitle**: AI form coach for your sport
- **Category**: Sports (primary), Health & Fitness (secondary)
- **Age rating**: 4+
- **Description** (4000 char max):

```
Arc is a real-time AI form coach for basketball, golf, and tennis. Point your phone camera at yourself, and Arc breaks down your mechanics frame by frame — comparing your form to research-calibrated professional biomechanics.

BASKETBALL — Free throw, jump shot, three-point
• Elbow angle at release, release arc, apex-timing analysis
• Shot-type-aware scoring: jump shot requires real vertical
• Detects when you release on the way up vs at your apex

GOLF — Face-on swing analysis
• X-Factor (hip-shoulder separation at top)
• Weight shift to lead foot through impact
• Head stability, swing tempo, spine-angle consistency

TENNIS — Serve kinetic chain
• Knee flexion at trophy (the #1 predictor of serve speed)
• Racket drop depth, contact height, arm extension
• Jump amplitude + trophy→contact timing

HOW IT WORKS
Arc runs a pose AI model directly on your device at 30+ FPS. After every rep it fires the single most important correction out loud — usually within 200ms of detection. Your video never leaves your phone.

No sensors. No subscriptions. No gimmicks. Just the numbers.
```

- **Keywords**: tennis serve, basketball form, golf swing, AI coach, biomechanics, shooting form, form tracker
- **Privacy policy URL**: `https://<your-domain>/privacy`
- **Support URL**: `https://<your-domain>`
- **Marketing URL**: `https://<your-domain>`

## Privacy policy essentials (required for camera apps)

The policy must state:
1. You request camera access for on-device pose analysis
2. Video is processed locally and is NOT uploaded to any server
3. No personal data is collected or sold
4. What analytics/telemetry (if any) you do collect

Draft at `app/privacy/page.tsx` — add it as a new page if you don't already
have one. Apple rejects apps without a privacy policy URL that returns 200.

## App review rejection risks (and how to avoid them)

| Risk | Mitigation |
|---|---|
| "App is just a website in a box" | Call out native camera usage in your App Review notes. Our camera permission + haptics qualify. |
| "Camera access without clear purpose" | `NSCameraUsageDescription` explains on-device pose tracking. Match the wording in-app. |
| "Missing privacy policy" | Ship `/privacy` page before submitting. |
| "Generic fitness claim without disclaimer" | Add "For training aid only, not medical advice." to onboarding. |

## Live updates

Because we're a wrapper, **any Vercel deployment updates the live app**. You
only need a new App Store submission when:
- You change native code (Info.plist, Android manifest, native plugins)
- You change the app icon or splash screen
- Apple demands it

## Keystore safety (Android)

**CRITICAL:** back up `~/.android/keystore/arc.keystore` and its passwords to a
password manager. Google Play Console permanently ties your app to this
keystore. Losing it means creating a new app listing from scratch.

## Useful commands

```bash
# Sync web assets into native projects after changes
npm run cap:sync

# Open each native IDE
npm run cap:ios
npm run cap:android

# Regenerate icons & splash from resources/
npx @capacitor/assets generate --ios --android

# Run on a connected iOS device (with Xcode Dev signing)
npx cap run ios --target="<device-id>"

# Run on Android emulator / device
npx cap run android
```
