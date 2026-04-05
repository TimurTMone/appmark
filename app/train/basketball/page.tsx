import Link from "next/link";

export const metadata = { title: "Arc · Basketball" };

const SHOTS = [
  { slug: "free-throw", title: "Free Throw", body: "Standardized distance. The cleanest test of your mechanics.", available: true, stats: "Standard · 15ft line" },
  { slug: "jump-shot", title: "Jump Shot", body: "Mid-range jumper. Tuning soon.", available: false, stats: "Coming soon" },
  { slug: "three-point", title: "Three", body: "Deeper release, lower arc. Tuning soon.", available: false, stats: "Coming soon" },
];

export default function BasketballPicker() {
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
        <p className="text-white/60 text-sm mb-8">We'll track your form on every rep.</p>

        <div className="space-y-3">
          {SHOTS.map((s) => (
            <Link
              key={s.slug}
              href={s.available ? `/train/basketball/${s.slug}` : "#"}
              className={`block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all ${s.available ? "hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.99]" : "opacity-40 cursor-not-allowed"}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-lg font-bold">{s.title}</div>
                  <div className="text-sm text-white/60 mb-1">{s.body}</div>
                  <div className="text-[11px] uppercase tracking-wider text-white/40">{s.stats}</div>
                </div>
                <div className="text-white/30 text-2xl">{s.available ? "→" : "·"}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
