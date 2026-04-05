// Swing detection state machine. The swing is a single continuous motion
// so our states are simpler than basketball's rep counting: we wait
// until the user moves (hands lift from address), then continue capturing
// until the hands return to ~address Y and stabilize (follow-through complete).
//
// We intentionally don't try to detect the ball or club — pure body pose.

import { computeFrame, summarizeSwing, type SwingFrame, type SwingMetrics } from "./swingMetrics";
import type { Landmarks } from "@/lib/pose";
import type { SwingConfig } from "./swingTypes";

export type SwingPhase = "address" | "backswing" | "top" | "downswing" | "finish" | "cooldown";

export type SwingEvent = {
  metrics: SwingMetrics;
  detectedAt: number;
};

export function makeSwingDetector(config: SwingConfig, opts?: { onSwing?: (e: SwingEvent) => void }) {
  let phase: SwingPhase = "address";
  let buffer: SwingFrame[] = [];
  let cooldownUntil = 0;
  let addressRestedSince = 0;
  let addressY: number | null = null; // rolling baseline avgWristY at address

  const CAPTURE_WINDOW_MS = 4000;
  const ADDRESS_MS_REQUIRED = 400; // must be roughly still at address for this long

  function push(f: SwingFrame) {
    buffer.push(f);
    const cutoff = f.t - CAPTURE_WINDOW_MS;
    while (buffer.length && buffer[0].t < cutoff) buffer.shift();
  }

  return {
    get phase() { return phase; },
    reset() {
      phase = "address";
      buffer = [];
      cooldownUntil = 0;
      addressRestedSince = 0;
      addressY = null;
    },
    update(lm: Landmarks, t: number): { phase: SwingPhase; swing: SwingEvent | null } {
      const f = computeFrame(lm, t, config.handedness);
      push(f);

      if (t < cooldownUntil) { phase = "cooldown"; return { phase, swing: null }; }

      // maintain rolling address baseline while hands are low
      if (phase === "address" || phase === "cooldown") {
        if (addressY == null) addressY = f.avgWristY;
        else addressY = addressY * 0.92 + f.avgWristY * 0.08;
        if (addressRestedSince === 0) addressRestedSince = t;

        // detect backswing start: lead wrist rises meaningfully above baseline
        const liftFromAddress = addressY - f.avgWristY;
        const restedLongEnough = t - addressRestedSince > ADDRESS_MS_REQUIRED;
        if (restedLongEnough && liftFromAddress > 0.08) {
          // trim buffer to start near the current address frame
          const keepFromT = t - 300;
          buffer = buffer.filter((b) => b.t >= keepFromT);
          phase = "backswing";
        }
        return { phase, swing: null };
      }

      if (phase === "backswing") {
        // transition to top when wrists have risen and started descending
        const peak = buffer.reduce((best, cur) => cur.avgWristY < best.avgWristY ? cur : best, buffer[0]);
        const descending = f.avgWristY > peak.avgWristY + 0.015;
        const framesSincePeak = buffer.filter((b) => b.t >= peak.t).length;
        if (descending && framesSincePeak >= 3) {
          phase = "downswing";
        }
        // safety: abandon if backswing takes too long
        if (t - buffer[0].t > 2500 && f.avgWristY > (addressY ?? 0.8) - 0.04) {
          phase = "address";
          buffer = [];
          addressRestedSince = 0;
        }
        return { phase, swing: null };
      }

      if (phase === "downswing") {
        // transition to finish when wrists have returned near address Y
        // AND then risen again (follow-through) OR gone low (impact)
        const base = addressY ?? f.avgWristY;
        const nearAddressY = f.avgWristY >= base - 0.05;
        if (nearAddressY) {
          phase = "finish";
        }
        return { phase, swing: null };
      }

      if (phase === "finish") {
        // finalize the swing once we've captured 300-500ms past impact
        // or if body stabilizes at the finish position.
        const framesInFinish = buffer.filter((b) => b.t >= t - 600).length;
        if (framesInFinish >= 18 || t - buffer[0].t > 3500) {
          const metrics = summarizeSwing(buffer.slice(), config);
          phase = "cooldown";
          cooldownUntil = t + 1500;
          addressRestedSince = 0;
          buffer = [];
          if (metrics) {
            const e: SwingEvent = { metrics, detectedAt: t };
            opts?.onSwing?.(e);
            return { phase, swing: e };
          }
        }
        return { phase, swing: null };
      }

      return { phase, swing: null };
    },
  };
}
