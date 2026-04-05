"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ShotMetrics } from "@/lib/sports/basketball/shotMetrics";
import type { Cue } from "@/lib/sports/basketball/shotRules";

type ShotRow = { metrics: ShotMetrics; cue: Cue; latencyMs: number; n: number };
type Session = { shotType: string; shots: ShotRow[]; savedAt: number };

export default function LastSessionPage() {
  const [sess, setSess] = useState<Session | null>(null);
  const [coach, setCoach] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("arc:last-session");
      if (raw) setSess(JSON.parse(raw));
    } catch {}
  }, []);

  async function getCoachNote() {
    if (!sess?.shots[0]) return;
    setCoachLoading(true);
    setCoach(null);
    try {
      const r = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: sess.shots[0].metrics,
          cues: [sess.shots[0].cue],
        }),
      });
      const data = await r.json();
      setCoach(data?.coach ?? "Couldn't generate coaching note.");
    } catch {
      setCoach("Couldn't reach the coach right now.");
    } finally {
      setCoachLoading(false);
    }
  }

  if (!sess) {
    return (
      <main className="min-h-[100dvh] bg-black text-white flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-4">🏀</div>
          <h1 className="text-xl font-semibold mb-2">No session yet</h1>
          <p className="text-white/60 text-sm mb-6">Take some shots first.</p>
          <Link href="/train/basketball/free-throw" className="inline-flex rounded-full bg-accent text-black font-semibold px-5 py-2.5 text-sm">Start shooting →</Link>
        </div>
      </main>
    );
  }

  const shots = sess.shots;
  const avgScore = Math.round(shots.reduce((s, r) => s + r.metrics.formScore, 0) / shots.length);
  const avgLat = Math.round(shots.reduce((s, r) => s + r.latencyMs, 0) / shots.length);
  const best = shots.reduce((b, r) => r.metrics.formScore > b.metrics.formScore ? r : b, shots[0]);
  const top = shots[0]; // most recent

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/train/basketball/free-throw" className="text-white/60 text-sm">← Back to shooting</Link>
          <div className="text-sm font-semibold">Session analysis</div>
          <div className="w-24" />
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-8">
        {/* headline stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Shots</div>
            <div className="text-3xl font-bold tabular-nums">{shots.length}</div>
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

        {/* coach's note */}
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
            <p className="text-sm text-white/60">Tap above for a personalized breakdown from Claude based on the numbers below.</p>
          )}
        </div>

        {/* most recent shot breakdown */}
        <h2 className="text-lg font-semibold mb-3">Most recent shot · #{top.n}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          <MetricCard label="Form score" value={`${top.metrics.formScore}`} tone={top.metrics.formScore >= 80 ? "good" : top.metrics.formScore >= 60 ? "warn" : "bad"} />
          <MetricCard label="Knee @ load" value={`${Math.round(top.metrics.kneeAngleAtLoad)}°`} ideal="110–140°" />
          <MetricCard label="Elbow @ setpoint" value={`${Math.round(top.metrics.elbowAngleAtSetpoint)}°`} ideal="75–95°" />
          <MetricCard label="Elbow @ release" value={`${Math.round(top.metrics.elbowAngleAtRelease)}°`} ideal="near 180°" />
          <MetricCard label="Elbow flare" value={top.metrics.elbowFlareAtSetpoint.toFixed(2)} ideal="< 0.08" />
          <MetricCard label="Release angle" value={top.metrics.releaseAngleDeg != null ? `${Math.round(top.metrics.releaseAngleDeg)}°` : "—"} ideal="45–55°" />
          <MetricCard
            label="Apex timing"
            value={top.metrics.apexToReleaseMs != null ? `${top.metrics.apexToReleaseMs > 0 ? "+" : ""}${Math.round(top.metrics.apexToReleaseMs)}ms` : "no jump"}
            ideal={top.metrics.apexTimingClass === "no-jump" ? "—" : top.metrics.apexTimingClass === "at-apex" ? "at apex ✓" : top.metrics.apexTimingClass === "on-the-way-up" ? "early" : "late"}
            tone={top.metrics.apexTimingClass === "at-apex" ? "good" : top.metrics.apexTimingClass === "on-the-way-up" ? "bad" : top.metrics.apexTimingClass === "falling" ? "warn" : undefined}
          />
          <MetricCard label="Shot duration" value={`${Math.round(top.metrics.shotDurationMs)}ms`} />
        </div>

        {/* all shots table */}
        <h2 className="text-lg font-semibold mb-3">All shots</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">#</th>
                <th className="text-left px-3 py-2 font-medium">Score</th>
                <th className="text-left px-3 py-2 font-medium">Cue</th>
                <th className="text-left px-3 py-2 font-medium">Knee</th>
                <th className="text-left px-3 py-2 font-medium">Elbow rel.</th>
                <th className="text-right px-3 py-2 font-medium">Latency</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((s) => (
                <tr key={s.n} className={`border-t border-white/5 ${s.n === best.n ? "bg-accent/5" : ""}`}>
                  <td className="px-3 py-2 tabular-nums text-white/70">{s.n}{s.n === best.n && <span className="ml-1 text-[9px] text-accent font-bold">BEST</span>}</td>
                  <td className={`px-3 py-2 font-semibold tabular-nums ${s.metrics.formScore >= 80 ? "text-accent" : s.metrics.formScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{s.metrics.formScore}</td>
                  <td className="px-3 py-2 text-white/70">{s.cue.voice}</td>
                  <td className="px-3 py-2 tabular-nums text-white/70">{Math.round(s.metrics.kneeAngleAtLoad)}°</td>
                  <td className="px-3 py-2 tabular-nums text-white/70">{Math.round(s.metrics.elbowAngleAtRelease)}°</td>
                  <td className="px-3 py-2 text-right tabular-nums text-white/50">{Math.round(s.latencyMs)}ms</td>
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
