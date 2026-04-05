// Per-shot-type configuration. Thresholds come from the biomechanics
// research summarized in the Arc CTO plan (see commit log).
//
// Each shot type carries its own ideal-range targets and scoring weights
// because the shot types differ materially: a three-pointer uses a
// lower release angle and more leg drive, a jump shot requires an
// actual vertical jump, a free throw is stationary.

export type ShotTypeId = "free-throw" | "jump-shot" | "three-point";

export type ShotTypeConfig = {
  id: ShotTypeId;
  label: string;
  tagline: string;
  setupTip: string;

  // kinematic ideal ranges
  idealKneeAtLoad: [number, number];       // [min, max] degrees; deeper = smaller number
  idealSetpointElbow: [number, number];
  idealReleaseAngle: [number, number];     // degrees from horizontal
  minReleaseExtension: number;             // elbow at release must exceed this
  maxElbowFlare: number;                   // normalized

  // jump requirement
  requiresJump: boolean;
  minJumpAmplitude: number;                // normalized shoulder-Y delta (~0.03 = small hop)

  // scoring weights (must sum to 100 total)
  weights: {
    kneeFlex: number;
    setpoint: number;
    releaseExtension: number;
    elbowFlare: number;
    releaseAngle: number;
  };
};

export const SHOT_TYPES: Record<ShotTypeId, ShotTypeConfig> = {
  "free-throw": {
    id: "free-throw",
    label: "Free Throw",
    tagline: "Standardized distance. The cleanest test of mechanics.",
    setupTip: "Stand sideways to the camera, 6–8 ft away. Plant your feet. Full body in frame.",
    idealKneeAtLoad: [110, 145],
    idealSetpointElbow: [75, 95],
    idealReleaseAngle: [50, 58],
    minReleaseExtension: 165,
    maxElbowFlare: 0.08,
    requiresJump: false,
    minJumpAmplitude: 0,
    weights: { kneeFlex: 15, setpoint: 25, releaseExtension: 25, elbowFlare: 20, releaseAngle: 15 },
  },
  "jump-shot": {
    id: "jump-shot",
    label: "Jump Shot",
    tagline: "Mid-range jumper — release at the apex.",
    setupTip: "Sideways view, 8–10 ft away. Catch-and-shoot or off-the-dribble. Jump straight up.",
    idealKneeAtLoad: [100, 135],
    idealSetpointElbow: [80, 100],
    idealReleaseAngle: [48, 54],
    minReleaseExtension: 160,
    maxElbowFlare: 0.09,
    requiresJump: true,
    minJumpAmplitude: 0.03,
    weights: { kneeFlex: 20, setpoint: 20, releaseExtension: 20, elbowFlare: 15, releaseAngle: 25 },
  },
  "three-point": {
    id: "three-point",
    label: "Three",
    tagline: "Deeper range. Lower arc, more leg drive.",
    setupTip: "Sideways view. Step back for three. Jump or set — we'll detect it.",
    idealKneeAtLoad: [90, 125],
    idealSetpointElbow: [80, 105],
    idealReleaseAngle: [44, 50],
    minReleaseExtension: 158,
    maxElbowFlare: 0.10,
    requiresJump: false,
    minJumpAmplitude: 0.02,
    weights: { kneeFlex: 25, setpoint: 15, releaseExtension: 20, elbowFlare: 15, releaseAngle: 25 },
  },
};

export function getShotConfig(id: string): ShotTypeConfig | null {
  return (SHOT_TYPES as Record<string, ShotTypeConfig>)[id] ?? null;
}
