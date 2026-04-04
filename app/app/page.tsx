"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Onboarding from "@/components/Onboarding";
import CoachScreen from "@/components/CoachScreen";

type Screen = "onboarding" | "coach";

export default function AppPage() {
  const [screen, setScreen] = useState<Screen>("onboarding");

  return (
    <main className="relative app-shell w-full bg-black">
      <AnimatePresence mode="wait">
        {screen === "onboarding" && (
          <motion.div
            key="onb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Onboarding onDone={() => setScreen("coach")} />
          </motion.div>
        )}
        {screen === "coach" && (
          <motion.div
            key="coach"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <CoachScreen onExit={() => setScreen("onboarding")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
