"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCameraAI, type FrameData } from "./useCameraAI";
import { drawSkeleton } from "./Skeleton";
import MoodRing from "./MoodRing";
import { makePushupDetector } from "@/lib/exercises";
import { speak } from "@/lib/voice";

export default function PushupScreen({ onExit }: { onExit: () => void }) {
  const [reps, setReps] = useState(0);
  const [elbow, setElbow] = useState<number | null>(null);
  const [horizontal, setHorizontal] = useState(false);
  const [smile, setSmile] = useState<number | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);

  const voiceRef = useRef(true);
  voiceRef.current = voiceOn;
  const detectorRef = useRef(makePushupDetector());
  const repsRef = useRef(0);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  const onFrame = useCallback((f: FrameData) => {
    const v = videoElRef.current;
    const c = canvasElRef.current;
    if (!v || !c || !v.videoWidth) return;
    const w = v.videoWidth, h = v.videoHeight;
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    drawSkeleton(ctx, f.lm, w, h, "#00ffa3", 1, 5, 6);

    const r = detectorRef.current.update(f.lm);
    setElbow(r.elbow);
    setHorizontal(r.horizontal);
    setSmile(f.smile);
    if (r.rep) {
      repsRef.current += 1;
      setReps(repsRef.current);
      if (voiceRef.current) speak(`${repsRef.current}`);
    }
  }, []);

  const { videoRef, canvasRef, ready, err } = useCameraAI(onFrame);
  // mirror refs so onFrame can read them
  videoElRef.current = videoRef.current;
  canvasElRef.current = canvasRef.current;

  const depthPct = elbow != null ? Math.max(0, Math.min(100, ((170 - elbow) / 90) * 100)) : 0;

  return (
    <div className="relative h-full w-full bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover scale-x-[-1] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-20">
        <button onClick={onExit} className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xl">✕</button>
        <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-xs font-medium">{ready ? "Live · Pushups" : "Loading…"}</div>
        <button onClick={() => setVoiceOn((v) => !v)} className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-lg">{voiceOn ? "🔊" : "🔇"}</button>
      </div>

      <div className="absolute top-16 left-4 z-20"><MoodRing smile={smile} /></div>

      {!horizontal && ready && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-yellow-500/90 text-black text-sm font-semibold">
          Get in plank position
        </div>
      )}

      <div className="absolute top-36 left-0 right-0 flex flex-col items-center z-10">
        <motion.div key={reps} initial={{ scale: 0.8, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="text-[7rem] font-bold leading-none drop-shadow-lg">
          {reps}
        </motion.div>
        <div className="text-white/70 text-sm -mt-2 tracking-wide uppercase">pushups</div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div><div className="text-xs text-white/60 uppercase tracking-wide">Elbow</div><div className="text-lg font-semibold tabular-nums">{elbow != null ? `${Math.round(elbow)}°` : "—"}</div></div>
            <div className="text-right"><div className="text-xs text-white/60 uppercase tracking-wide">Form</div><div className={`text-lg font-semibold ${horizontal ? "text-accent" : "text-yellow-400"}`}>{horizontal ? "Good" : "Fix"}</div></div>
          </div>
          <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden mb-4">
            <div className="h-full bg-accent transition-all duration-100" style={{ width: `${depthPct}%` }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { repsRef.current = 0; setReps(0); detectorRef.current = makePushupDetector(); }} className="flex-1 rounded-full bg-white/10 py-3 text-sm font-medium">Reset</button>
            <button onClick={onExit} className="flex-1 rounded-full bg-accent text-black py-3 text-sm font-semibold">Done</button>
          </div>
        </div>
      </div>

      {err && (
        <div className="absolute inset-0 z-30 bg-black/90 flex items-center justify-center p-8 text-center">
          <div>
            <div className="text-5xl mb-4">📷</div>
            <h2 className="text-xl font-semibold mb-2">Camera unavailable</h2>
            <p className="text-white/60 text-sm mb-6">{err}</p>
            <Link href="/" className="rounded-full bg-white text-black font-semibold px-6 py-3">Go back</Link>
          </div>
        </div>
      )}
      {!ready && !err && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <div className="text-sm text-white/70">Loading AI models…</div>
        </div>
      )}
    </div>
  );
}
