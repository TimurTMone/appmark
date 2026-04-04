"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ModeSelect, { type Mode } from "@/components/ModeSelect";
import CoachScreen from "@/components/CoachScreen";
import PushupScreen from "@/components/PushupScreen";
import BoxingScreen from "@/components/BoxingScreen";

export default function AppPage() {
  const [mode, setMode] = useState<Mode | null>(null);

  return (
    <main className="relative app-shell w-full bg-black">
      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <ModeSelect onPick={setMode} />
          </motion.div>
        )}
        {mode === "squat" && (
          <motion.div key="squat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
            <CoachScreen onExit={() => setMode(null)} />
          </motion.div>
        )}
        {mode === "pushup" && (
          <motion.div key="pushup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
            <PushupScreen onExit={() => setMode(null)} />
          </motion.div>
        )}
        {mode === "boxing" && (
          <motion.div key="boxing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
            <BoxingScreen onExit={() => setMode(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
