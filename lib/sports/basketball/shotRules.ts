// Rule-based coaching cues for basketball shots. Pure mapping from
// measured metrics → short voice cue. Ordered by importance so the
// live coach speaks the ONE most important fix, not a lecture.

import type { ShotMetrics } from "./shotMetrics";

export type Cue = {
  id: string;
  severity: "critical" | "warn" | "nit";
  voice: string;    // what the coach says out loud
  text: string;     // what's shown on screen (can be longer)
};

export function evaluateShot(m: ShotMetrics): Cue[] {
  const cues: Cue[] = [];

  // elbow extension at release — chicken wing is the #1 miss pattern
  if (m.elbowAngleAtRelease < 150) {
    cues.push({
      id: "follow-through",
      severity: "critical",
      voice: "Extend through the shot",
      text: "Your elbow only reached " + Math.round(m.elbowAngleAtRelease) + "° at release. Full extension (near 180°) gives you consistent arc.",
    });
  } else if (m.elbowAngleAtRelease < 165) {
    cues.push({
      id: "follow-through-minor",
      severity: "warn",
      voice: "Snap the wrist",
      text: "Nearly there — extend a little more and hold the follow-through.",
    });
  }

  // elbow flare at setpoint — elbow should be under the ball
  if (m.elbowFlareAtSetpoint > 0.12) {
    cues.push({
      id: "elbow-in",
      severity: "critical",
      voice: "Elbow in",
      text: "Your elbow is flared out. Tuck it under the ball, pointed at the rim.",
    });
  } else if (m.elbowFlareAtSetpoint > 0.08) {
    cues.push({
      id: "elbow-in-minor",
      severity: "warn",
      voice: "Tuck the elbow",
      text: "Slight flare — pull the elbow closer to the body at set-point.",
    });
  }

  // knee bend — power comes from the legs
  if (m.kneeAngleAtLoad > 155) {
    cues.push({
      id: "bend-knees",
      severity: "critical",
      voice: "Bend your knees",
      text: "You barely loaded the legs (" + Math.round(m.kneeAngleAtLoad) + "°). Drop into a shooter's crouch around 120–140°.",
    });
  } else if (m.kneeAngleAtLoad > 145) {
    cues.push({
      id: "bend-knees-minor",
      severity: "warn",
      voice: "More leg drive",
      text: "A little deeper load would give you more lift and range.",
    });
  }

  // set-point
  if (m.elbowAngleAtSetpoint < 60) {
    cues.push({
      id: "setpoint-low",
      severity: "warn",
      voice: "Higher set point",
      text: "Your hand was too low at set-point — raise the ball closer to your forehead.",
    });
  } else if (m.elbowAngleAtSetpoint > 115) {
    cues.push({
      id: "setpoint-high",
      severity: "warn",
      voice: "Lower set point",
      text: "Set-point is too high / too straight. Aim for a ~90° elbow bend.",
    });
  }

  // sort critical → warn → nit, keep order within severity
  const rank = { critical: 0, warn: 1, nit: 2 };
  return cues.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

// Pick the single highest-priority cue to speak out loud after the shot.
export function topVoiceCue(cues: Cue[]): Cue | null {
  if (cues.length === 0) return {
    id: "good",
    severity: "nit",
    voice: "Clean shot",
    text: "Form looked solid. Keep shooting.",
  };
  return cues[0];
}
