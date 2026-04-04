"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ExerciseRunner from "@/components/ExerciseRunner";

type Ex = { type: "squat" | "pushup"; targetReps: number };
type Result = { type: "squat" | "pushup"; reps: number; target: number };

export default function RoutineClient({
  code,
  name,
  exercises,
}: {
  code: string;
  name: string;
  exercises: Ex[];
}) {
  type Stage = "intro" | "running" | "done";
  const [stage, setStage] = useState<Stage>("intro");
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Result[]>([]);

  async function onExerciseComplete(reps: number) {
    const ex = exercises[idx];
    const result: Result = { type: ex.type, reps, target: ex.targetReps };
    const nextResults = [...results, result];
    setResults(nextResults);
    // log to server
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, type: ex.type, reps, targetReps: ex.targetReps }),
    }).catch(() => {});

    if (idx + 1 < exercises.length) {
      setIdx(idx + 1);
    } else {
      setStage("done");
    }
  }

  if (stage === "intro") {
    return (
      <main className="app-shell w-full bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-sm w-full">
          <div className="text-xs uppercase tracking-widest text-accent mb-3">Today's routine</div>
          <h1 className="text-3xl font-bold mb-2">Hi {name.split(" ")[0] || name} 👋</h1>
          <p className="text-white/60 mb-8">Your clinician sent you {exercises.length} {exercises.length === 1 ? "exercise" : "exercises"}. Camera stays on your device — nothing is uploaded.</p>

          <div className="space-y-2 mb-8 text-left">
            {exercises.map((e, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                <div className="text-2xl">{e.type === "squat" ? "🏋️" : "💪"}</div>
                <div className="flex-1">
                  <div className="font-semibold capitalize">{e.type}s</div>
                  <div className="text-xs text-white/60">{e.targetReps} reps</div>
                </div>
                <div className="text-white/40 text-sm">{i + 1}/{exercises.length}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStage("running")}
            className="w-full rounded-full bg-accent text-black font-semibold py-4 text-base active:scale-[0.98] transition-transform"
          >
            Start routine →
          </button>
          <Link href="/" className="block text-white/40 text-xs mt-4">Powered by Shadow</Link>
        </div>
      </main>
    );
  }

  if (stage === "running") {
    const ex = exercises[idx];
    return (
      <main className="app-shell w-full bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${ex.type}-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <ExerciseRunner type={ex.type} target={ex.targetReps} onComplete={onExerciseComplete} />
            <div className="absolute bottom-4 left-0 right-0 z-20 text-center text-xs text-white/50">
              Exercise {idx + 1} of {exercises.length}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    );
  }

  // done
  const totalTarget = results.reduce((s, r) => s + r.target, 0);
  const totalReps = results.reduce((s, r) => s + r.reps, 0);
  const pct = totalTarget ? Math.round((totalReps / totalTarget) * 100) : 100;

  return (
    <main className="app-shell w-full bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-1">Nice work, {name.split(" ")[0] || name}.</h1>
        <p className="text-white/60 mb-8">Your clinician has been notified.</p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="text-6xl font-bold tabular-nums">{pct}%</div>
          <div className="text-xs text-white/60 uppercase tracking-wider mt-1">of target</div>
        </div>

        <div className="space-y-2 mb-8 text-left">
          {results.map((r, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{r.type === "squat" ? "🏋️" : "💪"}</span>
                <span className="capitalize text-sm">{r.type}s</span>
              </div>
              <div className="tabular-nums text-sm">{r.reps}<span className="text-white/40"> / {r.target}</span></div>
            </div>
          ))}
        </div>

        <Link href="/" className="text-white/40 text-xs">Powered by Shadow</Link>
      </div>
    </main>
  );
}
