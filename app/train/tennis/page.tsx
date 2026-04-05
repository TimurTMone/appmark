import Link from "next/link";
import { SERVE_CONFIGS } from "@/lib/sports/tennis/serveTypes";

export const metadata = { title: "Arc · Tennis" };

export default function TennisPicker() {
  const views = Object.values(SERVE_CONFIGS);
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/train" className="text-white/60 text-sm">← Arc</Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎾</span>
            <span className="font-semibold">Tennis</span>
          </div>
          <div className="w-12" />
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Serve analyzer.</h1>
        <p className="text-white/60 text-sm mb-8">Kinetic chain breakdown — knee flex, racket drop, contact.</p>

        <div className="space-y-3">
          {views.map((v) => (
            <Link
              key={v.id}
              href={`/train/tennis/${v.id}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-lg font-bold">{v.label}</div>
                  <div className="text-sm text-white/60 mb-1.5">{v.tagline}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-white/40">
                    <span>Knee {v.idealKneeAtTrophy[0]}–{v.idealKneeAtTrophy[1]}°</span>
                    <span>Contact {v.idealContactArmExtension[0]}+°</span>
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
