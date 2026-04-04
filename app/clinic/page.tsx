import Link from "next/link";
import { listPatients, adherencePct, streakDays, listSessions, hasKV } from "@/lib/db";
import NewPatientForm from "./NewPatientForm";
import CopyLinkButton from "./CopyLinkButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ClinicDashboard() {
  const patients = await listPatients();
  const rows = await Promise.all(
    patients.map(async (p) => {
      const [adh, streak, sessions] = await Promise.all([
        adherencePct(p),
        streakDays(p),
        listSessions(p.id),
      ]);
      return { ...p, adherence: adh, streak, sessionCount: sessions.length, lastSessionAt: sessions[0]?.completedAt ?? null };
    })
  );

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center text-black font-bold text-xs">S</div>
              <span className="font-semibold">Shadow</span>
            </Link>
            <span className="text-white/30 text-sm">/</span>
            <span className="font-semibold text-sm text-white/80">Clinic</span>
          </div>
          <Link href="/clinic/pricing" className="text-xs text-white/60 hover:text-white">Pricing</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!hasKV && (
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
            <strong>Demo mode</strong> — running on in-memory storage. Add Vercel KV to persist across deploys.
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Patients</h1>
            <p className="text-sm text-white/60">{rows.length} {rows.length === 1 ? "patient" : "patients"} · adherence tracked over last 7 days</p>
          </div>
        </div>

        <NewPatientForm />

        {rows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="text-4xl mb-3">👋</div>
            <div className="text-base font-semibold mb-1">No patients yet</div>
            <div className="text-sm text-white/60">Add your first patient above — they'll get a link to do their routine at home.</div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Patient</th>
                  <th className="text-left px-4 py-3 font-medium">Program</th>
                  <th className="text-left px-4 py-3 font-medium">Adherence</th>
                  <th className="text-left px-4 py-3 font-medium">Streak</th>
                  <th className="text-left px-4 py-3 font-medium">Last session</th>
                  <th className="text-right px-4 py-3 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-white/70">
                      {r.program.exercises.map((e) => `${e.targetReps} ${e.type}s`).join(" · ")}
                    </td>
                    <td className="px-4 py-3">
                      <AdherenceBar pct={r.adherence} />
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.streak} {r.streak === 1 ? "day" : "days"}</td>
                    <td className="px-4 py-3 text-white/60 tabular-nums text-xs">
                      {r.lastSessionAt ? relTime(r.lastSessionAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CopyLinkButton code={r.code} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function AdherenceBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "bg-accent" : pct >= 40 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-xs text-white/70 w-8">{pct}%</span>
    </div>
  );
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
