import Link from "next/link";
import { SWING_CONFIGS } from "@/lib/sports/golf/swingTypes";

export const metadata = { title: "Arc · Golf" };

export default function GolfPicker() {
  const views = Object.values(SWING_CONFIGS);
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/train" className="text-white/60 text-sm">← Arc</Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="font-semibold">Golf</span>
          </div>
          <div className="w-12" />
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Choose your camera angle.</h1>
        <p className="text-white/60 text-sm mb-8">Different angles see different things. Start face-on.</p>

        <div className="space-y-3">
          {views.map((v) => {
            const available = v.id === "face-on";
            return (
              <Link
                key={v.id}
                href={available ? `/train/golf/${v.id}` : "#"}
                className={`block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all relative ${
                  available ? "hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.99]" : "opacity-40 cursor-not-allowed"
                }`}
              >
                {!available && (
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">Soon</span>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-lg font-bold">{v.label}</div>
                    <div className="text-sm text-white/60 mb-1.5">{v.tagline}</div>
                    {available && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-white/40">
                        <span>X-Factor {v.idealXFactor[0]}–{v.idealXFactor[1]}°</span>
                        <span>Weight {v.idealWeightShiftAtImpact[0]}–{v.idealWeightShiftAtImpact[1]}%</span>
                        <span>Tempo {v.idealTempoRatio[0]}:1–{v.idealTempoRatio[1]}:1</span>
                      </div>
                    )}
                  </div>
                  <div className="text-white/30 text-2xl">{available ? "→" : "·"}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
