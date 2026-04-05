import Link from "next/link";
import { SHOT_TYPES } from "@/lib/sports/basketball/shotTypes";

export const metadata = { title: "Arc · Basketball" };

export default function BasketballPicker() {
  const shots = Object.values(SHOT_TYPES);
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/train" className="text-white/60 text-sm">← Arc</Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏀</span>
            <span className="font-semibold">Basketball</span>
          </div>
          <div className="w-12" />
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Choose your shot.</h1>
        <p className="text-white/60 text-sm mb-8">We'll track your form on every rep, tuned to this shot type.</p>

        <div className="space-y-3">
          {shots.map((s) => (
            <Link
              key={s.id}
              href={`/train/basketball/${s.id}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-lg font-bold">{s.label}</div>
                  <div className="text-sm text-white/60 mb-1.5">{s.tagline}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-white/40">
                    <span>Arc {s.idealReleaseAngle[0]}–{s.idealReleaseAngle[1]}°</span>
                    <span>Knee {s.idealKneeAtLoad[0]}–{s.idealKneeAtLoad[1]}°</span>
                    {s.requiresJump && <span className="text-accent/80">Jump required</span>}
                  </div>
                </div>
                <div className="text-white/30 text-2xl">→</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
