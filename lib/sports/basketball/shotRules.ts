// Rule-based coaching cues keyed to the shot-type config. Thresholds
// differ per shot: a 3PT is expected to load deeper, a jump shot needs
// an actual jump, a free throw is the cleanest reference form.

import type { ShotMetrics } from "./shotMetrics";
import type { ShotTypeConfig } from "./shotTypes";

export type Cue = {
  id: string;
  severity: "critical" | "warn" | "nit";
  voice: string;    // short, spoken out loud
  text: string;     // longer explanation for the UI
};

export function evaluateShot(m: ShotMetrics, c: ShotTypeConfig, jumpDetected: boolean): Cue[] {
  const cues: Cue[] = [];
  const [kLo, kHi] = c.idealKneeAtLoad;
  const [sLo, sHi] = c.idealSetpointElbow;
  const [rLo, rHi] = c.idealReleaseAngle;

  // release extension — always critical if severe
  if (m.elbowAngleAtRelease < c.minReleaseExtension - 15) {
    cues.push({
      id: "follow-through",
      severity: "critical",
      voice: "Extend through the shot",
      text: `Your elbow only reached ${Math.round(m.elbowAngleAtRelease)}° at release. Full extension (near 180°) gives consistent arc.`,
    });
  } else if (m.elbowAngleAtRelease < c.minReleaseExtension) {
    cues.push({
      id: "follow-through-minor",
      severity: "warn",
      voice: "Snap the wrist",
      text: "Extend a little more and hold the follow-through.",
    });
  }

  // elbow flare
  if (m.elbowFlareAtSetpoint > c.maxElbowFlare + 0.04) {
    cues.push({
      id: "elbow-in",
      severity: "critical",
      voice: "Elbow in",
      text: "Your elbow is flared out. Tuck it under the ball, pointed at the rim.",
    });
  } else if (m.elbowFlareAtSetpoint > c.maxElbowFlare) {
    cues.push({
      id: "elbow-in-minor",
      severity: "warn",
      voice: "Tuck the elbow",
      text: "Slight flare — pull the elbow closer to the body at set-point.",
    });
  }

  // knee flex
  if (m.kneeAngleAtLoad > kHi + 15) {
    cues.push({
      id: "bend-knees",
      severity: "critical",
      voice: "Bend your knees",
      text: `You barely loaded (${Math.round(m.kneeAngleAtLoad)}°). Drop into the ideal ${kLo}–${kHi}° range for more drive.`,
    });
  } else if (m.kneeAngleAtLoad > kHi) {
    cues.push({
      id: "bend-knees-minor",
      severity: "warn",
      voice: "More leg drive",
      text: "A deeper load would add power and range.",
    });
  } else if (m.kneeAngleAtLoad < kLo - 10) {
    cues.push({
      id: "over-bent",
      severity: "warn",
      voice: "Not so deep",
      text: "You dropped too low — you're wasting energy and slowing the release.",
    });
  }

  // set-point
  if (m.elbowAngleAtSetpoint < sLo - 15) {
    cues.push({
      id: "setpoint-low",
      severity: "warn",
      voice: "Higher set point",
      text: "Hand too low at set-point — raise the ball closer to your forehead.",
    });
  } else if (m.elbowAngleAtSetpoint > sHi + 15) {
    cues.push({
      id: "setpoint-high",
      severity: "warn",
      voice: "Lower set point",
      text: `Set-point too high. Aim for roughly ${sLo}–${sHi}° elbow bend.`,
    });
  }

  // release angle
  if (m.releaseAngleDeg != null) {
    if (m.releaseAngleDeg < rLo - 8) {
      cues.push({
        id: "flat-shot",
        severity: "warn",
        voice: "More arc",
        text: `Flat release (${Math.round(m.releaseAngleDeg)}°). You want ${rLo}–${rHi}° for this shot.`,
      });
    } else if (m.releaseAngleDeg > rHi + 10) {
      cues.push({
        id: "too-high-arc",
        severity: "nit",
        voice: "Slightly lower arc",
        text: "Arc is very high — a touch flatter will reach the rim on line.",
      });
    }
  }

  // jump (for jump-shot only)
  if (c.requiresJump && !jumpDetected) {
    cues.push({
      id: "no-jump",
      severity: "warn",
      voice: "Get up on it",
      text: "No jump detected. For a jump shot, load and rise — release at your apex.",
    });
  }

  const rank = { critical: 0, warn: 1, nit: 2 };
  return cues.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function topVoiceCue(cues: Cue[]): Cue {
  if (cues.length === 0) return {
    id: "good",
    severity: "nit",
    voice: "Clean shot",
    text: "Form looked solid. Keep shooting.",
  };
  return cues[0];
}
