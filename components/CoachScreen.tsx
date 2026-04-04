"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getPoseLandmarker, kneeAngles, L, type Landmarks } from "@/lib/pose";
import { getFaceLandmarker, smileScore } from "@/lib/face";
import { speak } from "@/lib/voice";

const SMILE_CUES = [
  "Hey, smile. Be happy. Don't worry.",
  "Chin up — you've got this.",
  "Come on, give me a smile.",
  "Breathe. Relax the face.",
  "You're doing great. Smile.",
];
const HAPPY_CUES = [
  "There it is.",
  "Love that smile.",
  "Beautiful. Keep going.",
  "Yes. That's the energy.",
];

type Phase = "up" | "down";
type Frame = { t: number; lm: Landmarks };

const SKELETON_PAIRS: [number, number][] = [
  [L.LEFT_SHOULDER, L.RIGHT_SHOULDER],
  [L.LEFT_SHOULDER, L.LEFT_HIP],
  [L.RIGHT_SHOULDER, L.RIGHT_HIP],
  [L.LEFT_HIP, L.RIGHT_HIP],
  [L.LEFT_HIP, L.LEFT_KNEE],
  [L.LEFT_KNEE, L.LEFT_ANKLE],
  [L.RIGHT_HIP, L.RIGHT_KNEE],
  [L.RIGHT_KNEE, L.RIGHT_ANKLE],
];

const JOINTS = [
  L.LEFT_HIP, L.RIGHT_HIP, L.LEFT_KNEE, L.RIGHT_KNEE,
  L.LEFT_ANKLE, L.RIGHT_ANKLE, L.LEFT_SHOULDER, L.RIGHT_SHOULDER,
];

const DOWN_THRESHOLD = 100;
const UP_THRESHOLD = 160;

