// Golf swing metrics from 2D pose (face-on camera).
// Key idea: compute per-frame body state, then aggregate across the
// captured swing window (address → follow-through) into a ShotMetrics
// equivalent for golf.
//
// We only claim accuracy on face-on camera, right-handed golfer.

import { L, type Landmarks } from "@/lib/pose";
import type { SwingConfig } from "./swingTypes";

const NOSE = 0;
const LEFT_ELBOW = 13;
const LEFT_WRIST = 15;
const RIGHT_ELBOW = 14;
const RIGHT_WRIST = 16;

export type SwingFrame = {
  t: number;
  // wrists
  leadWristX: number;  // "lead" = front hand; RH golfer = left hand
  leadWristY: number;
  trailWristX: number;
  trailWristY: number;
  avgWristY: number;
  // shoulder/hip lines (horizontal angle vs ground plane)
  shoulderAngleDeg: number;   // slope of left→right shoulder line (0=level)
  hipAngleDeg: number;
  // head + spine
  noseX: number;
  noseY: number;
  spineAngleDeg: number;      // tilt of (hip midpoint → shoulder midpoint) from vertical
  // lead hip X (for weight shift)
  leadHipX: number;
  trailHipX: number;
};

export type SwingMetrics = {
  // phase timestamps (all ms on performance.now timeline)
  addressT: number;
  topT: number;
  impactT: number;
  finishT: number;
  // key angles
  shoulderTurnAtTopDeg: number;    // |shoulder line at top - at address|
  hipTurnAtTopDeg: number;
  xFactor: number;                  // shoulderTurn - hipTurn
  weightShiftPct: number;           // % of body width shifted toward lead foot at impact
  headDriftMaxNorm: number;         // max displacement of nose from address
  backswingMs: number;              // addressT → topT
  downswingMs: number;              // topT → impactT
  tempoRatio: number;               // backswing / downswing
  spineAngleAtAddress: number;
  spineAngleAtImpact: number;
  spineAngleChangeDeg: number;
  formScore: number;
  subScores: {
    xFactor: number;
    weightShift: number;
    headStability: number;
    tempo: number;
    spineAngle: number;
  };
};

// For a RH golfer on a face-on mirrored camera:
//  - lead = left hand, screen-RIGHT side
//  - trail = right hand, screen-LEFT side
// We don't auto-detect handedness yet; config.handedness = "right" is assumed.
export function computeFrame(lm: Landmarks, t: number, hand: "right" | "left" = "right"): SwingFrame {
  const leadIsLeft = hand === "right"; // RH golfer: lead hand is left
  const leadElbow = leadIsLeft ? LEFT_ELBOW : RIGHT_ELBOW;
  const leadWrist = leadIsLeft ? LEFT_WRIST : RIGHT_WRIST;
  const trailElbow = leadIsLeft ? RIGHT_ELBOW : LEFT_ELBOW;
  const trailWrist = leadIsLeft ? RIGHT_WRIST : LEFT_WRIST;
  const leadShoulder = leadIsLeft ? L.LEFT_SHOULDER : L.RIGHT_SHOULDER;
  const trailShoulder = leadIsLeft ? L.RIGHT_SHOULDER : L.LEFT_SHOULDER;
  const leadHip = leadIsLeft ? L.LEFT_HIP : L.RIGHT_HIP;
  const trailHip = leadIsLeft ? L.RIGHT_HIP : L.LEFT_HIP;

  void leadElbow; void trailElbow; // reserved for future lead-arm angle

  const shoulderLeft = lm[L.LEFT_SHOULDER];
  const shoulderRight = lm[L.RIGHT_SHOULDER];
  const shoulderAngleDeg =
    (Math.atan2(shoulderRight.y - shoulderLeft.y, shoulderRight.x - shoulderLeft.x) * 180) / Math.PI;

  const hipLeft = lm[L.LEFT_HIP];
  const hipRight = lm[L.RIGHT_HIP];
  const hipAngleDeg =
    (Math.atan2(hipRight.y - hipLeft.y, hipRight.x - hipLeft.x) * 180) / Math.PI;

  const shoulderMidX = (shoulderLeft.x + shoulderRight.x) / 2;
  const shoulderMidY = (shoulderLeft.y + shoulderRight.y) / 2;
  const hipMidX = (hipLeft.x + hipRight.x) / 2;
  const hipMidY = (hipLeft.y + hipRight.y) / 2;
  // spine angle from vertical (0° = perfectly upright)
  const spineAngleDeg =
    (Math.atan2(shoulderMidX - hipMidX, hipMidY - shoulderMidY) * 180) / Math.PI;

  return {
    t,
    leadWristX: lm[leadWrist].x,
    leadWristY: lm[leadWrist].y,
    trailWristX: lm[trailWrist].x,
    trailWristY: lm[trailWrist].y,
    avgWristY: (lm[leadWrist].y + lm[trailWrist].y) / 2,
    shoulderAngleDeg,
    hipAngleDeg,
    noseX: lm[NOSE].x,
    noseY: lm[NOSE].y,
    spineAngleDeg,
    leadHipX: lm[leadHip].x,
    trailHipX: lm[trailHip].x,
  };
  void leadShoulder; void trailShoulder;
}

