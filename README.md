# PoseAI Coach

Real-time AI body-tracking fitness coach that runs entirely in the browser. Mobile-app feel, no install, no backend.

## Features

- **On-device pose AI** — MediaPipe PoseLandmarker on GPU. Camera never leaves the device.
- **Ghost Rep** — records your deepest squat and replays it as a translucent skeleton over your live one. Race your best self.
- **Voice coach** — Web Speech API calls reps and depth hands-free.
- **Mobile-app shell** — locked viewport, safe-area aware, story-style onboarding, frosted bottom sheet.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · `@mediapipe/tasks-vision` · Framer Motion · Web Speech API.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — landing page. Click **Launch app** or go to `/app` directly, then grant camera permission.

> Camera access needs `localhost` or HTTPS. Vercel provides HTTPS automatically.

## Routes

- `/` — marketing landing page
- `/app` — onboarding + live coach

## Deploy to Vercel

1. Push this repo to GitHub (see below).
2. Go to https://vercel.com/new, import the repo — no config needed.
3. Deploy → you get `https://<your-project>.vercel.app`.

Or via CLI:
```bash
npx vercel         # preview
npx vercel --prod  # production
```

## Push to GitHub

```bash
# create a repo on github.com first (empty, no README), then:
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

## Extend

- Swap `pose_landmarker_lite` → `_heavy` in [lib/pose.ts](lib/pose.ts) for better accuracy.
- Add exercises: push-ups (elbow angle), lunges, plank timer.
- Add `/api/coach` route with an LLM for personalised feedback from rolling landmark windows.
- Persist sessions with Supabase or your backend of choice.
