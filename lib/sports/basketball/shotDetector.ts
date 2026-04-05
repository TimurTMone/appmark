// State machine that watches the shooting wrist and fires a shot event
// when it detects a full shooting motion (wrist goes from below shoulder
// to above head with an upward release).
//
// When the shot type requires a jump (jump-shot mode), we also enforce
// a measurable vertical displacement of the shoulder during the motion.

import { computeFrame, pickShootingSide, summarizeShot, type FrameMetrics, type ShotMetrics } from "./shotMetrics";
import type { Landmarks } from "@/lib/pose";
import type { ShotTypeConfig } from "./shotTypes";

export type ShotPhase = "idle" | "loading" | "releasing" | "cooldown";

export type ShotEvent = {
  metrics: ShotMetrics;
  frames: FrameMetrics[];
  detectedAt: number;
  jumpDetected: boolean;
};

export function makeShotDetector(config: ShotTypeConfig, opts?: { onShot?: (e: ShotEvent) => void }) {
  let phase: ShotPhase = "idle";
  let buffer: FrameMetrics[] = [];
  let cooldownUntil = 0;
  let loadStartT = 0;
  let baselineShoulderY: number | null = null;

  const CAPTURE_WINDOW_MS = 1800;

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
      baselineShoulderY = null;
    },
    update(lm: Landmarks, t: number): { phase: ShotPhase; shot: ShotEvent | null } {
      const side = pickShootingSide(lm);
      const f = computeFrame(lm, t, side);
      push(f);

      // track a rolling baseline (when idle) for jump detection later
      if (phase === "idle") {
        baselineShoulderY =
          baselineShoulderY == null ? f.shoulderY : baselineShoulderY * 0.9 + f.shoulderY * 0.1;
      }

      if (t < cooldownUntil) {
        phase = "cooldown";
        return { phase, shot: null };
      }

      // idle → loading
      if (phase === "idle" || phase === "cooldown") {
        const wristAboveShoulder = f.shootingWristY < f.shoulderY;
        const kneesBent = f.kneeAngle < 150;
        if (wristAboveShoulder || kneesBent) {
          phase = "loading";
          loadStartT = t;
        }
        return { phase, shot: null };
      }

      // loading → releasing
      if (phase === "loading") {
        const torso = Math.abs(f.hipY - f.shoulderY) || 0.15;
        const wristHigh = f.shootingWristY < f.shoulderY - torso * 0.4;
        const elbowExtending = f.shootingElbowAngle > 140;
        if (wristHigh && elbowExtending) {
          phase = "releasing";
        }
        if (t - loadStartT > 3500) { phase = "idle"; buffer = []; }
        return { phase, shot: null };
      }

      // releasing → cooldown (shot complete)
      if (phase === "releasing") {
        const peak = buffer.reduce((best, cur) =>
          cur.shootingWristY < best.shootingWristY ? cur : best, buffer[0]);
        const framesSincePeak = buffer.filter((b) => b.t >= peak.t).length;
        const wristDescending = f.shootingWristY > peak.shootingWristY + 0.015;
        if (framesSincePeak >= 4 && wristDescending) {
          const windowStart = Math.max(0, buffer.findIndex((b) => b.t >= loadStartT));
          const shotFrames = buffer.slice(windowStart);

          // jump detection
          const baseline = baselineShoulderY ?? shotFrames[0].shoulderY;
          const minShoulder = shotFrames.reduce((m, x) => Math.min(m, x.shoulderY), baseline);
          const jumpAmp = Math.max(0, baseline - minShoulder);
          const jumpDetected = jumpAmp >= config.minJumpAmplitude;

          // if jump required and not detected, ignore as an incomplete rep
          if (config.requiresJump && !jumpDetected) {
            phase = "cooldown";
            cooldownUntil = t + 800;
            loadStartT = 0;
            return { phase, shot: null };
          }

          const metrics = summarizeShot(shotFrames, config);
          phase = "cooldown";
          cooldownUntil = t + 1200;
          loadStartT = 0;
          if (metrics) {
            const e: ShotEvent = { metrics, frames: shotFrames, detectedAt: t, jumpDetected };
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