// Find the address frame: earliest stable window before the backswing
// starts. For MVP, use the first frame of the captured buffer.
// Find the top frame: frame where avgWristY is at its minimum (hands highest).
// Find the impact frame: frame after top where wrists return to roughly
// the address Y (hands back down, near ball).
// Find the finish: last frame in buffer.
export function summarizeSwing(frames: SwingFrame[], config: SwingConfig): SwingMetrics | null {
  if (frames.length < 15) return null;

  const addressFrame = frames[0];
  const addressY = addressFrame.avgWristY;
  const addressNoseX = addressFrame.noseX;
  const addressNoseY = addressFrame.noseY;

  // top = frame with minimum avgWristY (highest on screen = hands up)
  let topIdx = 0;
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].avgWristY < frames[topIdx].avgWristY) topIdx = i;
  }
  const topFrame = frames[topIdx];

  // impact = first frame after topIdx whose avgWristY returns within 10% of address Y
  // (or simply the fastest-descending frame)
  let impactIdx = topIdx;
  const descendTarget = addressY;
  for (let i = topIdx + 1; i < frames.length; i++) {
    if (frames[i].avgWristY >= descendTarget - 0.02) {
      impactIdx = i;
      break;
    }
  }
  if (impactIdx === topIdx) impactIdx = Math.min(frames.length - 1, topIdx + 6);
  const impactFrame = frames[impactIdx];

  const finishFrame = frames[frames.length - 1];

  // turn angles: how much shoulder/hip lines rotated from address to top
  const shoulderTurnAtTopDeg = Math.abs(topFrame.shoulderAngleDeg - addressFrame.shoulderAngleDeg);
  const hipTurnAtTopDeg = Math.abs(topFrame.hipAngleDeg - addressFrame.hipAngleDeg);
  const xFactor = Math.max(0, shoulderTurnAtTopDeg - hipTurnAtTopDeg);

  // weight shift: hip center X at impact vs address, relative to hip width
  const addrHipWidth = Math.abs(addressFrame.leadHipX - addressFrame.trailHipX) || 0.15;
  const addrHipMidX = (addressFrame.leadHipX + addressFrame.trailHipX) / 2;
  const impactHipMidX = (impactFrame.leadHipX + impactFrame.trailHipX) / 2;
  // For RH golfer face-on (mirrored): lead = screen-RIGHT, so positive shift = shift toward screen-right.
  const shiftTowardLead = (impactHipMidX - addrHipMidX) / addrHipWidth;
  // Heuristic: 0% shift = 50% weight on lead (balanced); full hip-width shift = ~95% on lead
  const weightShiftPct = Math.max(0, Math.min(100, 50 + shiftTowardLead * 60));

  // head drift: max nose displacement from address
  let headDriftMaxNorm = 0;
  for (const f of frames) {
    const dx = f.noseX - addressNoseX;
    const dy = f.noseY - addressNoseY;
    const d = Math.hypot(dx, dy);
    if (d > headDriftMaxNorm) headDriftMaxNorm = d;
  }

  const backswingMs = topFrame.t - addressFrame.t;
  const downswingMs = Math.max(1, impactFrame.t - topFrame.t);
  const tempoRatio = backswingMs / downswingMs;

  const spineAngleAtAddress = addressFrame.spineAngleDeg;
  const spineAngleAtImpact = impactFrame.spineAngleDeg;
  const spineAngleChangeDeg = Math.abs(spineAngleAtImpact - spineAngleAtAddress);

  const { formScore, subScores } = scoreSwing(
    {
      xFactor,
      weightShiftPct,
      headDriftMaxNorm,
      tempoRatio,
      spineAngleChangeDeg,
    },
    config
  );

  return {
    addressT: addressFrame.t,
    topT: topFrame.t,
    impactT: impactFrame.t,
    finishT: finishFrame.t,
    shoulderTurnAtTopDeg,
    hipTurnAtTopDeg,
    xFactor,
    weightShiftPct,
    headDriftMaxNorm,
    backswingMs,
    downswingMs,
    tempoRatio,
    spineAngleAtAddress,
    spineAngleAtImpact,
    spineAngleChangeDeg,
    formScore,
    subScores,
  };
}

function scoreSwing(
  m: {
    xFactor: number;
    weightShiftPct: number;
    headDriftMaxNorm: number;
    tempoRatio: number;
    spineAngleChangeDeg: number;
  },
  c: SwingConfig
): { formScore: number; subScores: SwingMetrics["subScores"] } {
  const xFactor = scoreRange(m.xFactor, c.idealXFactor, 15);
  const weightShift = scoreRange(m.weightShiftPct, c.idealWeightShiftAtImpact, 25);
  const headStability = scoreBelow(m.headDriftMaxNorm, c.maxHeadDriftNorm, 0.06);
  const tempo = scoreRange(m.tempoRatio, c.idealTempoRatio, 1.0);
  const spineAngle = scoreBelow(m.spineAngleChangeDeg, c.maxSpineChange, 10);

  const raw =
    xFactor * c.weights.xFactor +
    weightShift * c.weights.weightShift +
    headStability * c.weights.headStability +
    tempo * c.weights.tempo +
    spineAngle * c.weights.spineAngle;

  return {
    formScore: Math.max(0, Math.min(100, Math.round(raw))),
    subScores: {
      xFactor: Math.round(xFactor * 100),
      weightShift: Math.round(weightShift * 100),
      headStability: Math.round(headStability * 100),
      tempo: Math.round(tempo * 100),
      spineAngle: Math.round(spineAngle * 100),
    },
  };
}

function scoreRange(v: number, range: [number, number], tol: number): number {
  const [lo, hi] = range;
  if (v >= lo && v <= hi) return 1;
  const d = v < lo ? lo - v : v - hi;
  return Math.max(0, 1 - d / tol);
}
function scoreBelow(v: number, threshold: number, tol: number): number {
  if (v <= threshold) return 1;
  return Math.max(0, 1 - (v - threshold) / tol);
}
