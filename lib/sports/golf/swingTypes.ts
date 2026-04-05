// Golf swing configuration. Like basketball, each view has its own
// thresholds, ideal ranges, and scoring weights. For MVP we ship
// face-on only; down-the-line is Phase 2 (different metrics).
//
// All angle/distance targets come from consensus coaching literature
// (X-Factor ~40°, weight shift 70-90% to lead foot at impact, head
// drift <~8% normalized).

export type SwingViewId = "face-on" | "down-the-line";
export type Handedness = "right" | "left";

export type SwingConfig = {
  id: SwingViewId;
  label: string;
  tagline: string;
  setupTip: string;
  handedness: Handedness;

  idealXFactor: [number, number];           // shoulder-hip separation at top, degrees
  idealShoulderTurn: [number, number];      // shoulders at top, degrees
  idealHipTurn: [number, number];           // hips at top, degrees
  idealWeightShiftAtImpact: [number, number]; // % weight on lead foot
  maxHeadDriftNorm: number;                 // normalized (fraction of frame width)
  idealTempoRatio: [number, number];        // backswing_ms / downswing_ms
  maxSpineChange: number;                   // degrees of spine tilt change address→impact

  weights: {
    xFactor: number;
    weightShift: number;
    headStability: number;
    tempo: number;
    spineAngle: number;
  };
};

export const SWING_CONFIGS: Record<SwingViewId, SwingConfig> = {
  "face-on": {
    id: "face-on",
    label: "Face-On",
    tagline: "Camera in front. Measures weight shift, X-Factor, head stability.",
    setupTip: "Place your phone 6–8 ft in front of you at chest height. Stand perpendicular to the camera line, ball in front of you. Take a normal swing.",
    handedness: "right",
    idealXFactor: [35, 50],
    idealShoulderTurn: [80, 100],
    idealHipTurn: [40, 55],
    idealWeightShiftAtImpact: [70, 95],
    maxHeadDriftNorm: 0.08,
    idealTempoRatio: [2.7, 3.3],
    maxSpineChange: 10,
    weights: {
      xFactor: 25,
      weightShift: 25,
      headStability: 20,
      tempo: 15,
      spineAngle: 15,
    },
  },
  "down-the-line": {
    // Placeholder config — not wired to a route yet.
    id: "down-the-line",
    label: "Down-the-Line",
    tagline: "Camera behind, looking at target. Measures swing plane.",
    setupTip: "Coming soon.",
    handedness: "right",
    idealXFactor: [35, 50],
    idealShoulderTurn: [80, 100],
    idealHipTurn: [40, 55],
    idealWeightShiftAtImpact: [70, 95],
    maxHeadDriftNorm: 0.08,
    idealTempoRatio: [2.7, 3.3],
    maxSpineChange: 10,
    weights: {
      xFactor: 20, weightShift: 20, headStability: 20, tempo: 20, spineAngle: 20,
    },
  },
};

export function getSwingConfig(id: string): SwingConfig | null {
  return (SWING_CONFIGS as Record<string, SwingConfig>)[id] ?? null;
}
