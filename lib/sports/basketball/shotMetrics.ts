// Pure-math biomechanics computations for a basketball shot.
// All inputs are 2D normalized landmarks (x,y in 0..1).
// Works best with side-on camera (camera perpendicular to shooter).

import { angleAt, L, type Landmarks } from "@/lib/pose";
import type { ShotTypeConfig } from "./shotTypes";

// MediaPipe indices for arm joints (beyond what's in lib/pose.ts)
const LEFT_ELBOW = 13;
const LEFT_WRIST = 15;
const RIGHT_ELBOW = 14;
const RIGHT_WRIST = 16;

export type Side = "left" | "right";

export type FrameMetrics = {
  t: number;                     // ms timestamp
  kneeAngle: number;             // avg knee angle (hip-knee-ankle)
  shootingElbowAngle: number;    // shoulder-elbow-wrist of shooting arm
  shootingWristX: number;
  shootingWristY: number;        // normalized wrist Y (lower Y = higher on screen)
  shoulderY: number;             // avg shoulder Y
  hipY: number;                  // avg hip Y
  elbowFlareX: number;           // |elbowX - shoulderX| (same side, normalized)
  shootingSide: Side;
};

export type ShotMetrics = {
  side: Side;
  kneeAngleAtLoad: number;          // min knee angle during the shot
  elbowAngleAtSetpoint: number;     // at lowest-wrist frame pre-release
  elbowAngleAtRelease: number;      // at peak-wrist frame
  wristPeakNormY: number;
  elbowFlareAtSetpoint: number;
  releaseAngleDeg: number | null;   // angle of wrist velocity vector at peak, from horizontal
  releaseVelocity: number;
  jumpAmplitude: number;            // max shoulder-Y drop from baseline (0 = no jump)
  shotDurationMs: number;
  formScore: number;                // 0..100
  // component sub-scores for transparency
  subScores: {
    kneeFlex: number;
    setpoint: number;
    releaseExtension: number;
    elbowFlare: number;
    releaseAngle: number;
  };
};

// ---- live per-frame computation ----
export function computeFrame(lm: Landmarks, t: number, side: Side): FrameMetrics {
  const leftKnee = angleAt(lm[L.LEFT_HIP], lm[L.LEFT_KNEE], lm[L.LEFT_ANKLE]);
  const rightKnee = angleAt(lm[L.RIGHT_HIP], lm[L.RIGHT_KNEE], lm[L.RIGHT_ANKLE]);
  const kneeAngle = (leftKnee + rightKnee) / 2;

  const shoulderY = (lm[L.LEFT_SHOULDER].y + lm[L.RIGHT_SHOULDER].y) / 2;
  const hipY = (lm[L.LEFT_HIP].y + lm[L.RIGHT_HIP].y) / 2;

  const shoulder = side === "right" ? lm[L.RIGHT_SHOULDER] : lm[L.LEFT_SHOULDER];
  const elbow = side === "right" ? lm[RIGHT_ELBOW] : lm[LEFT_ELBOW];
  const wrist = side === "right" ? lm[RIGHT_WRIST] : lm[LEFT_WRIST];

  const shootingElbowAngle = angleAt(shoulder, elbow, wrist);
  const elbowFlareX = Math.abs(elbow.x - shoulder.x);

  return {
    t,
    kneeAngle,
    shootingElbowAngle,
    shootingWristX: wrist.x,
    shootingWristY: wrist.y,
    shoulderY,
    hipY,
    elbowFlareX,
    shootingSide: side,
  };
}

export function pickShootingSide(lm: Landmarks): Side {
  return lm[RIGHT_WRIST].y < lm[LEFT_WRIST].y ? "right" : "left";
}

