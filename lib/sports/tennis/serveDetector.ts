// Tennis serve state machine. Detects a full serve motion from the
// tossing-arm extension (trigger) through racket drop and contact.
//
// For RH player: tossing hand = left, dominant hand = right (mirrored
// camera doesn't matter for detection — we just watch the wrists).

import { computeFrame, summarizeServe, type ServeFrame, type ServeMetrics } from "./serveMetrics";
import type { Landmarks } from "@/lib/pose";
import type { ServeConfig } from "./serveTypes";

export type ServePhase =
  | "ready"
  | "toss"
  | "trophy"
  | "loading"
  | "contact"
  | "follow-through"
  | "cooldown";

export type ServeEvent = {
  metrics: ServeMetrics;
  detectedAt: number;
};

export function makeServeDetector(config: ServeConfig, opts?: { onServe?: (e: ServeEvent) => void }) {
  let phase: ServePhase = "ready";
  let buffer: ServeFrame[] = [];
  let cooldownUntil = 0;
  let baselineShoulderY: number | null = null;
  let tossPeakY = 1;
  let reachedTrophy = false;
  let reachedDrop = false;
  let dropLowY = 0;

  const CAPTURE_WINDOW_MS = 2500;
  // thresholds (normalized, fractions of frame)
  const TOSS_TRIGGER_RATIO = 0.35; // tossing wrist must rise this far above shoulder (of torso)
  const CONTACT_TRIGGER_RATIO = 0.25;

  function push(f: ServeFrame) {
    buffer.push(f);
    const cutoff = f.t - CAPTURE_WINDOW_MS;
    while (buffer.length && buffer[0].t < cutoff) buffer.shift();
  }

  return {
    get phase() { return phase; },
    reset() {
      phase = "ready";
      buffer = [];
      cooldownUntil = 0;
      baselineShoulderY = null;
      tossPeakY = 1;
      reachedTrophy = false;
      reachedDrop = false;
      dropLowY = 0;
    },
    update(lm: Landmarks, t: number): { phase: ServePhase; serve: ServeEvent | null } {
      const f = computeFrame(lm, t, config.handedness);
      push(f);

      if (phase === "ready" || phase === "cooldown") {
        baselineShoulderY = baselineShoulderY == null ? f.shoulderY : baselineShoulderY * 0.9 + f.shoulderY * 0.1;
      }

      if (t < cooldownUntil) { phase = "cooldown"; return { phase, serve: null }; }

      const torso = Math.max(0.08, Math.abs(f.hipY - f.shoulderY));

      // ready → toss: tossing wrist rises well above shoulder
      if (phase === "ready" || phase === "cooldown") {
        const tossHigh = f.tossWristY < f.shoulderY - torso * TOSS_TRIGGER_RATIO;
        if (tossHigh) {
          phase = "toss";
          buffer = buffer.slice(-20); // keep last ~20 frames as pre-context
          tossPeakY = f.tossWristY;
          reachedTrophy = false;
          reachedDrop = false;
          dropLowY = f.shoulderY;
        }
        return { phase, serve: null };
      }

      // toss → trophy: tossing wrist hits peak and begins descending
      if (phase === "toss") {
        if (f.tossWristY < tossPeakY) tossPeakY = f.tossWristY;
        const tossDescending = f.tossWristY > tossPeakY + 0.02;
        const domNearShoulder = Math.abs(f.domWristY - f.shoulderY) < torso * 0.5;
        if (tossDescending || domNearShoulder) {
          phase = "trophy";
          reachedTrophy = true;
        }
        // safety timeout
        if (t - buffer[0].t > 1500) { phase = "ready"; buffer = []; }
        return { phase, serve: null };
      }

      // trophy → loading: dominant wrist drops below shoulder (racket drop)
      if (phase === "trophy") {
        const domBelow = f.domWristY > f.shoulderY + torso * 0.1;
        if (domBelow) {
          phase = "loading";
          reachedDrop = true;
          dropLowY = f.domWristY;
        }
        return { phase, serve: null };
      }

      // loading → contact: track drop low, then detect explosive rise
      if (phase === "loading") {
        if (f.domWristY > dropLowY) dropLowY = f.domWristY;
        const nowHigh = f.domWristY < f.shoulderY - torso * CONTACT_TRIGGER_RATIO;
        if (nowHigh) {
          phase = "contact";
        }
        if (t - buffer[0].t > CAPTURE_WINDOW_MS - 100) { phase = "ready"; buffer = []; }
        return { phase, serve: null };
      }

      // contact → follow-through: wrist passes peak and descends
      if (phase === "contact") {
        const peak = buffer.reduce((best, cur) => cur.domWristY < best.domWristY ? cur : best, buffer[0]);
        const framesSincePeak = buffer.filter((b) => b.t >= peak.t).length;
        const descending = f.domWristY > peak.domWristY + 0.02;
        if (framesSincePeak >= 3 && descending) {
          phase = "follow-through";
        }
        return { phase, serve: null };
      }

      // follow-through: finalize
      if (phase === "follow-through") {
        const belowShoulder = f.domWristY > f.shoulderY;
        const enough = t - buffer[0].t > 400;
        if (belowShoulder && enough && reachedTrophy && reachedDrop) {
          const metrics = summarizeServe(buffer.slice(), baselineShoulderY ?? buffer[0].shoulderY, config);
          phase = "cooldown";
          cooldownUntil = t + 1500;
          reachedTrophy = false;
          reachedDrop = false;
          buffer = [];
          if (metrics) {
            const e: ServeEvent = { metrics, detectedAt: t };
            opts?.onServe?.(e);
            return { phase, serve: e };
          }
        }
        return { phase, serve: null };
      }

      return { phase, serve: null };
    },
  };
}
