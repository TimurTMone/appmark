"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraAI, type FrameData } from "./useCameraAI";
import { drawSkeleton } from "./Skeleton";
import MoodRing from "./MoodRing";
import { makeBoxingDetector, COMBOS, type Punch, type PunchType } from "@/lib/exercises";
import { speak } from "@/lib/voice";

const TYPE_LABEL: Record<PunchType, string> = {
  jab: "JAB",
  cross: "CROSS",
  hook: "HOOK",
  uppercut: "UPPERCUT",
};
const TYPE_COLOR: Record<PunchType, string> = {
  jab: "#00ffa3",
  cross: "#f43f5e",
  hook: "#f0abfc",
  uppercut: "#fbbf24",
};

type FlashPunch = { id: number; type: PunchType; hand: "left" | "right" };

export default function BoxingScreen({ onExit }: { onExit: () => void }) {
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<PunchType, number>>({ jab: 0, cross: 0, hook: 0, uppercut: 0 });
  const [flash, setFlash] = useState<FlashPunch | null>(null);
  const [smile, setSmile] = useState<number | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [combo, setCombo] = useState<{ name: string; seq: PunchType[]; idx: number } | null>(null);
  const [comboScore, setComboScore] = useState(0);
  const [speedPeak, setSpeedPeak] = useState(0);

  const voiceRef = useRef(true); voiceRef.current = voiceOn;
  const detectorRef = useRef(makeBoxingDetector());
  const countsRef = useRef(counts);
  const totalRef = useRef(0);
  const comboRef = useRef<typeof combo>(null);
  const comboScoreRef = useRef(0);
  const comboDeadlineRef = useRef(0);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const flashIdRef = useRef(0);

  // combo caller: pick a new combo every 8s
  useEffect(() => {
    const pickCombo = () => {
      const c = COMBOS[Math.floor(Math.random() * COMBOS.length)];
      const next = { name: c.name, seq: c.combo, idx: 0 };
      comboRef.current = next;
      comboDeadlineRef.current = performance.now() + 5000;
      setCombo(next);
      if (voiceRef.current) speak(c.name.replace(/-/g, " "));
    };
    pickCombo();
    const iv = setInterval(pickCombo, 8000);
    return () => clearInterval(iv);
  }, []);

  const registerPunch = useCallback((p: Punch) => {
    // update counts
    countsRef.current = { ...countsRef.current, [p.type]: countsRef.current[p.type] + 1 };
    setCounts(countsRef.current);
    totalRef.current += 1;
    setTotal(totalRef.current);
    setSpeedPeak((prev) => Math.max(prev, p.speed));

    // flash
    const id = ++flashIdRef.current;
    setFlash({ id, type: p.type, hand: p.hand });
    setTimeout(() => setFlash((f) => (f && f.id === id ? null : f)), 500);

    // combo tracking
    const cc = comboRef.current;
    if (cc && performance.now() < comboDeadlineRef.current) {
      const expected = cc.seq[cc.idx];
      // treat jab/cross interchangeably with same-class straights to be forgiving
      const match =
        expected === p.type ||
        (expected === "jab" && p.type === "cross") ||
        (expected === "cross" && p.type === "jab");
      if (match) {
        const newIdx = cc.idx + 1;
        if (newIdx >= cc.seq.length) {
          comboScoreRef.current += 1;
          setComboScore(comboScoreRef.current);
          if (voiceRef.current) speak("Nice");
          comboRef.current = { ...cc, idx: 0 };
          setCombo({ ...cc, idx: 0 });
          comboDeadlineRef.current = performance.now() + 5000;
        } else {
          comboRef.current = { ...cc, idx: newIdx };
          setCombo({ ...cc, idx: newIdx });
        }
      }
    }
  }, []);

  const onFrame = useCallback((f: FrameData) => {
    const v = videoElRef.current, c = canvasElRef.current;
    if (!v || !c || !v.videoWidth) return;
    const w = v.videoWidth, h = v.videoHeight;
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    drawSkeleton(ctx, f.lm, w, h, "#ffffff", 0.85, 4, 5);
    setSmile(f.smile);

    const punch = detectorRef.current.update(f.lm, f.t);
    if (punch) registerPunch(punch);
  }, [registerPunch]);

  const { videoRef, canvasRef, ready, err } = useCameraAI(onFrame);
  videoElRef.current = videoRef.current;
  canvasElRef.current = canvasRef.current;

  const reset = () => {
    totalRef.current = 0; setTotal(0);
    countsRef.current = { jab: 0, cross: 0, hook: 0, uppercut: 0 }; setCounts(countsRef.current);
    comboScoreRef.current = 0; setComboScore(0);
    setSpeedPeak(0);
    detectorRef.current = makeBoxingDetector();
  };

  return (
    <div className="relative h-full w-full bg-black text-white overflow-hidden">
      {/* mirrored camera */}
      <div className="absolute inset-0">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover scale-x-[-1] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* full-screen punch flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.id}
            initial={{ opacity: 0.8, scale: 1.1 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: `radial-gradient(circle at ${flash.hand === "left" ? "25%" : "75%"} 50%, ${TYPE_COLOR[flash.type]}55, transparent 60%)` }}
          />
        )}
      </AnimatePresence>

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-30">
        <button onClick={onExit} className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xl">✕</button>
        <div className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur text-xs font-bold tracking-wide flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          {ready ? "LIVE · SHADOW" : "LOADING…"}
        </div>
        <button onClick={() => setVoiceOn((v) => !v)} className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-lg">{voiceOn ? "🔊" : "🔇"}</button>
      </div>

      <div className="absolute top-16 left-4 z-20"><MoodRing smile={smile} /></div>

      {/* combo caller */}
      {combo && (
        <div className="absolute top-16 right-4 z-20 px-3 py-2 rounded-2xl bg-black/60 backdrop-blur border border-white/10 text-right">
          <div className="text-[9px] uppercase tracking-widest text-white/50 leading-none">Combo</div>
          <div className="text-2xl font-black tabular-nums leading-tight mt-0.5">{combo.name}</div>
          <div className="flex gap-1 mt-1 justify-end">
            {combo.seq.map((p, i) => (
              <span
                key={i}
                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: i < combo.idx ? TYPE_COLOR[p] : "rgba(255,255,255,0.1)",
                  color: i < combo.idx ? "#000" : "rgba(255,255,255,0.6)",
                }}
              >
                {p[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* punch label flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={`l-${flash.id}`}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="absolute top-[42%] left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-2xl font-black text-3xl tracking-wider"
            style={{ background: `${TYPE_COLOR[flash.type]}22`, color: TYPE_COLOR[flash.type], border: `2px solid ${TYPE_COLOR[flash.type]}` }}
          >
            {TYPE_LABEL[flash.type]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* total counter */}
      <div className="absolute top-32 left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
        <motion.div
          key={total}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="text-[6rem] font-bold leading-none drop-shadow-lg"
        >
          {total}
        </motion.div>
        <div className="text-white/60 text-xs -mt-1 tracking-widest uppercase">punches thrown</div>
      </div>

      {/* bottom stats */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-4">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {(["jab","cross","hook","uppercut"] as PunchType[]).map((t) => (
              <div key={t} className="text-center rounded-xl bg-white/5 py-2">
                <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: TYPE_COLOR[t] }}>
                  {t === "jab" ? "1" : t === "cross" ? "2" : t === "hook" ? "3" : "5"}
                </div>
                <div className="text-xl font-bold tabular-nums">{counts[t]}</div>
                <div className="text-[9px] text-white/50 capitalize -mt-0.5">{t}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <div><span className="text-white/50 uppercase tracking-wider">Combos </span><span className="font-bold text-accent">{comboScore}</span></div>
            <div><span className="text-white/50 uppercase tracking-wider">Peak speed </span><span className="font-bold tabular-nums">{speedPeak.toFixed(1)}</span></div>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="flex-1 rounded-full bg-white/10 py-3 text-sm font-medium">Reset</button>
            <button onClick={onExit} className="flex-1 rounded-full bg-red-500 text-white py-3 text-sm font-semibold">End round</button>
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
