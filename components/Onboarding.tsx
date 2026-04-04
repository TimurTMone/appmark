"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Slide = { title: string; body: string; emoji: string };

const SLIDES: Slide[] = [
  { emoji: "🎥", title: "Point your camera", body: "Step back so your full body fits in frame." },
  { emoji: "🧠", title: "AI sees your form", body: "On-device pose tracking — nothing leaves your phone." },
  { emoji: "🗣️", title: "Voice coaching", body: "Real-time feedback as you move. Squat, and go." },
];

const SLIDE_MS = 3500;

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      if (i < SLIDES.length - 1) setI(i + 1);
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [i]);

  const advance = () => {
    if (i < SLIDES.length - 1) setI(i + 1);
    else onDone();
  };
  const back = () => setI(Math.max(0, i - 1));

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-ink via-zinc-900 to-black text-white">
      {/* tap zones */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={back} />
      <div className="absolute inset-y-0 right-0 w-2/3 z-20" onClick={advance} />

      {/* story progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3 z-30">
        {SLIDES.map((_, idx) => (
          <div key={idx} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              key={`${idx}-${i}`}
              className="h-full bg-white story-bar-fill"
              style={{
                animationDuration: idx === i ? `${SLIDE_MS}ms` : "0ms",
                transform: idx < i ? "scaleX(1)" : idx > i ? "scaleX(0)" : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* header */}
      <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 pt-3 z-30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-accent/90 flex items-center justify-center text-black font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-sm">poseai.coach</span>
          <span className="text-xs text-white/50">now</span>
        </div>
        <button onClick={onDone} className="text-white/80 text-2xl leading-none px-2" aria-label="Close">
          ✕
        </button>
      </div>

      {/* slide content */}
      <div className="relative h-full w-full flex flex-col items-center justify-center px-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center text-center"
          >
            <div className="text-7xl mb-8 select-none">{SLIDES[i].emoji}</div>
            <h1 className="text-3xl font-bold mb-3">{SLIDES[i].title}</h1>
            <p className="text-white/70 text-base max-w-xs">{SLIDES[i].body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3 px-6 z-30">
        <button
          onClick={onDone}
          className="w-full max-w-xs rounded-full bg-accent text-black font-semibold py-4 text-base active:scale-[0.98] transition-transform"
        >
          Start coaching
        </button>
        <span className="text-white/40 text-xs">Tap right to continue · left to go back</span>
      </div>
    </div>
  );
}
