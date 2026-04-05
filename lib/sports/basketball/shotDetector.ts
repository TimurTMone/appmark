// State machine that watches the shooting wrist and fires a shot event
// when it detects a full shooting motion (wrist goes from below shoulder
// to above head with an upward release).
//
// We intentionally don't track the ball — for MVP we rely purely on arm
// kinematics, which is robust and lightweight.

import { computeFrame, pickShootingSide, summarizeShot, type FrameMetrics, type ShotMetrics } from "./shotMetrics";
import type { Landmarks } from "@/lib/pose";

export type ShotPhase = "idle" | "loading" | "releasing" | "cooldown";

export type ShotEvent = {
  metrics: ShotMetrics;
  frames: FrameMetrics[];
  detectedAt: number; // performance.now() at peak
};

type BufferItem = FrameMetrics;

export function makeShotDetector(opts?: { onShot?: (e: ShotEvent) => void }) {
  let phase: ShotPhase = "idle";
  let buffer: BufferItem[] = [];
  let cooldownUntil = 0;
  let loadStartT = 0;

  const CAPTURE_WINDOW_MS = 1500;

  function push(f: FrameMetrics) {
    buffer.push(f);
    const cutoff = f.t - CAPTURE_WINDOW_MS;
    while (buffer.length && buffer[0].t < cutoff) buffer.shift();
  }

  return {
    get phase() { return phase; },
    reset() {
      phase = "idle";
      buffer = [];
      cooldownUntil = 0;
    },
    update(lm: Landmarks, t: number): { phase: ShotPhase; shot: ShotEvent | null } {
      const side = pickShootingSide(lm);
      const f = computeFrame(lm, t, side);
      push(f);

      if (t < cooldownUntil) {
        phase = "cooldown";
        return { phase, shot: null };
      }

      // idle → loading: wrist comes up past shoulder OR knee bends
      if (phase === "idle" || phase === "cooldown") {
        const wristAboveShoulder = f.shootingWristY < f.shoulderY;
        const kneesBent = f.kneeAngle < 150;
        if (wristAboveShoulder || kneesBent) {
          phase = "loading";
          loadStartT = t;
        }
        return { phase, shot: null };
      }

      // loading → releasing: wrist crosses above head (above shoulders by 20% of torso)
      if (phase === "loading") {
        const torso = Math.abs(f.hipY - f.shoulderY) || 0.15;
        const wristHigh = f.shootingWristY < f.shoulderY - torso * 0.4;
        const elbowExtending = f.shootingElbowAngle > 140;
        if (wristHigh && elbowExtending) {
          phase = "releasing";
        }
        // guard: if loading goes on too long with no release, reset
        if (t - loadStartT > 3500) { phase = "idle"; buffer = []; }
        return { phase, shot: null };
      }

      // releasing: detect peak (wrist starts coming back down OR elbow reaches near full extension
      // and several frames have passed)
      if (phase === "releasing") {
        // find current peak index
        const peak = buffer.reduce((best, cur) =>
          cur.shootingWristY < best.shootingWristY ? cur : best, buffer[0]);
        const framesSincePeak = buffer.filter((b) => b.t >= peak.t).length;
        // consider release complete when we've seen 4+ frames after peak
        // AND the wrist is now moving back down
        const wristDescending = f.shootingWristY > peak.shootingWristY + 0.015;
        if (framesSincePeak >= 4 && wristDescending) {
          // summarize the shot
          const windowStart = Math.max(0, buffer.findIndex((b) => b.t >= loadStartT));
          const shotFrames = buffer.slice(windowStart);
          const metrics = summarizeShot(shotFrames);
          phase = "cooldown";
          cooldownUntil = t + 1200;
          loadStartT = 0;
          if (metrics) {
            const e: ShotEvent = { metrics, frames: shotFrames, detectedAt: t };
            opts?.onShot?.(e);
            return { phase, shot: e };
          }
        }
        return { phase, shot: null };
      }

      return { phase, shot: null };
    },
  };
}