// ---- post-shot aggregation ----
export function summarizeShot(frames: FrameMetrics[], config: ShotTypeConfig): ShotMetrics | null {
  if (frames.length < 5) return null;
  const side = frames[Math.floor(frames.length / 2)].shootingSide;

  const kneeAngleAtLoad = frames.reduce((m, f) => Math.min(m, f.kneeAngle), 180);

  // peak = lowest wrist Y (highest on screen)
  let peakIdx = 0;
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].shootingWristY < frames[peakIdx].shootingWristY) peakIdx = i;
  }
  const releaseFrame = frames[peakIdx];
  const wristPeakNormY = releaseFrame.shootingWristY;
  const elbowAngleAtRelease = releaseFrame.shootingElbowAngle;

  // setpoint = highest wrist Y (lowest on screen) before peak
  let setIdx = 0;
  for (let i = 1; i < peakIdx; i++) {
    if (frames[i].shootingWristY > frames[setIdx].shootingWristY) setIdx = i;
  }
  const setpointFrame = frames[setIdx];
  const elbowAngleAtSetpoint = setpointFrame.shootingElbowAngle;
  const elbowFlareAtSetpoint = setpointFrame.elbowFlareX;

  // release velocity (wrist speed in normalized units/sec at peak)
  const preForVel = frames[Math.max(0, peakIdx - 2)];
  const dtVel = Math.max(1, releaseFrame.t - preForVel.t);
  const releaseVelocity = (preForVel.shootingWristY - releaseFrame.shootingWristY) / (dtVel / 1000);

  // release angle: angle of wrist motion vector from (peak - 3 frames) → peak
  const preForAngle = frames[Math.max(0, peakIdx - 3)];
  const dx = releaseFrame.shootingWristX - preForAngle.shootingWristX;
  const dy = preForAngle.shootingWristY - releaseFrame.shootingWristY; // invert: up = positive
  // mirrored camera: horizontal forward component matters. Use absolute horizontal.
  const releaseAngleDeg =
    dx === 0 && dy === 0 ? null : (Math.atan2(dy, Math.abs(dx)) * 180) / Math.PI;

  // jump amplitude: max (baseline shoulderY - current shoulderY)
  const baselineShoulderY = frames[0].shoulderY;
  const minShoulderY = frames.reduce((m, f) => Math.min(m, f.shoulderY), baselineShoulderY);
  const jumpAmplitude = Math.max(0, baselineShoulderY - minShoulderY);

  const shotDurationMs = releaseFrame.t - setpointFrame.t;

  const { formScore, subScores } = scoreShot(
    {
      kneeAngleAtLoad,
      elbowAngleAtSetpoint,
      elbowAngleAtRelease,
      elbowFlareAtSetpoint,
      releaseAngleDeg,
    },
    config
  );

  return {
    side,
    kneeAngleAtLoad,
    elbowAngleAtSetpoint,
    elbowAngleAtRelease,
    wristPeakNormY,
    elbowFlareAtSetpoint,
    releaseAngleDeg,
    releaseVelocity,
    jumpAmplitude,
    shotDurationMs,
    formScore,
    subScores,
  };
}

// Score 0..100 using the config's ideal ranges and weights.
function scoreShot(
  m: {
    kneeAngleAtLoad: number;
    elbowAngleAtSetpoint: number;
    elbowAngleAtRelease: number;
    elbowFlareAtSetpoint: number;
    releaseAngleDeg: number | null;
  },
  c: ShotTypeConfig
): { formScore: number; subScores: ShotMetrics["subScores"] } {
  const kneeFlex = scoreRange(m.kneeAngleAtLoad, c.idealKneeAtLoad, 25);
  const setpoint = scoreRange(m.elbowAngleAtSetpoint, c.idealSetpointElbow, 20);
  const releaseExtension = scoreAbove(m.elbowAngleAtRelease, c.minReleaseExtension, 20);
  const elbowFlare = scoreBelow(m.elbowFlareAtSetpoint, c.maxElbowFlare, 0.08);
  const releaseAngle =
    m.releaseAngleDeg == null ? 0.8 : scoreRange(m.releaseAngleDeg, c.idealReleaseAngle, 15);

  const raw =
    kneeFlex * c.weights.kneeFlex +
    setpoint * c.weights.setpoint +
    releaseExtension * c.weights.releaseExtension +
    elbowFlare * c.weights.elbowFlare +
    releaseAngle * c.weights.releaseAngle;

  const formScore = Math.max(0, Math.min(100, Math.round(raw)));
  return {
    formScore,
    subScores: {
      kneeFlex: Math.round(kneeFlex * 100),
      setpoint: Math.round(setpoint * 100),
      releaseExtension: Math.round(releaseExtension * 100),
      elbowFlare: Math.round(elbowFlare * 100),
      releaseAngle: Math.round(releaseAngle * 100),
    },
  };
}

// smooth 0..1 score: 1.0 inside ideal range, linearly decays over `tolerance` degrees
function scoreRange(value: number, range: [number, number], tolerance: number): number {
  const [lo, hi] = range;
  if (value >= lo && value <= hi) return 1;
  const d = value < lo ? lo - value : value - hi;
  return Math.max(0, 1 - d / tolerance);
}
function scoreAbove(value: number, threshold: number, tolerance: number): number {
  if (value >= threshold) return 1;
  return Math.max(0, 1 - (threshold - value) / tolerance);
}
function scoreBelow(value: number, threshold: number, tolerance: number): number {
  if (value <= threshold) return 1;
  return Math.max(0, 1 - (value - threshold) / tolerance);
}
