// Rule-based serve cues keyed to the serve config.

import type { ServeMetrics } from "./serveMetrics";
import type { ServeConfig } from "./serveTypes";

export type Cue = {
  id: string;
  severity: "critical" | "warn" | "nit";
  voice: string;
  text: string;
};

export function evaluateServe(m: ServeMetrics, c: ServeConfig): Cue[] {
  const cues: Cue[] = [];
  const [kLo, kHi] = c.idealKneeAtTrophy;
  const [tLo] = c.idealTossArmExtension;
  const [chLo, chHi] = c.idealContactHeightNorm;
  const [rdLo, rdHi] = c.idealRacketDropNorm;
  const [ceLo] = c.idealContactArmExtension;

  // knee flex — strongest predictor of serve speed
  if (m.kneeAngleAtTrophy > kHi + 15) {
    cues.push({
      id: "bend-knees",
      severity: "critical",
      voice: "Bend your knees",
      text: `Knee angle ${Math.round(m.kneeAngleAtTrophy)}° at trophy — barely loading. Pros load to ${kLo}–${kHi}°. Knee flex is the #1 predictor of serve speed.`,
    });
  } else if (m.kneeAngleAtTrophy > kHi) {
    cues.push({
      id: "bend-knees-minor",
      severity: "warn",
      voice: "Deeper load",
      text: `Knee angle ${Math.round(m.kneeAngleAtTrophy)}°. A little deeper — every 10° of extra flex adds real mph.`,
    });
  }

  // contact arm extension
  if (m.contactArmExtension < ceLo - 10) {
    cues.push({
      id: "extend-contact",
      severity: "critical",
      voice: "Full extension at contact",
      text: `Elbow at contact ${Math.round(m.contactArmExtension)}°. Full extension (${ceLo}+°) reaches up and opens the strings.`,
    });
  } else if (m.contactArmExtension < ceLo) {
    cues.push({
      id: "extend-contact-minor",
      severity: "warn",
      voice: "Reach up",
      text: `Nearly there — stretch the hitting arm a touch more at contact.`,
    });
  }

  // contact height
  if (m.contactHeightNorm < chLo) {
    cues.push({
      id: "hit-up",
      severity: "critical",
      voice: "Hit up, not out",
      text: `Contact was too low — you're dropping the racket face. Reach up into the ball, stretched tall.`,
    });
  } else if (m.contactHeightNorm > chHi + 0.08) {
    cues.push({
      id: "contact-too-high",
      severity: "nit",
      voice: "Good height",
      text: "Hit above your target zone — great extension.",
    });
  }

  // toss arm
  if (m.tossArmExtensionAtTrophy < tLo - 20) {
    cues.push({
      id: "trust-toss",
      severity: "warn",
      voice: "Trust the toss",
      text: `Tossing arm only ${Math.round(m.tossArmExtensionAtTrophy)}° — extend fully up and track the ball with your eyes.`,
    });
  } else if (m.tossArmExtensionAtTrophy < tLo) {
    cues.push({
      id: "trust-toss-minor",
      severity: "nit",
      voice: "Straighter toss arm",
      text: "Straighten the tossing arm a bit more at release.",
    });
  }

  // racket drop depth
  if (m.racketDropNorm < rdLo - 0.05) {
    cues.push({
      id: "deeper-drop",
      severity: "warn",
      voice: "Deeper racket drop",
      text: `Racket didn't drop low enough behind your back (${m.racketDropNorm.toFixed(2)}). You lose whip — let the elbow lead up first.`,
    });
  } else if (m.racketDropNorm > rdHi + 0.1) {
    cues.push({
      id: "shallow-drop",
      severity: "nit",
      voice: "Tighter drop",
      text: "Racket dropped very low — watch shoulder strain.",
    });
  }

  // jump / leg drive
  if (m.jumpAmplitude < 0.02) {
    cues.push({
      id: "drive-up",
      severity: "warn",
      voice: "Drive up through it",
      text: `No leg drive detected — push off the ground with the legs to launch into the serve.`,
    });
  }

  const rank = { critical: 0, warn: 1, nit: 2 };
  return cues.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function topVoiceCue(cues: Cue[]): Cue {
  if (cues.length === 0) return {
    id: "good",
    severity: "nit",
    voice: "Clean serve",
    text: "Great serve. Kinetic chain looks strong.",
  };
  return cues[0];
}
