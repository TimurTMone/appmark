"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCameraAI, type FrameData } from "./useCameraAI";
import { drawSkeleton } from "./Skeleton";
import { makeSquatDetector, makePushupDetector } from "@/lib/exercises";
import { speak } from "@/lib/voice";

export type ExerciseType = "squat" | "pushup";

const LABELS: Record<ExerciseType, string> = {
  squat: "Squats",
  pushup: "Pushups",
};

type Props = {
  type: ExerciseType;
  target: number;
  onComplete: (reps: number) => void;
};

export default function ExerciseRunner({ type, target, onComplete }: Props) {
  const [reps, setReps] = useState(0);
  const [angle, setAngle] = useState<number | null>(null);
  const [horizontal, setHorizontal] = useState(true);

  const repsRef = useRef(0);
  const detectorRef = useRef(type === "squat" ? makeSquatDetector() : makePushupDetector());
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  const onFrame = useCallback((f: FrameData) => {
    const v = videoElRef.current, c = canvasElRef.current;
    if (!v || !c || !v.videoWidth) return;
    const w = v.videoWidth, h = v.videoHeight;
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    drawSkeleton(ctx, f.lm, w, h, "#00ffa3", 1, 5, 6);

    const d = detectorRef.current as ReturnType<typeof makeSquatDetector> | ReturnType<typeof makePushupDetector>;
    const r = d.update(f.lm);
    if ("knee" in r) { setAngle(r.knee); }
    else if ("elbow" in r) { setAngle(r.elbow); setHorizontal(r.horizontal); }

    if (r.rep) {
      repsRef.current += 1;
      setReps(repsRef.current);
      speak(`${repsRef.current}`);
      if (repsRef.current >= target && !completedRef.current) {
        completedRef.current = true;
        speak("Set complete. Nice work.");
        setTimeout(() => onComplete(repsRef.current), 900);
      }
    }
  }, [target, onComplete]);

  const { videoRef, canvasRef, ready, err } = useCameraAI(onFrame);
  videoElRef.current = videoRef.current;
  canvasElRef.current = canvasRef.current;

  const pct = Math.min(100, (reps / target) * 100);

  return (
    <div className="relative h-full w-full bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover scale-x-[-1] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* progress ring */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">{LABELS[type]}</div>
          <div className="text-xs text-white/70 tabular-nums">{reps} / {target}</div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
          <div className="h-full bg-accent transition-all duration-200" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {type === "pushup" && !horizontal && ready && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-yellow-500/90 text-black text-sm font-semibold">
          Get in plank position
        </div>
      )}

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          key={reps}
          initial={{ scale: 0.85, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="text-[8rem] font-bold leading-none drop-shadow-2xl"
        >
          {reps}
        </motion.div>
        <div className="text-white/70 text-xs tracking-widest uppercase -mt-1">of {target}</div>
        {angle != null && (
          <div className="mt-4 text-sm text-white/50 tabular-nums">{Math.round(angle)}°</div>
        )}
      </div>

      {err && (
        <div className="absolute inset-0 z-30 bg-black/90 flex items-center justify-center p-8 text-center">
          <div>
            <div className="text-5xl mb-4">📷</div>
            <h2 className="text-xl font-semibold mb-2">Camera needed</h2>
            <p className="text-white/60 text-sm">{err}</p>
          </div>
        </div>
      )}
      {!ready && !err && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <div className="text-sm text-white/70">Starting camera…</div>
        </div>
      )}
    </div>
  );
}
