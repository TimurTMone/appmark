"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Ex = { type: "squat" | "pushup"; targetReps: number };

export default function NewPatientForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Ex[]>([{ type: "squat", targetReps: 10 }]);
  const [busy, setBusy] = useState(false);

  function addEx() {
    setExercises([...exercises, { type: "pushup", targetReps: 10 }]);
  }
  function removeEx(i: number) {
    setExercises(exercises.filter((_, j) => j !== i));
  }
  function updateEx(i: number, patch: Partial<Ex>) {
    setExercises(exercises.map((e, j) => j === i ? { ...e, ...patch } : e));
  }

  async function submit() {
    if (!name.trim() || exercises.length === 0) return;
    setBusy(true);
    const r = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), exercises }),
    });
    setBusy(false);
    if (r.ok) {
      setName(""); setExercises([{ type: "squat", targetReps: 10 }]); setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-accent text-black font-semibold px-4 py-2 text-sm hover:bg-accent/90 transition-colors"
      >
        + New patient
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">New patient</h3>
        <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white text-sm">Cancel</button>
      </div>

      <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5">Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jane Doe"
        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm mb-4 focus:outline-none focus:border-accent"
      />

      <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Program</div>
      <div className="space-y-2 mb-3">
        {exercises.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={e.type}
              onChange={(ev) => updateEx(i, { type: ev.target.value as "squat" | "pushup" })}
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="squat">Squats</option>
              <option value="pushup">Pushups</option>
            </select>
            <input
              type="number"
              min={1}
              max={100}
              value={e.targetReps}
              onChange={(ev) => updateEx(i, { targetReps: Number(ev.target.value) || 1 })}
              className="w-20 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <span className="text-xs text-white/50">reps</span>
            {exercises.length > 1 && (
              <button onClick={() => removeEx(i)} className="ml-auto text-white/40 hover:text-red-400 text-lg">×</button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addEx} className="text-xs text-accent hover:underline mb-5">+ Add exercise</button>

      <button
        onClick={submit}
        disabled={busy || !name.trim() || exercises.length === 0}
        className="w-full rounded-full bg-accent text-black font-semibold py-2.5 text-sm disabled:opacity-50 hover:bg-accent/90 transition-colors"
      >
        {busy ? "Creating…" : "Create patient"}
      </button>
    </div>
  );
}
