"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Pt = { x: number; y: number };
type Pose = {
  id: "basketball" | "golf" | "tennis";
  label: string;
  emoji: string;
  accent: string;
  // 33 joints max; we only define the ones we draw
  head: Pt;
  leftShoulder: Pt; rightShoulder: Pt;
  leftElbow: Pt; rightElbow: Pt;
  leftWrist: Pt; rightWrist: Pt;
  leftHip: Pt; rightHip: Pt;
  leftKnee: Pt; rightKnee: Pt;
  leftAnkle: Pt; rightAnkle: Pt;
  // metrics to flash alongside
  metrics: { label: string; value: string }[];
};

const POSES: Pose[] = [
  {
    id: "basketball",
    label: "Basketball · Jump Shot",
    emoji: "🏀",
    accent: "#00ffa3",
    head: { x: 100, y: 52 },
    leftShoulder: { x: 88, y: 105 }, rightShoulder: { x: 112, y: 100 },
    leftElbow: { x: 75, y: 145 },    rightElbow: { x: 125, y: 70 },
    leftWrist: { x: 72, y: 185 },    rightWrist: { x: 138, y: 30 },
    leftHip: { x: 92, y: 185 },      rightHip: { x: 108, y: 185 },
    leftKnee: { x: 88, y: 250 },     rightKnee: { x: 112, y: 250 },
    leftAnkle: { x: 85, y: 325 },    rightAnkle: { x: 115, y: 325 },
    metrics: [
      { label: "Elbow release", value: "172°" },
      { label: "Release angle", value: "53°" },
      { label: "Apex timing", value: "+40ms" },
    ],
  },
  {
    id: "golf",
    label: "Golf · Top of Swing",
    emoji: "⛳",
    accent: "#00ffa3",
    head: { x: 100, y: 55 },
    leftShoulder: { x: 80, y: 110 },  rightShoulder: { x: 118, y: 108 },
    leftElbow: { x: 130, y: 80 },     rightElbow: { x: 148, y: 92 },
    leftWrist: { x: 152, y: 48 },     rightWrist: { x: 165, y: 62 },
    leftHip: { x: 85, y: 185 },       rightHip: { x: 115, y: 185 },
    leftKnee: { x: 80, y: 250 },      rightKnee: { x: 118, y: 252 },
    leftAnkle: { x: 75, y: 328 },     rightAnkle: { x: 122, y: 325 },
    metrics: [
      { label: "X-Factor", value: "42°" },
      { label: "Hip turn", value: "47°" },
      { label: "Tempo", value: "3.1:1" },
    ],
  },
  {
    id: "tennis",
    label: "Tennis · Trophy Position",
    emoji: "🎾",
    accent: "#00ffa3",
    head: { x: 100, y: 58 },
    leftShoulder: { x: 88, y: 110 },  rightShoulder: { x: 112, y: 108 },
    leftElbow: { x: 78, y: 72 },      rightElbow: { x: 128, y: 82 },
    leftWrist: { x: 72, y: 28 },      rightWrist: { x: 108, y: 48 },
    leftHip: { x: 92, y: 188 },       rightHip: { x: 108, y: 188 },
    leftKnee: { x: 85, y: 248 },      rightKnee: { x: 115, y: 250 },
    leftAnkle: { x: 82, y: 328 },     rightAnkle: { x: 118, y: 326 },
    metrics: [
      { label: "Knee trophy", value: "112°" },
      { label: "Toss arm", value: "176°" },
      { label: "Contact ext", value: "168°" },
    ],
  },
];

const BONES: [keyof Pose, keyof Pose][] = [
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftShoulder", "leftElbow"], ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"], ["rightElbow", "rightWrist"],
  ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"],
  ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"],
];

const JOINTS: (keyof Pose)[] = [
  "leftShoulder", "rightShoulder",
  "leftElbow", "rightElbow",
  "leftWrist", "rightWrist",
  "leftHip", "rightHip",
  "leftKnee", "rightKnee",
  "leftAnkle", "rightAnkle",
];

const CYCLE_MS = 3200;

export default function AnimatedHero() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % POSES.length), CYCLE_MS);
    return () => clearInterval(t);
  }, []);
  const pose = POSES[idx];

  return (
    <div className="relative aspect-[1/1.4] w-full max-w-sm mx-auto">
      {/* glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-fuchsia-500/20 blur-2xl" />
      {/* frame */}
      <div className="relative h-full w-full rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur p-4 overflow-hidden">
        {/* camera-mock gradient bg */}
        <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-zinc-800/60 via-zinc-900 to-black" />
        <div className="absolute inset-4 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(0,255,163,0.08),transparent_60%)]" />

        {/* top badge */}
        <div className="absolute top-7 left-0 right-0 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold tracking-widest">
            <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={pose.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="rounded-full bg-black/50 backdrop-blur border border-white/10 px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1.5"
            >
              <span>{pose.emoji}</span>
              <span className="tracking-wide">{pose.label}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.svg
              key={pose.id}
              viewBox="0 0 200 400"
              className="h-full max-h-[420px] w-auto"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* head circle */}
              <motion.circle
                cx={pose.head.x} cy={pose.head.y} r="18"
                fill="none" stroke={pose.accent} strokeWidth="3.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
              {/* bones */}
              {BONES.map(([a, b], i) => {
                const pa = pose[a] as Pt;
                const pb = pose[b] as Pt;
                return (
                  <motion.line
                    key={`${pose.id}-${a}-${b}`}
                    x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                    stroke={pose.accent}
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.05 + i * 0.02 }}
                  />
                );
              })}
              {/* joints */}
              {JOINTS.map((j, i) => {
                const p = pose[j] as Pt;
                return (
                  <motion.circle
                    key={`${pose.id}-${j}`}
                    cx={p.x} cy={p.y} r="5"
                    fill="#fff"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.02 }}
                  />
                );
              })}
            </motion.svg>
          </AnimatePresence>
        </div>

        {/* metric chips */}
        <div className="absolute bottom-7 left-7 right-7 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pose.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-2.5"
            >
              {pose.metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <div className="text-[8px] uppercase tracking-wider text-white/50 leading-none">{m.label}</div>
                  <div className="text-sm font-bold tabular-nums leading-tight mt-1">{m.value}</div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* progress pips */}
      <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-1.5">
        {POSES.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-accent" : "w-1 bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
