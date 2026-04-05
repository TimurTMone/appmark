"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SwingMetrics } from "@/lib/sports/golf/swingMetrics";
import type { Cue } from "@/lib/sports/golf/swingRules";

type SwingRow = { metrics: SwingMetrics; cue: Cue; latencyMs: number; n: number };
type Session = { viewId: string; swings: SwingRow[]; savedAt: number };

export default function LastGolfSession() {
  const [sess, setSess] = useState<Session | null>(null);
  const [coach, setCoach] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("arc:last-golf-session");
      if (raw) setSess(JSON.parse(raw));
    } catch {}
  }, []);

  async function getCoachNote() {
    if (!sess?.swings[0]) return;
    setCoachLoading(true);
    setCoach(null);
    try {
      const r = await fetch("/api/coach/golf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: sess.swings[0].metrics, cues: [sess.swings[0].cue] }),
      });
      const data = await r.json();
      setCoach(data?.coach ?? "Couldn't generate note.");
    } catch {
      setCoach("Couldn't reach the coach right now.");
    } finally { setCoachLoading(false); }
  }

  if (!sess) {
    return (
      <main className="min-h-[100dvh] bg-black text-white flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-4">⛳</div>
          <h1 className="text-xl font-semibold mb-2">No swings yet</h1>
          <p className="text-white/60 text-sm mb-6">Take a few swings first.</p>
          <Link href="/train/golf/face-on" className="inline-flex rounded-full bg-accent text-black font-semibold px-5 py-2.5 text-sm">Start swinging →</Link>
        </div>
      </main>
    );
  }

  const swings = sess.swings;
  const avgScore = Math.round(swings.reduce((s, r) => s + r.metrics.formScore, 0) / swings.length);
  const avgLat = Math.round(swings.reduce((s, r) => s + r.latencyMs, 0) / swings.length);
  const best = swings.reduce((b, r) => r.metrics.formScore > b.metrics.formScore ? r : b, swings[0]);
  const top = swings[0];

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/train/golf/face-on" className="text-white/60 text-sm">← Back to swinging</Link>
          <div className="text-sm font-semibold">Swing analysis</div>
          <div className="w-24" />
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Swings</div>
            <div className="text-3xl font-bold tabular-nums">{swings.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent/10 to-transparent p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Avg score</div>
            <div className={`text-3xl font-bold tabular-nums ${avgScore >= 80 ? "text-accent" : avgScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{avgScore}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Avg latency</div>
            <div className="text-3xl font-bold tabular-nums">{avgLat}<span className="text-base text-white/50">ms</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-fuchsia-500/5 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-accent font-semibold">Coach's note</div>
            {!coach && !coachLoading && (
              <button onClick={getCoachNote} className="text-xs font-semibold rounded-full bg-accent text-black px-3 py-1.5 hover:bg-accent/90 transition-colors">
                Get AI analysis
              </button>
            )}
          </div>
          {coachLoading ? (
            <div className="text-sm text-white/60">Coach is thinking…</div>
          ) : coach ? (
            <p className="text-sm leading-relaxed text-white/90">{coach}</p>
          ) : (
            <p className="text-sm text-white/60">Tap above for a personalized breakdown from Claude.</p>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-3">Most recent swing · #{top.n}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          <MetricCard label="Form score" value={`${top.metrics.formScore}`} tone={top.metrics.formScore >= 80 ? "good" : top.metrics.formScore >= 60 ? "warn" : "bad"} />
          <MetricCard label="X-Factor" value={`${Math.round(top.metrics.xFactor)}°`} ideal="35–50°" />
          <MetricCard label="Shoulder turn" value={`${Math.round(top.metrics.shoulderTurnAtTopDeg)}°`} ideal="80–100°" />
          <MetricCard label="Hip turn" value={`${Math.round(top.metrics.hipTurnAtTopDeg)}°`} ideal="40–55°" />
          <MetricCard label="Weight shift" value={`${Math.round(top.metrics.weightShiftPct)}%`} ideal="70–95% lead" />
          <MetricCard label="Head drift" value={`${(top.metrics.headDriftMaxNorm * 100).toFixed(1)}%`} ideal="< 8%" />
          <MetricCard label="Tempo" value={`${top.metrics.tempoRatio.toFixed(1)}:1`} ideal="~3:1" />
          <MetricCard label="Spine Δ" value={`${Math.round(top.metrics.spineAngleChangeDeg)}°`} ideal="< 10°" />
        </div>

        <h2 className="text-lg font-semibold mb-3">All swings</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">#</th>
                <th className="text-left px-3 py-2 font-medium">Score</th>
                <th className="text-left px-3 py-2 font-medium">Cue</th>
                <th className="text-left px-3 py-2 font-medium">X-Fact</th>
                <th className="text-left px-3 py-2 font-medium">Weight</th>
                <th className="text-right px-3 py-2 font-medium">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {swings.map((s) => (
                <tr key={s.n} className={`border-t border-white/5 ${s.n === best.n ? "bg-accent/5" : ""}`}>
                  <td className="px-3 py-2 tabular-nums text-white/70">{s.n}{s.n === best.n && <span className="ml-1 text-[9px] text-accent font-bold">BEST</span>}</td>
                  <td className={`px-3 py-2 font-semibold tabular-nums ${s.metrics.formScore >= 80 ? "text-accent" : s.metrics.formScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{s.metrics.formScore}</td>
                  <td className="px-3 py-2 text-white/70">{s.cue.voice}</td>
                  <td className="px-3 py-2 tabular-nums text-white/70">{Math.round(s.metrics.xFactor)}°</td>
                  <td className="px-3 py-2 tabular-nums text-white/70">{Math.round(s.metrics.weightShiftPct)}%</td>
                  <td className="px-3 py-2 text-right tabular-nums text-white/70">{s.metrics.tempoRatio.toFixed(1)}:1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value, ideal, tone }: { label: string; value: string; ideal?: string; tone?: "good" | "warn" | "bad" }) {
  const color = tone === "good" ? "text-accent" : tone === "warn" ? "text-yellow-400" : tone === "bad" ? "text-red-400" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/50">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
      {ideal && <div className="text-[10px] text-white/40 mt-0.5">{ideal}</div>}
    </div>
  );
}
