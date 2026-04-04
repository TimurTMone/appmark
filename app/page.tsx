"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const FEATURES = [
  { emoji: "🥊", title: "Punch recognition", body: "Jab, cross, hook, uppercut — detected in real time from your webcam. No gloves, no sensors." },
  { emoji: "🎯", title: "Combo caller", body: "Calls combos like '1-2-3' and scores whether you land them in sequence. Like a trainer shouting from the corner." },
  { emoji: "💪", title: "Pushups & squats", body: "Same AI, different drills. Form checks, rep counts, ghost replay. Build your conditioning." },
  { emoji: "😄", title: "Mood Ring", body: "Face AI reads your smile. Train hard, stay loose — warm voice nudges keep your head in the game." },
];

const STATS = [
  { v: "4", l: "punch types" },
  { v: "5", l: "AI models" },
  { v: "0", l: "installs" },
  { v: "100%", l: "on-device" },
];

export default function Landing() {
  return (
    <main className="min-h-[100dvh] w-full bg-black text-white relative overflow-hidden">
      {/* ambient */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-red-500/20 blur-3xl blob" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-3xl blob" style={{ animationDelay: "-6s" }} />
      <div className="pointer-events-none absolute inset-0 grid-fade" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-black font-bold">S</div>
          <span className="font-semibold tracking-tight">Shadow</span>
          <span className="text-white/40 text-xs hidden sm:inline">· AI boxing coach</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/clinic/pricing" className="hidden sm:inline text-sm text-white/60 hover:text-white transition-colors">
            For clinics
          </Link>
          <Link
            href="/app"
            className="rounded-full bg-accent text-black font-semibold hover:bg-accent/90 px-4 py-2 text-sm transition-colors"
          >
            Train free →
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20 md:pt-20 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs text-red-200 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            No gloves. No gym. No app store.
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.02] mb-6">
            Shadow box with an <span className="text-accent">AI in your corner.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed">
            Shadow turns your webcam into a boxing trainer. It sees every jab, cross, hook, and
            uppercut — calls combos like a cornerman, and tracks your conditioning with pushups and squats.
            All in a browser tab.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-accent text-black font-semibold px-6 py-4 text-base hover:bg-accent/90 active:scale-[0.98] transition-all"
            >
              Start your round →
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-full bg-white/5 border border-white/15 text-white font-medium px-6 py-4 text-base hover:bg-white/10 transition-colors"
            >
              How it works
            </a>
          </div>
          <div className="grid grid-cols-4 gap-3 max-w-lg">
            {STATS.map((s) => (
              <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-xl font-bold">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* hero mock: ring HUD */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 relative mx-auto w-full max-w-sm"
        >
          <div className="relative aspect-[9/19.5] rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-3 shadow-2xl shadow-red-500/10">
            <div className="h-full w-full rounded-[2rem] bg-black overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-zinc-900 to-fuchsia-900/30" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(244,63,94,0.25),transparent_50%)]" />

              {/* skeleton */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 400">
                <g stroke="#ffffff" strokeOpacity="0.85" strokeWidth="3" strokeLinecap="round">
                  <line x1="82" y1="135" x2="118" y2="135" />
                  <line x1="82" y1="135" x2="74" y2="215" />
                  <line x1="118" y1="135" x2="126" y2="215" />
                  <line x1="74" y1="215" x2="126" y2="215" />
                  {/* extended arm punching */}
                  <line x1="118" y1="135" x2="150" y2="145" />
                  <line x1="150" y1="145" x2="185" y2="140" />
                  <line x1="82" y1="135" x2="65" y2="165" />
                  <line x1="65" y1="165" x2="55" y2="190" />
                  <line x1="74" y1="215" x2="65" y2="290" />
                  <line x1="65" y1="290" x2="60" y2="365" />
                  <line x1="126" y1="215" x2="135" y2="290" />
                  <line x1="135" y1="290" x2="140" y2="365" />
                </g>
              </svg>

              {/* CROSS flash */}
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl font-black text-2xl tracking-wider border-2" style={{ background: "#f43f5e22", color: "#f43f5e", borderColor: "#f43f5e" }}>
                CROSS
              </div>

              {/* combo pill */}
              <div className="absolute top-14 right-3 px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur border border-white/10 text-right">
                <div className="text-[7px] uppercase tracking-widest text-white/50 leading-none">Combo</div>
                <div className="text-lg font-black leading-tight mt-0.5">1-2-3</div>
                <div className="flex gap-0.5 justify-end mt-0.5">
                  <span className="text-[7px] font-bold px-1 py-px rounded bg-[#00ffa3] text-black">J</span>
                  <span className="text-[7px] font-bold px-1 py-px rounded bg-[#f43f5e] text-black">C</span>
                  <span className="text-[7px] font-bold px-1 py-px rounded bg-white/10 text-white/60">H</span>
                </div>
              </div>

              {/* live chip */}
              <div className="absolute top-4 left-0 right-0 flex justify-between px-4">
                <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xs">✕</div>
                <div className="px-2 py-0.5 rounded-full bg-red-500 backdrop-blur text-[9px] font-bold tracking-wider flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                  LIVE · SHADOW
                </div>
                <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xs">🔊</div>
              </div>

              {/* total counter */}
              <div className="absolute top-28 left-0 right-0 flex flex-col items-center">
                <div className="text-5xl font-bold leading-none drop-shadow-lg">42</div>
                <div className="text-white/60 text-[8px] mt-1 uppercase tracking-widest">punches thrown</div>
              </div>

              {/* bottom stats */}
              <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-2.5">
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {[
                    { n: "1", l: "jab", c: "#00ffa3", v: 14 },
                    { n: "2", l: "cross", c: "#f43f5e", v: 11 },
                    { n: "3", l: "hook", c: "#f0abfc", v: 9 },
                    { n: "5", l: "upcut", c: "#fbbf24", v: 8 },
                  ].map((t) => (
                    <div key={t.l} className="text-center rounded-lg bg-white/5 py-1">
                      <div className="text-[7px] font-bold" style={{ color: t.c }}>{t.n}</div>
                      <div className="text-sm font-bold">{t.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* features */}
      <section id="how" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 max-w-xl">
          A fight gym in your browser.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="text-3xl mb-4">{f.emoji}</div>
              <h3 className="text-lg font-semibold mb-1.5">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* pricing tease */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Free forever</div>
            <div className="text-3xl font-bold mb-1">$0</div>
            <div className="text-sm text-white/60 mb-4">3 rounds per day · all drills · voice coach</div>
            <Link href="/app" className="inline-flex rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/15 transition-colors">
              Start free
            </Link>
          </div>
          <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/10 to-fuchsia-500/10 p-6 relative">
            <div className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-accent text-black">Launch</div>
            <div className="text-xs uppercase tracking-wider text-white/70 mb-2">Shadow Pro</div>
            <div className="text-3xl font-bold mb-1">$9.99<span className="text-base text-white/60 font-normal">/mo</span></div>
            <div className="text-sm text-white/70 mb-4">Unlimited rounds · session history · pro combos · progress graphs</div>
            <button className="inline-flex rounded-full bg-accent text-black font-semibold px-4 py-2 text-sm hover:bg-accent/90 transition-colors" disabled>
              Coming soon
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-red-500/10 via-white/[0.03] to-fuchsia-500/10 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Ring the bell.</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">Grant camera access. Start throwing. It just works.</p>
          <Link href="/app" className="inline-flex items-center justify-center rounded-full bg-accent text-black font-semibold px-8 py-4 text-base hover:bg-accent/90 active:scale-[0.98] transition-all">
            Enter Shadow →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 pb-10 text-center text-white/40 text-xs">
        Shadow · Built with Next.js, MediaPipe, Web Speech API. All models run on-device.
      </footer>
    </main>
  );
}
