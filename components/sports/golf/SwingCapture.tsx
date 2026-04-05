"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCameraAI, type FrameData } from "@/components/useCameraAI";
import { drawSkeleton } from "@/components/Skeleton";
import { makeSwingDetector, type SwingPhase } from "@/lib/sports/golf/swingDetector";
import { evaluateSwing, topVoiceCue, type Cue } from "@/lib/sports/golf/swingRules";
import type { SwingMetrics } from "@/lib/sports/golf/swingMetrics";
import type { SwingConfig } from "@/lib/sports/golf/swingTypes";
import { speak } from "@/lib/voice";
import { record as recordLatency, stats as latencyStats } from "@/lib/telemetry/latency";

type Props = { config: SwingConfig };
type SwingRow = { metrics: SwingMetrics; cue: Cue; latencyMs: number; n: number };

export default function SwingCapture({ config }: Props) {
  const [phase, setPhase] = useState<SwingPhase>("address");
  const [swings, setSwings] = useState<SwingRow[]>([]);
  const [banner, setBanner] = useState<Cue | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [lat, setLat] = useState<{ n: number; p50: number; p95: number; last: number | null }>({ n: 0, p50: 0, p95: 0, last: null });

  const voiceRef = useRef(true); voiceRef.current = voiceOn;
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const swingCountRef = useRef(0);

  const onSwing = useCallback((metrics: SwingMetrics, detectedAt: number) => {
    const cues = evaluateSwing(metrics, config);
    const top = topVoiceCue(cues);
    const speakStart = performance.now();
    if (voiceRef.current) speak(top.voice, 0);
    const latency = speakStart - detectedAt;
    recordLatency("golf-detect-to-audio", latency);
    setLat(latencyStats("golf-detect-to-audio"));

    swingCountRef.current += 1;
    const row: SwingRow = { metrics, cue: top, latencyMs: latency, n: swingCountRef.current };
    setSwings((prev) => [row, ...prev].slice(0, 10));
    setBanner(top);
    setTimeout(() => setBanner((b) => (b?.id === top.id ? null : b)), 2800);
  }, [config]);

  const detectorRef = useRef(makeSwingDetector(config));
  useEffect(() => {
    detectorRef.current = makeSwingDetector(config, {
      onSwing: (e) => onSwing(e.metrics, e.detectedAt),
    });
  }, [onSwing, config]);

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

  const phaseColor: Record<SwingPhase, string> = {
    address: "bg-white/20 text-white/70",
    backswing: "bg-yellow-400 text-black",
    top: "bg-fuchsia-400 text-black",
    downswing: "bg-orange-400 text-black",
    finish: "bg-accent text-black",
    cooldown: "bg-white/10 text-white/60",
  };

  const topSwing = swings[0];
  useEffect(() => {
    if (typeof window === "undefined" || swings.length === 0) return;
    try {
      window.localStorage.setItem(
        "arc:last-golf-session",
        JSON.stringify({ viewId: config.id, swings, savedAt: Date.now() })
      );
    } catch {}
  }, [swings, config.id]);

  return (
    <div className="relative h-[100dvh] w-full bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover scale-x-[-1] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-20">
        <Link href="/train/golf" className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xl">✕</Link>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/60">Golf · {config.label}</div>
          <div className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${phaseColor[phase]}`}>{phase}</div>
        </div>
        <button onClick={() => setVoiceOn((v) => !v)} className="h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-lg">{voiceOn ? "🔊" : "🔇"}</button>
      </div>

      {ready && swings.length === 0 && (
        <div className="absolute top-20 left-4 right-4 z-10 rounded-2xl bg-black/60 backdrop-blur border border-white/10 p-4 text-center">
          <div className="text-sm font-semibold mb-1">{config.label} · get set up</div>
          <div className="text-xs text-white/70 leading-relaxed">{config.setupTip}</div>
        </div>
      )}

      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner.id + swingCountRef.current}
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

      {swings.length > 0 && (
        <>
          <div className="absolute top-28 right-4 z-10 text-right">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Swings</div>
            <div className="text-5xl font-bold leading-none tabular-nums">{swingCountRef.current}</div>
          </div>
          <div className="absolute top-28 left-4 z-10">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Last score</div>
            <motion.div
              key={topSwing.n}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className={`text-5xl font-bold leading-none tabular-nums ${
                topSwing.metrics.formScore >= 80 ? "text-accent" :
                topSwing.metrics.formScore >= 60 ? "text-yellow-400" : "text-red-400"
              }`}
            >
              {topSwing.metrics.formScore}
            </motion.div>
          </div>

          {/* live X-Factor + weight shift chips (last swing) */}
          <div className="absolute top-[220px] left-4 right-4 z-10 grid grid-cols-3 gap-2">
            <LiveChip label="X-Factor" value={`${Math.round(topSwing.metrics.xFactor)}°`} />
            <LiveChip label="Weight" value={`${Math.round(topSwing.metrics.weightShiftPct)}%`} />
            <LiveChip label="Tempo" value={`${topSwing.metrics.tempoRatio.toFixed(1)}:1`} />
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-4">
          <div className="flex items-center justify-between text-[11px] mb-3">
            <div className="flex items-center gap-3">
              <LatencyChip label="p50" ms={lat.p50} />
              <LatencyChip label="p95" ms={lat.p95} />
              <LatencyChip label="last" ms={lat.last ?? 0} />
            </div>
            <div className="text-white/40">{lat.n} swings</div>
          </div>
          {swings.length === 0 ? (
            <div className="text-center text-xs text-white/50 py-2">Take a swing.</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
              {swings.map((s) => (
                <div key={s.n} className="flex-shrink-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 min-w-[120px]">
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
            <Link href="/session/golf/last" className="text-xs text-white/60 hover:text-white underline underline-offset-2">
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
            <Link href="/train/golf" className="rounded-full bg-white text-black font-semibold px-6 py-3">Go back</Link>
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

function LiveChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/60 backdrop-blur border border-white/10 px-2.5 py-1.5 text-center">
      <div className="text-[8px] uppercase tracking-wider text-white/50 leading-none">{label}</div>
      <div className="text-sm font-bold tabular-nums leading-tight mt-0.5">{value}</div>
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
