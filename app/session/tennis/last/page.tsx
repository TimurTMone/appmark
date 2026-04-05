"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ServeMetrics } from "@/lib/sports/tennis/serveMetrics";
import type { Cue } from "@/lib/sports/tennis/serveRules";

type ServeRow = { metrics: ServeMetrics; cue: Cue; latencyMs: number; n: number };
type Session = { viewId: string; serves: ServeRow[]; savedAt: number };

export default function LastTennisSession() {
  const [sess, setSess] = useState<Session | null>(null);
  const [coach, setCoach] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("arc:last-tennis-session");
      if (raw) setSess(JSON.parse(raw));
    } catch {}
  }, []);

  async function getCoachNote() {
    if (!sess?.serves[0]) return;
    setCoachLoading(true);
    setCoach(null);
    try {
      const r = await fetch("/api/coach/tennis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: sess.serves[0].metrics, cues: [sess.serves[0].cue] }),
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
          <div className="text-5xl mb-4">🎾</div>
          <h1 className="text-xl font-semibold mb-2">No serves yet</h1>
          <p className="text-white/60 text-sm mb-6">Take a few serves first.</p>
          <Link href="/train/tennis/side-view" className="inline-flex rounded-full bg-accent text-black font-semibold px-5 py-2.5 text-sm">Start serving →</Link>
        </div>
      </main>
    );
  }

  const serves = sess.serves;
  const avgScore = Math.round(serves.reduce((s, r) => s + r.metrics.formScore, 0) / serves.length);
  const avgLat = Math.round(serves.reduce((s, r) => s + r.latencyMs, 0) / serves.length);
  const best = serves.reduce((b, r) => r.metrics.formScore > b.metrics.formScore ? r : b, serves[0]);
  const top = serves[0];

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/train/tennis/side-view" className="text-white/60 text-sm">← Back to serving</Link>
          <div className="text-sm font-semibold">Serve analysis</div>
          <div className="w-24" />
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Serves</div>
            <div className="text-3xl font-bold tabular-nums">{serves.length}</div>
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

        <h2 className="text-lg font-semibold mb-3">Most recent serve · #{top.n}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          <MetricCard label="Form score" value={`${top.metrics.formScore}`} tone={top.metrics.formScore >= 80 ? "good" : top.metrics.formScore >= 60 ? "warn" : "bad"} />
          <MetricCard label="Knee @ trophy" value={`${Math.round(top.metrics.kneeAngleAtTrophy)}°`} ideal="100–125°" />
          <MetricCard label="Toss arm" value={`${Math.round(top.metrics.tossArmExtensionAtTrophy)}°`} ideal="160–180°" />
          <MetricCard label="Racket drop" value={top.metrics.racketDropNorm.toFixed(2)} ideal="0.12–0.35" />
          <MetricCard label="Contact height" value={`${(top.metrics.contactHeightNorm * 100).toFixed(0)}%`} ideal="22–40%" />
          <MetricCard label="Contact ext." value={`${Math.round(top.metrics.contactArmExtension)}°`} ideal="155+°" />
          <MetricCard label="Jump" value={`${(top.metrics.jumpAmplitude * 100).toFixed(1)}`} ideal="normalized" />
          <MetricCard label="Duration" value={`${Math.round(top.metrics.serveDurationMs)}ms`} ideal="350–700ms" />
        </div>

        <h2 className="text-lg font-semibold mb-3">All serves</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">#</th>
                <th className="text-left px-3 py-2 font-medium">Score</th>
                <th className="text-left px-3 py-2 font-medium">Cue</th>
                <th className="text-left px-3 py-2 font-medium">Knee</th>
                <th className="text-left px-3 py-2 font-medium">Contact</th>
                <th className="text-right px-3 py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {serves.map((s) => (
                <tr key={s.n} className={`border-t border-white/5 ${s.n === best.n ? "bg-accent/5" : ""}`}>
                  <td className="px-3 py-2 tabular-nums text-white/70">{s.n}{s.n === best.n && <span className="ml-1 text-[9px] text-accent font-bold">BEST</span>}</td>
                  <td className={`px-3 py-2 font-semibold tabular-nums ${s.metrics.formScore >= 80 ? "text-accent" : s.metrics.formScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{s.metrics.formScore}</td>
                  <td className="px-3 py-2 text-white/70">{s.cue.voice}</td>
                  <td className="px-3 py-2 tabular-nums text-white/70">{Math.round(s.metrics.kneeAngleAtTrophy)}°</td>
                  <td className="px-3 py-2 tabular-nums text-white/70">{Math.round(s.metrics.contactArmExtension)}°</td>
                  <td className="px-3 py-2 text-right tabular-nums text-white/70">{Math.round(s.metrics.serveDurationMs)}ms</td>
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
