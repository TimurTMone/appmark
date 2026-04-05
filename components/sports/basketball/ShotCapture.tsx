"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraAI, type FrameData } from "@/components/useCameraAI";
import { drawSkeleton } from "@/components/Skeleton";
import { makeShotDetector, type ShotPhase } from "@/lib/sports/basketball/shotDetector";
import { evaluateShot, topVoiceCue, type Cue } from "@/lib/sports/basketball/shotRules";
import type { ShotMetrics } from "@/lib/sports/basketball/shotMetrics";
import type { ShotTypeConfig } from "@/lib/sports/basketball/shotTypes";
import { speak } from "@/lib/voice";
import { record as recordLatency, stats as latencyStats } from "@/lib/telemetry/latency";

type Props = { config: ShotTypeConfig };
type ShotRow = { metrics: ShotMetrics; cue: Cue; latencyMs: number; n: number; jumpDetected: boolean };

export default function ShotCapture({ config }: Props) {
  const shotType = config.id;
  const shotTypeLabel = config.label;
  const [phase, setPhase] = useState<ShotPhase>("idle");
  const [shots, setShots] = useState<ShotRow[]>([]);
  const [banner, setBanner] = useState<Cue | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [lat, setLat] = useState<{ n: number; p50: number; p95: number; last: number | null }>({ n: 0, p50: 0, p95: 0, last: null });

  const voiceRef = useRef(true); voiceRef.current = voiceOn;
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const shotCountRef = useRef(0);

  const onShot = useCallback((metrics: ShotMetrics, detectedAt: number, jumpDetected: boolean) => {
    const cues = evaluateShot(metrics, config, jumpDetected);
    const top = topVoiceCue(cues);
    const speakStart = performance.now();
    if (voiceRef.current) speak(top.voice, 0);
    const latency = speakStart - detectedAt;
    recordLatency("detect-to-audio", latency);
    setLat(latencyStats("detect-to-audio"));

    shotCountRef.current += 1;
    const row: ShotRow = { metrics, cue: top, latencyMs: latency, n: shotCountRef.current, jumpDetected };
    setShots((prev) => [row, ...prev].slice(0, 10));
    setBanner(top);
    setTimeout(() => setBanner((b) => (b?.id === top.id ? null : b)), 2800);
  }, [config]);

  const detectorRef = useRef(makeShotDetector(config));
  useEffect(() => {
    detectorRef.current = makeShotDetector(config, {
      onShot: (e) => onShot(e.metrics, e.detectedAt, e.jumpDetected),
    });
  }, [onShot, config]);

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

    const r = detectorRef.current.update(f.lm, f.t);
    if (r.phase !== phase) setPhase(r.phase);
  }, [phase]);

  const { videoRef, canvasRef, ready, err } = useCameraAI(onFrame);
  videoElRef.current = videoRef.current;
  canvasElRef.current = canvasRef.current;

  const phaseColor: Record<ShotPhase, string> = {
    idle: "bg-white/20 text-white/70",
    loading: "bg-yellow-400 text-black",
    releasing: "bg-accent text-black",
    cooldown: "bg-fuchsia-500/80 text-white",
  };

  return (
    <div className="relative h-[100dvh] w-full bg-black text-white overflow-hidden">
      {/* camera */}
      <div className="absolute inset-0">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover scale-x-[-1] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-20">
        <Link href="/train/basketball" className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xl">✕</Link>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/60">Basketball · {shotTypeLabel}</div>
          <div className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${phaseColor[phase]}`}>{phase}</div>
        </div>
        <button onClick={() => setVoiceOn((v) => !v)} className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-lg">{voiceOn ? "🔊" : "🔇"}</button>
      </div>

      {/* setup tip while idle & no shots */}
      {ready && phase === "idle" && shots.length === 0 && (
        <div className="absolute top-20 left-4 right-4 z-10 rounded-2xl bg-black/60 backdrop-blur border border-white/10 p-4 text-center">
          <div className="text-sm font-semibold mb-1">{config.label} · get set up</div>
          <div className="text-xs text-white/70 leading-relaxed">{config.setupTip}</div>
        </div>
      )}

      {/* post-shot banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner.id + shotCountRef.current}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={`absolute top-24 left-1/2 -translate-x-1/2 z-30 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold max-w-[85%] text-center ${
              banner.severity === "critical" ? "bg-red-500 text-white" :
              banner.severity === "warn" ? "bg-yellow-400 text-black" :
              "bg-accent text-black"
            }`}
          >
            {banner.voice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* big counter */}
      {shots.length > 0 && (
        <div className="absolute top-28 right-4 z-10 text-right">
          <div className="text-[10px] uppercase tracking-widest text-white/60">Shots</div>
          <div className="text-5xl font-bold leading-none tabular-nums">{shotCountRef.current}</div>
        </div>
      )}

      {/* last shot form score */}
      {shots[0] && (
        <div className="absolute top-28 left-4 z-10">
          <div className="text-[10px] uppercase tracking-widest text-white/60">Last score</div>
          <motion.div
            key={shots[0].n}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            className={`text-5xl font-bold leading-none tabular-nums ${
              shots[0].metrics.formScore >= 80 ? "text-accent" :
              shots[0].metrics.formScore >= 60 ? "text-yellow-400" : "text-red-400"
            }`}
          >
            {shots[0].metrics.formScore}
          </motion.div>
        </div>
      )}

      {/* bottom sheet: latency + recent shots */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-4">
          <div className="flex items-center justify-between text-[11px] mb-3">
            <div className="flex items-center gap-3">
              <LatencyChip label="p50" ms={lat.p50} />
              <LatencyChip label="p95" ms={lat.p95} />
              <LatencyChip label="last" ms={lat.last ?? 0} />
            </div>
            <div className="text-white/40">{lat.n} shots</div>
          </div>
          {shots.length === 0 ? (
            <div className="text-center text-xs text-white/50 py-2">Your shots appear here.</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
              {shots.map((s) => (
                <div key={s.n} className="flex-shrink-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 min-w-[112px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white/40">#{s.n}</span>
                    <span className={`text-xs font-bold tabular-nums ${
                      s.metrics.formScore >= 80 ? "text-accent" :
                      s.metrics.formScore >= 60 ? "text-yellow-400" : "text-red-400"
                    }`}>{s.metrics.formScore}</span>
                  </div>
                  <div className="text-[10px] text-white/60 capitalize truncate">{s.cue.voice}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 text-center">
            <Link href={`/session/last?type=${shotType}`} className="text-xs text-white/60 hover:text-white underline underline-offset-2">
              Full analysis →
            </Link>
          </div>
        </div>
      </div>

      {err && (
        <div className="absolute inset-0 z-30 bg-black/90 flex items-center justify-center p-8 text-center">
          <div>
            <div className="text-5xl mb-4">📷</div>
            <h2 className="text-xl font-semibold mb-2">Camera unavailable</h2>
            <p className="text-white/60 text-sm mb-6">{err}</p>
            <Link href="/train/basketball" className="rounded-full bg-white text-black font-semibold px-6 py-3">Go back</Link>
          </div>
        </div>
      )}
      {!ready && !err && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <div className="text-sm text-white/70">Starting camera…</div>
        </div>
      )}

      {/* persist last session to localStorage so /session/last can show it */}
      <PersistLastSession shotType={shotType} shots={shots} />
    </div>
  );
}

function LatencyChip({ label, ms }: { label: string; ms: number }) {
  const good = ms > 0 && ms < 800;
  return (
    <div className="flex items-center gap-1">
      <span className="text-white/50 uppercase tracking-wider">{label}</span>
      <span className={`tabular-nums font-semibold ${good ? "text-accent" : ms === 0 ? "text-white/30" : "text-yellow-400"}`}>
        {ms === 0 ? "—" : `${Math.round(ms)}ms`}
      </span>
    </div>
  );
}

function PersistLastSession({ shotType, shots }: { shotType: string; shots: ShotRow[] }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shots.length === 0) return;
    try {
      window.localStorage.setItem(
        "arc:last-session",
        JSON.stringify({ shotType, shots, savedAt: Date.now() })
      );
    } catch {}
  }, [shotType, shots]);
  return null;
}
