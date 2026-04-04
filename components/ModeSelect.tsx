"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type Mode = "boxing" | "pushup" | "squat";

const MODES: { id: Mode; emoji: string; title: string; subtitle: string; accent: string; badge?: string }[] = [
  { id: "boxing",  emoji: "🥊", title: "Shadow Boxing", subtitle: "Jab · Cross · Hook · Uppercut · Combos", accent: "from-red-500/30 to-fuchsia-500/20", badge: "NEW" },
  { id: "pushup",  emoji: "💪", title: "Pushups",       subtitle: "Elbow-angle form check + rep count", accent: "from-amber-500/30 to-orange-500/20" },
  { id: "squat",   emoji: "🏋️", title: "Squats",        subtitle: "Ghost Rep · race your deepest set", accent: "from-emerald-500/30 to-teal-500/20" },
];

export default function ModeSelect({ onPick }: { onPick: (m: Mode) => void }) {
  return (
    <div className="relative h-full w-full bg-black text-white overflow-y-auto">
      <div className="relative z-10 px-6 pt-6 pb-10 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white/60 text-sm flex items-center gap-1">← Home</Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center text-black font-bold text-xs">S</div>
            <span className="font-semibold tracking-tight text-sm">Shadow</span>
          </div>
          <div className="w-12" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-1">Pick your round.</h1>
        <p className="text-white/60 text-sm mb-6">Your camera becomes your trainer.</p>

        <div className="space-y-3">
          {MODES.map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              onClick={() => onPick(m.id)}
              className={`relative w-full text-left rounded-3xl border border-white/10 bg-gradient-to-br ${m.accent} p-5 active:scale-[0.98] transition-transform`}
            >
              {m.badge && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold tracking-wider">
                  {m.badge}
                </span>
              )}
              <div className="flex items-center gap-4">
                <div className="text-5xl">{m.emoji}</div>
                <div className="flex-1">
                  <div className="text-xl font-bold">{m.title}</div>
                  <div className="text-sm text-white/70">{m.subtitle}</div>
                </div>
                <div className="text-white/40 text-2xl">→</div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Private by design</div>
          <div className="text-sm text-white/80">Your camera feed never leaves this device. All AI runs in your browser.</div>
        </div>
      </div>
    </div>
  );
}
