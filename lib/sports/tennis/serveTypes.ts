// Tennis serve configuration. Side-view camera, right-handed player.
// Ranges come from Frontiers 2024 meta-analysis on serve biomechanics:
//   Front knee flexion at trophy: 64.5° ± 9.7°  → knee angle 105–125°
//   Shoulder elevation at contact: 110.7° ± 16.9°
//   Elbow flexion at contact: 30.1° ± 15.9°     → elbow angle ~150°
// Knee flexion is strongly correlated with racket velocity; +31° knee
// flex training gained 1.38 km/h racket speed with no change to contact
// height.

export type ServeViewId = "side-view";
export type Handedness = "right" | "left";

export type ServeConfig = {
  id: ServeViewId;
  label: string;
  tagline: string;
  setupTip: string;
  handedness: Handedness;

  idealKneeAtTrophy: [number, number];      // knee angle, degrees
  idealTossArmExtension: [number, number];  // elbow angle at trophy
  idealRacketDropNorm: [number, number];    // normalized dominant-wrist depth below shoulder at drop
  idealContactHeightNorm: [number, number]; // normalized contact height above shoulder
  idealContactArmExtension: [number, number]; // dominant elbow angle at contact
  idealServeDurationMs: [number, number];   // trophy → contact

  weights: {
    kneeFlex: number;
    tossArm: number;
    racketDrop: number;
    contactHeight: number;
    contactExtension: number;
    jumpDrive: number;
  };
};

export const SERVE_CONFIGS: Record<ServeViewId, ServeConfig> = {
  "side-view": {
    id: "side-view",
    label: "Side View",
    tagline: "Camera perpendicular to your serve. Measures the full kinetic chain.",
    setupTip: "Stand perpendicular to the camera, 8–10 ft away. Full body + arms in frame. Mime the serve (no ball needed for first reps).",
    handedness: "right",
    idealKneeAtTrophy: [100, 125],
    idealTossArmExtension: [160, 180],
    idealRacketDropNorm: [0.12, 0.35],     // wrist depth below shoulder (normalized)
    idealContactHeightNorm: [0.22, 0.40],  // wrist above shoulder at contact
    idealContactArmExtension: [155, 180],
    idealServeDurationMs: [350, 700],
    weights: {
      kneeFlex: 25,
      tossArm: 10,
      racketDrop: 15,
      contactHeight: 20,
      contactExtension: 20,
      jumpDrive: 10,
    },
  },
};

export function getServeConfig(id: string): ServeConfig | null {
  return (SERVE_CONFIGS as Record<string, ServeConfig>)[id] ?? null;
}
