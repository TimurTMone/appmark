"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const FEATURES = [
  {
    emoji: "👁️",
    title: "On-device pose AI",
    body: "MediaPipe runs in your browser on GPU. Your camera feed never leaves the device.",
  },
  {
    emoji: "👻",
    title: "Ghost Rep",
    body: "Your best squat replays as a translucent skeleton. Race your previous self, live.",
  },
  {
    emoji: "😄",
    title: "Mood Ring",
    body: "Face AI reads your smile. Look too serious? A warm voice nudges you to breathe and grin.",
  },
  {
    emoji: "🗣️",
    title: "Voice coach",
    body: "Counts reps and calls depth out loud — hands-free, eyes on form.",
  },
  {
    emoji: "⚡",
    title: "Zero latency",
    body: "30+ FPS pose tracking, drawn over a mirrored camera. Feels like a native app.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-[100dvh] w-full bg-black text-white relative overflow-hidden">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-accent/20 blur-3xl blob" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-3xl blob" style={{ animationDelay: "-6s" }} />
      <div className="pointer-events-none absolute inset-0 grid-fade" />

      {/* nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-black font-bold">P</div>
          <span className="font-semibold tracking-tight">PoseAI Coach</span>
        </div>
        <Link
          href="/app"
          className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition-colors"
        >
          Launch app →
        </Link>
      </nav>

      {/* hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24 md:pt-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Live in your browser · no install
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Race your <span className="text-accent">best self.</span>
            <br />
            One squat at a time.
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed">
            PoseAI Coach turns your webcam into a real-time form coach. On-device body tracking,
            voice feedback, a <span className="text-white font-semibold">ghost replay</span> of your
            deepest rep, and a mood ring that reminds you to smile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-accent text-black font-semibold px-6 py-4 text-base hover:bg-accent/90 active:scale-[0.98] transition-all"
            >
              Start squatting →
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full bg-white/5 border border-white/15 text-white font-medium px-6 py-4 text-base hover:bg-white/10 transition-colors"
            >
              How it works
            </a>
          </div>
        </motion.div>

        {/* hero mock */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 relative mx-auto w-full max-w-sm"
        >
          <div className="relative aspect-[9/19.5] rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-3 shadow-2xl shadow-accent/10">
            <div className="h-full w-full rounded-[2rem] bg-black overflow-hidden relative">
              {/* fake camera gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/40 via-zinc-900 to-emerald-900/30" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,163,0.15),transparent_60%)]" />

              {/* fake skeleton */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 400">
                {/* ghost skeleton (magenta) */}
                <g stroke="#f0abfc" strokeWidth="3" strokeLinecap="round" opacity="0.55">
                  <line x1="80" y1="140" x2="120" y2="140" />
                  <line x1="80" y1="140" x2="70" y2="220" />
                  <line x1="120" y1="140" x2="130" y2="220" />
                  <line x1="70" y1="220" x2="130" y2="220" />
                  <line x1="70" y1="220" x2="55" y2="295" />
                  <line x1="55" y1="295" x2="45" y2="365" />
                  <line x1="130" y1="220" x2="145" y2="295" />
                  <line x1="145" y1="295" x2="155" y2="365" />
                </g>
                {/* live skeleton (green) */}
                <g stroke="#00ffa3" strokeWidth="4" strokeLinecap="round">
                  <line x1="82" y1="135" x2="118" y2="135" />
                  <line x1="82" y1="135" x2="74" y2="215" />
                  <line x1="118" y1="135" x2="126" y2="215" />
                  <line x1="74" y1="215" x2="126" y2="215" />
                  <line x1="74" y1="215" x2="60" y2="280" />
                  <line x1="60" y1="280" x2="50" y2="360" />
                  <line x1="126" y1="215" x2="140" y2="280" />
                  <line x1="140" y1="280" x2="150" y2="360" />
                </g>
              </svg>

              {/* rep counter */}
              <div className="absolute top-20 left-0 right-0 flex flex-col items-center">
                <div className="text-7xl font-bold leading-none drop-shadow-lg">7</div>
                <div className="text-white/70 text-[10px] mt-1 uppercase tracking-widest">reps</div>
              </div>

              {/* top chips */}
              <div className="absolute top-4 left-0 right-0 flex justify-between px-4">
                <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xs">✕</div>
                <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-[10px]">Live · Squats</div>
                <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xs">🔊</div>
              </div>

              {/* ghost badge */}
              <div className="absolute top-36 right-3 px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 backdrop-blur text-[10px] text-fuchsia-200 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-fuchsia-300 animate-pulse" />
                Ghost: rep 4
              </div>

              {/* bottom sheet */}
              <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3">
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="text-[8px] text-white/60 uppercase tracking-wide">Phase</div>
                    <div className="text-xs font-semibold">Down</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-white/60 uppercase tracking-wide">Knee</div>
                    <div className="text-xs font-semibold">92°</div>
                  </div>
                </div>
                <div className="h-1 w-full rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full w-[72%] bg-accent" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 max-w-xl">
          A whole fitness app, running in a browser tab.
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

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-accent/10 via-white/[0.03] to-fuchsia-500/10 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Ready to beat your ghost?</h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            No app store, no signup. Grant camera access and go.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-full bg-accent text-black font-semibold px-8 py-4 text-base hover:bg-accent/90 active:scale-[0.98] transition-all"
          >
            Launch PoseAI Coach →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 pb-10 text-center text-white/40 text-xs">
        Built with Next.js, MediaPipe, Web Speech API.
      </footer>
    </main>
  );
}
