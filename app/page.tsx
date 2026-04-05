"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/landing/AnimatedHero";

const SPORTS = [
  {
    href: "/train/basketball",
    emoji: "🏀",
    title: "Basketball",
    sub: "Free throw · Jump shot · Three",
    metrics: ["Elbow @ release 180°", "Release angle 45–55°", "Apex-timing ±120ms"],
    color: "from-orange-500/20 to-amber-500/10",
  },
  {
    href: "/train/golf",
    emoji: "⛳",
    title: "Golf",
    sub: "Face-on full swing analysis",
    metrics: ["X-Factor 35–50°", "Weight shift 70–95%", "Head drift < 8%"],
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    href: "/train/tennis",
    emoji: "🎾",
    title: "Tennis",
    sub: "Serve kinetic chain",
    metrics: ["Knee flex 100–125°", "Contact extension 155°+", "Racket drop whip"],
    color: "from-fuchsia-500/20 to-purple-500/10",
  },
];

const STATS = [
  { v: "3", l: "sports" },
  { v: "<200", l: "ms latency" },
  { v: "30+", l: "FPS" },
  { v: "0", l: "installs" },
];

export default function Landing() {
  return (
    <main className="min-h-[100dvh] w-full bg-black text-white relative overflow-hidden">
      {/* ambient */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-accent/20 blur-3xl blob" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-3xl blob" style={{ animationDelay: "-6s" }} />
      <div className="pointer-events-none absolute inset-0 grid-fade" />

      {/* nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-fuchsia-400 flex items-center justify-center text-black font-bold">A</div>
          <span className="font-semibold tracking-tight">Arc</span>
          <span className="text-white/40 text-xs hidden sm:inline">· AI form coach</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/clinic/pricing" className="hidden sm:inline text-sm text-white/60 hover:text-white transition-colors">For clinics</Link>
          <Link href="#other" className="hidden sm:inline text-sm text-white/60 hover:text-white transition-colors">Other apps</Link>
          <Link
            href="/train"
            className="rounded-full bg-accent text-black font-semibold hover:bg-accent/90 px-4 py-2 text-sm transition-colors"
          >
            Start training →
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20 md:pt-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              On-device pose AI · sub-200ms voice coaching
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] mb-6">
              One AI coach.<br />
              <span className="text-accent">Every sport.</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-xl mb-8 leading-relaxed">
              Arc watches your form through your phone camera. Research-calibrated biomechanics,
              voice coaching that fires in under a second. Basketball, golf, tennis — one engine,
              tuned per sport.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/train" className="inline-flex items-center justify-center rounded-full bg-accent text-black font-semibold px-6 py-4 text-base hover:bg-accent/90 active:scale-[0.98] transition-all">
                Pick a sport →
              </Link>
              <a href="#sports" className="inline-flex items-center justify-center rounded-full bg-white/5 border border-white/15 text-white font-medium px-6 py-4 text-base hover:bg-white/10 transition-colors">
                What it measures
              </a>
            </div>
            <div className="grid grid-cols-4 gap-2 max-w-md">
              {STATS.map((s) => (
                <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center">
                  <div className="text-xl font-bold tabular-nums">{s.v}</div>
                  <div className="text-[9px] uppercase tracking-wider text-white/50 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <AnimatedHero />
          </motion.div>
        </div>
      </section>

      {/* sports grid */}
      <section id="sports" className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Three sports live</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Research-calibrated, tuned per sport.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SPORTS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={s.href}
                className={`block rounded-3xl border border-white/10 bg-gradient-to-br ${s.color} p-6 hover:border-white/25 hover:scale-[1.01] active:scale-[0.99] transition-all h-full group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-5xl"
                  >
                    {s.emoji}
                  </motion.div>
                  <div className="text-white/30 text-2xl group-hover:text-white/60 group-hover:translate-x-0.5 transition-all">→</div>
                </div>
                <div className="text-xl font-bold mb-1">{s.title}</div>
                <div className="text-sm text-white/60 mb-4">{s.sub}</div>
                <div className="space-y-1">
                  {s.metrics.map((m) => (
                    <div key={m} className="text-[11px] text-white/50 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-accent/60" />
                      <span className="tabular-nums">{m}</span>
                    </div>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-10 max-w-xl">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-2">How it works</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pose AI → rule engine → voice, in under 200ms.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { n: "1", title: "Camera opens", body: "MediaPipe PoseLandmarker runs on your device. Your video never leaves your phone." },
            { n: "2", title: "Phase detected", body: "State machine tracks the motion — loading, release, contact, follow-through." },
            { n: "3", title: "Rules fire", body: "Research-backed thresholds catch the #1 fault in under 5ms." },
            { n: "4", title: "Coach speaks", body: "Browser TTS says the one cue that matters, under 200ms after detection." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="h-7 w-7 rounded-full bg-accent text-black font-bold flex items-center justify-center mb-3 text-sm">{s.n}</div>
              <div className="font-semibold mb-1 text-sm">{s.title}</div>
              <div className="text-xs text-white/60 leading-relaxed">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* other products */}
      <section id="other" className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Also on the engine</div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Same pose AI, different verticals.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/app"
            className="block rounded-2xl border border-white/10 bg-gradient-to-br from-red-500/10 to-fuchsia-500/10 p-6 hover:border-white/25 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">🥊</div>
              <div className="flex-1">
                <div className="text-lg font-bold">Shadow Boxing</div>
                <div className="text-sm text-white/60 mb-2">Punch recognition, combo caller, mood ring. The original app.</div>
                <div className="text-xs text-white/40">Consumer · free</div>
              </div>
              <div className="text-white/30 text-2xl">→</div>
            </div>
          </Link>
          <Link
            href="/clinic/pricing"
            className="block rounded-2xl border border-white/10 bg-gradient-to-br from-accent/10 to-teal-500/10 p-6 hover:border-white/25 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏥</div>
              <div className="flex-1">
                <div className="text-lg font-bold">Shadow Clinic</div>
                <div className="text-sm text-white/60 mb-2">Home-exercise adherence for PT clinics. Sell by the patient.</div>
                <div className="text-xs text-white/40">B2B SaaS · $49/clinic/mo</div>
              </div>
              <div className="text-white/30 text-2xl">→</div>
            </div>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-accent/10 via-white/[0.03] to-fuchsia-500/10 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Start with the sport you care about.</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">Camera access. 20 reps. You'll know what to fix.</p>
          <Link href="/train" className="inline-flex items-center justify-center rounded-full bg-accent text-black font-semibold px-8 py-4 text-base hover:bg-accent/90 active:scale-[0.98] transition-all">
            Pick your sport →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 pb-10 pt-10 border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white/50">
          <div>Arc · Built with Next.js, MediaPipe, Web Speech API, Claude. All pose AI runs on-device.</div>
          <div className="flex items-center gap-2">
            <span className="text-white/40">Contact the developer:</span>
            <a
              href="https://github.com/TimurTMone"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span className="font-medium">TimurTMone</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
