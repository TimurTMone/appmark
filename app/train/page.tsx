import Link from "next/link";

export const metadata = { title: "Arc — AI sports form coach" };

const SPORTS = [
  { href: "/train/basketball", emoji: "🏀", title: "Basketball", body: "Free throw · Jump shot · Three", available: true, only: "Free throw live · more soon" },
  { href: "#", emoji: "⛳", title: "Golf", body: "Full swing: takeaway → impact → follow-through", available: false, only: "Coming in Phase 2" },
];

export default function Train() {
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-accent to-fuchsia-400 flex items-center justify-center text-black font-bold text-xs">A</div>
            <span className="font-semibold">Arc</span>
          </Link>
          <div className="text-xs text-white/50">AI form coach</div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Real-time form AI · sub-second voice coaching
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-4">
            Pick a sport. <span className="text-accent">Get a coach.</span>
          </h1>
          <p className="text-white/70 leading-relaxed">
            Arc watches your form through your phone camera. It compares every rep to the pros and
            tells you the ONE thing to fix — out loud, in under a second. No sensors. No install.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          {SPORTS.map((s) => (
            <Link
              key={s.title}
              href={s.available ? s.href : "#"}
              className={`relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all ${s.available ? "hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.99]" : "opacity-50 cursor-not-allowed"}`}
            >
              {!s.available && (
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">Soon</span>
              )}
              <div className="text-5xl mb-4">{s.emoji}</div>
              <div className="text-xl font-bold mb-1">{s.title}</div>
              <div className="text-sm text-white/60 mb-3">{s.body}</div>
              <div className="text-xs text-white/40">{s.only}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