export default function CoachScreen({ onExit }: { onExit: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState<Phase>("up");
  const [kneeAngle, setKneeAngle] = useState<number | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [hasGhost, setHasGhost] = useState(false);
  const [bestDepth, setBestDepth] = useState<number | null>(null);
  const [beatGhostToast, setBeatGhostToast] = useState(false);
  const [smile, setSmile] = useState<number | null>(null);
  const [moodCue, setMoodCue] = useState<string | null>(null);

  // refs to avoid re-creating the effect loop
  const phaseRef = useRef<Phase>("up");
  const repsRef = useRef(0);
  const voiceOnRef = useRef(true);
  const currentFramesRef = useRef<Frame[]>([]);
  const currentMinKneeRef = useRef(180);
  const phaseStartRef = useRef<number>(0);
  const bestFramesRef = useRef<Frame[]>([]);
  const bestDurationRef = useRef<number>(0);
  const bestDepthRef = useRef<number>(180); // lower = deeper
  const smileEmaRef = useRef<number>(0); // smoothed smile 0..1
  const notSmilingSinceRef = useRef<number>(0);
  const smilingSinceRef = useRef<number>(0);
  const lastMoodCueAtRef = useRef<number>(0);
  const isSmilingRef = useRef<boolean>(false);
  const frameCountRef = useRef<number>(0);

  useEffect(() => { voiceOnRef.current = voiceOn; }, [voiceOn]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;

    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (stopped) return;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();

        const [lm, fm] = await Promise.all([getPoseLandmarker(), getFaceLandmarker()]);
        if (stopped) return;
        setReady(true);
        if (voiceOnRef.current) speak("Let's go. Start when ready.");

        const loop = () => {
          if (stopped) return;
          const now = performance.now();
          const poseRes = lm.detectForVideo(v, now);
          drawAndScore(poseRes.landmarks?.[0], now);

          // face every other frame to save cycles
          frameCountRef.current++;
          if (frameCountRef.current % 2 === 0) {
            const faceRes = fm.detectForVideo(v, now);
            const raw = smileScore(faceRes.faceBlendshapes?.[0]?.categories);
            if (raw != null) updateMood(raw, now);
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Camera error";
        setErr(msg);
      }
    }

    function drawSkeleton(
      ctx: CanvasRenderingContext2D,
      landmarks: Landmarks,
      w: number, h: number,
      color: string, alpha: number, lineWidth: number, jointRadius: number
    ) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      for (const [a, b] of SKELETON_PAIRS) {
        const pa = landmarks[a], pb = landmarks[b];
        if (!pa || !pb) continue;
        ctx.beginPath();
        ctx.moveTo(pa.x * w, pa.y * h);
        ctx.lineTo(pb.x * w, pb.y * h);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      for (const i of JOINTS) {
        const p = landmarks[i];
        if (!p) continue;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, jointRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function sampleGhostAt(elapsed: number): Landmarks | null {
      const frames = bestFramesRef.current;
      if (frames.length === 0) return null;
      // find frame nearest to elapsed (clamped)
      const maxT = frames[frames.length - 1].t;
      const t = Math.min(elapsed, maxT);
      // binary search
      let lo = 0, hi = frames.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (frames[mid].t < t) lo = mid + 1;
        else hi = mid;
      }
      return frames[lo].lm;
    }

    function drawAndScore(landmarks: Landmarks | undefined, now: number) {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c) return;
      const w = v.videoWidth, h = v.videoHeight;
      if (!w || !h) return;
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      if (!landmarks) return;

      // ghost first (behind live)
      if (bestFramesRef.current.length > 0) {
        const elapsed = now - phaseStartRef.current;
        const ghostLm = sampleGhostAt(elapsed);
        if (ghostLm) drawSkeleton(ctx, ghostLm, w, h, "#f0abfc", 0.55, 3, 4);
      }

      // live skeleton
      drawSkeleton(ctx, landmarks, w, h, "#00ffa3", 1, 5, 6);

      // squat state machine
      const { avg } = kneeAngles(landmarks);
      setKneeAngle(avg);

      // record current phase trajectory
      currentFramesRef.current.push({ t: now - phaseStartRef.current, lm: landmarks });
      if (avg < currentMinKneeRef.current) currentMinKneeRef.current = avg;

      if (phaseRef.current === "up" && avg < DOWN_THRESHOLD) {
        // entering down
        phaseRef.current = "down";
        setPhase("down");
        phaseStartRef.current = now;
        currentFramesRef.current = [];
        currentMinKneeRef.current = avg;
        if (voiceOnRef.current) speak("Down");
      } else if (phaseRef.current === "down" && avg > UP_THRESHOLD) {
        // completed a rep
        phaseRef.current = "up";
        setPhase("up");
        repsRef.current += 1;
        setReps(repsRef.current);

        const achievedDepth = currentMinKneeRef.current;
        const beat = achievedDepth < bestDepthRef.current - 0.5; // must be meaningfully deeper
        if (beat) {
          // store as best ghost
          bestFramesRef.current = currentFramesRef.current.slice();
          bestDurationRef.current = now - phaseStartRef.current;
          bestDepthRef.current = achievedDepth;
          setBestDepth(achievedDepth);
          setHasGhost(true);
          setBeatGhostToast(true);
          setTimeout(() => setBeatGhostToast(false), 1800);
          if (voiceOnRef.current) speak(`New best. ${repsRef.current}`);
        } else {
          if (voiceOnRef.current) speak(`${repsRef.current}`);
        }

        // reset up-phase recording
        phaseStartRef.current = now;
        currentFramesRef.current = [];
        currentMinKneeRef.current = 180;
      }
    }

    function updateMood(raw: number, now: number) {
      // EMA smoothing so single-frame noise doesn't flip state
      const ema = smileEmaRef.current * 0.75 + raw * 0.25;
      smileEmaRef.current = ema;
      setSmile(ema);

      const SMILING = 0.35;
      const NOT_SMILING = 0.15;
      const wasSmiling = isSmilingRef.current;

      if (!wasSmiling && ema > SMILING) {
        isSmilingRef.current = true;
        smilingSinceRef.current = now;
        notSmilingSinceRef.current = 0;
        // celebrate transition into smile
        if (voiceOnRef.current && now - lastMoodCueAtRef.current > 4000) {
          const cue = HAPPY_CUES[Math.floor(Math.random() * HAPPY_CUES.length)];
          setMoodCue(cue);
          speak(cue);
          lastMoodCueAtRef.current = now;
          setTimeout(() => setMoodCue(null), 2200);
        }
      } else if (wasSmiling && ema < NOT_SMILING) {
        isSmilingRef.current = false;
        notSmilingSinceRef.current = now;
        smilingSinceRef.current = 0;
      }

      // if not smiling for 4s, gently nudge
      if (!isSmilingRef.current && notSmilingSinceRef.current > 0) {
        const since = now - notSmilingSinceRef.current;
        if (since > 4000 && now - lastMoodCueAtRef.current > 8000) {
          const cue = SMILE_CUES[Math.floor(Math.random() * SMILE_CUES.length)];
          setMoodCue(cue);
          if (voiceOnRef.current) speak(cue, 1500);
          lastMoodCueAtRef.current = now;
          notSmilingSinceRef.current = now; // reset window
          setTimeout(() => setMoodCue(null), 3200);
        }
      }
    }

    init();
    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const resetReps = () => {
    repsRef.current = 0;
    setReps(0);
    phaseRef.current = "up";
    setPhase("up");
    bestFramesRef.current = [];
    bestDepthRef.current = 180;
    setHasGhost(false);
    setBestDepth(null);
    if (voiceOnRef.current) speak("Reset. Let's go.");
  };

  const depthPct =
    kneeAngle != null ? Math.max(0, Math.min(100, ((180 - kneeAngle) / 100) * 100)) : 0;

  return (
    <div className="relative h-full w-full bg-black text-white overflow-hidden">
      {/* mirrored camera */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover scale-x-[-1] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-20">
        <Link
          href="/"
          className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xl"
          aria-label="Home"
        >
          ✕
        </Link>
        <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-xs font-medium">
          {ready ? "Live · Squats" : "Loading…"}
        </div>
        <button
          onClick={() => setVoiceOn((v) => !v)}
          className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-lg"
          aria-label="Toggle voice"
        >
          {voiceOn ? "🔊" : "🔇"}
        </button>
      </div>

      {/* mood ring — under the top bar, left side */}
      <div className="absolute top-16 left-4 z-20">
        <MoodRing smile={smile} />
      </div>

      {/* mood cue banner */}
      <AnimatePresence>
        {moodCue && (
          <motion.div
            key={moodCue}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-2xl bg-white text-black text-sm font-semibold shadow-xl max-w-[80%] text-center"
          >
            {moodCue}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ghost badge */}
      {hasGhost && (
        <div className="absolute top-16 right-4 z-20 px-2.5 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 backdrop-blur text-[11px] text-fuchsia-200 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300 animate-pulse" />
          Ghost · {bestDepth != null ? `${Math.round(bestDepth)}°` : ""}
        </div>
      )}

      {/* beat-ghost toast */}
      <AnimatePresence>
        {beatGhostToast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-fuchsia-500/30"
          >
            🏆 New personal best
          </motion.div>
        )}
      </AnimatePresence>

      {/* rep counter */}
      <div className="absolute top-28 left-0 right-0 flex flex-col items-center z-10">
        <motion.div
          key={reps}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="text-[7rem] font-bold leading-none drop-shadow-lg"
        >
          {reps}
        </motion.div>
        <div className="text-white/70 text-sm -mt-2 tracking-wide uppercase">reps</div>
      </div>

      {/* bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wide">Phase</div>
              <div className="text-lg font-semibold capitalize">{phase}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/60 uppercase tracking-wide">Knee</div>
              <div className="text-lg font-semibold tabular-nums">
                {kneeAngle != null ? `${Math.round(kneeAngle)}°` : "—"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60 uppercase tracking-wide">Best</div>
              <div className="text-lg font-semibold tabular-nums text-fuchsia-300">
                {bestDepth != null ? `${Math.round(bestDepth)}°` : "—"}
              </div>
            </div>
          </div>

          {/* depth gauge with best marker */}
          <div className="relative h-2 w-full rounded-full bg-white/15 overflow-hidden mb-4">
            <div
              className="h-full bg-accent transition-all duration-100"
              style={{ width: `${depthPct}%` }}
            />
            {bestDepth != null && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-fuchsia-400"
                style={{ left: `${Math.max(0, Math.min(100, ((180 - bestDepth) / 100) * 100))}%` }}
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetReps}
              className="flex-1 rounded-full bg-white/10 py-3 text-sm font-medium active:scale-[0.98] transition-transform"
            >
              Reset
            </button>
            <button
              onClick={onExit}
              className="flex-1 rounded-full bg-accent text-black py-3 text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* error overlay */}
      {err && (
        <div className="absolute inset-0 z-30 bg-black/90 flex items-center justify-center p-8 text-center">
          <div>
            <div className="text-5xl mb-4">📷</div>
            <h2 className="text-xl font-semibold mb-2">Camera unavailable</h2>
            <p className="text-white/60 text-sm mb-6">{err}</p>
            <Link href="/" className="rounded-full bg-white text-black font-semibold px-6 py-3">
              Go back
            </Link>
          </div>
        </div>
      )}

      {/* loading overlay */}
      {!ready && !err && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <div className="text-sm text-white/70">Loading AI models…</div>
        </div>
      )}
    </div>
  );
}

function MoodRing({ smile }: { smile: number | null }) {
  const s = smile ?? 0;
  const pct = Math.max(0, Math.min(1, s));
  const emoji = pct < 0.15 ? "😐" : pct < 0.35 ? "🙂" : pct < 0.6 ? "😊" : "😄";
  // circumference of r=18 circle
  const R = 18;
  const C = 2 * Math.PI * R;
  const dash = C * pct;

  return (
    <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10">
      <div className="relative h-10 w-10 flex items-center justify-center">
        <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
          <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
          <circle
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke="#fde047"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C - dash}`}
            style={{ transition: "stroke-dasharray 120ms linear" }}
          />
        </svg>
        <span className="text-lg leading-none select-none">{emoji}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wider text-white/50 leading-none">Mood</span>
        <span className="text-xs font-semibold tabular-nums leading-tight">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}
