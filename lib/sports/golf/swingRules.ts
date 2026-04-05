// Rule-based swing cues for face-on camera.

import type { SwingMetrics } from "./swingMetrics";
import type { SwingConfig } from "./swingTypes";

export type Cue = {
  id: string;
  severity: "critical" | "warn" | "nit";
  voice: string;
  text: string;
};

export function evaluateSwing(m: SwingMetrics, c: SwingConfig): Cue[] {
  const cues: Cue[] = [];
  const [xLo, xHi] = c.idealXFactor;
  const [wLo, wHi] = c.idealWeightShiftAtImpact;
  const [tLo, tHi] = c.idealTempoRatio;

  // X-Factor (hip-shoulder separation)
  if (m.xFactor < xLo - 12) {
    cues.push({
      id: "turn-more",
      severity: "critical",
      voice: "Turn your shoulders more",
      text: `X-Factor only ${Math.round(m.xFactor)}°. Load up — pro range is ${xLo}–${xHi}°. Separation is where power comes from.`,
    });
  } else if (m.xFactor < xLo) {
    cues.push({
      id: "turn-more-minor",
      severity: "warn",
      voice: "A bigger turn",
      text: `X-Factor ${Math.round(m.xFactor)}° — a touch more shoulder turn over stable hips will add distance.`,
    });
  } else if (m.xFactor > xHi + 10) {
    cues.push({
      id: "overturn",
      severity: "warn",
      voice: "Easy on the turn",
      text: `Very large separation (${Math.round(m.xFactor)}°) — dial it back for timing and consistency.`,
    });
  }

  // weight shift
  if (m.weightShiftPct < wLo - 20) {
    cues.push({
      id: "shift-into-it",
      severity: "critical",
      voice: "Shift into it",
      text: `Only ${Math.round(m.weightShiftPct)}% on your lead foot at impact. Aim for ${wLo}%+ — the power comes from the ground up.`,
    });
  } else if (m.weightShiftPct < wLo) {
    cues.push({
      id: "shift-more",
      severity: "warn",
      voice: "Shift forward more",
      text: `Weight shift ${Math.round(m.weightShiftPct)}% — get a bit more onto the lead side through impact.`,
    });
  }

  // head stability
  if (m.headDriftMaxNorm > c.maxHeadDriftNorm + 0.06) {
    cues.push({
      id: "quiet-head",
      severity: "critical",
      voice: "Keep your head still",
      text: `Your head moved a lot during the swing. Pick a spot on the ball and stay centered — drift was ${(m.headDriftMaxNorm * 100).toFixed(1)}%.`,
    });
  } else if (m.headDriftMaxNorm > c.maxHeadDriftNorm) {
    cues.push({
      id: "quiet-head-minor",
      severity: "warn",
      voice: "Quiet head",
      text: "A touch of head movement. Lock your eyes on the ball through contact.",
    });
  }

  // tempo
  if (m.tempoRatio < tLo - 1) {
    cues.push({
      id: "slow-backswing",
      severity: "warn",
      voice: "Slower backswing",
      text: `Tempo ratio ${m.tempoRatio.toFixed(1)}:1 — you're rushing back. Classic pro tempo is 3:1 (slow back, fast through).`,
    });
  } else if (m.tempoRatio > tHi + 1.2) {
    cues.push({
      id: "deliberate-down",
      severity: "warn",
      voice: "Commit to the downswing",
      text: `Tempo ratio ${m.tempoRatio.toFixed(1)}:1 — long backswing but tentative down. Accelerate through the ball.`,
    });
  }

  // spine angle consistency
  if (m.spineAngleChangeDeg > c.maxSpineChange + 8) {
    cues.push({
      id: "stay-in-posture",
      severity: "critical",
      voice: "Stay in your posture",
      text: `Spine angle changed ${Math.round(m.spineAngleChangeDeg)}° from address to impact. You're standing up through the ball.`,
    });
  } else if (m.spineAngleChangeDeg > c.maxSpineChange) {
    cues.push({
      id: "stay-in-posture-minor",
      severity: "warn",
      voice: "Hold the posture",
      text: "Slight standing up through impact — stay down in your tilt.",
    });
  }

  const rank = { critical: 0, warn: 1, nit: 2 };
  return cues.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function topVoiceCue(cues: Cue[]): Cue {
  if (cues.length === 0) return {
    id: "good",
    severity: "nit",
    voice: "Clean swing",
    text: "Great swing. Numbers look solid across the board.",
  };
  return cues[0];
}
