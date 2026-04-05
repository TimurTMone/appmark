// Pure-math biomechanics computations for a basketball shot.
// All inputs are 2D normalized landmarks (x,y in 0..1).
// Works best with side-on camera (camera perpendicular to shooter).

import { angleAt, L, type Landmarks } from "@/lib/pose";

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
  shootingWristY: number;        // normalized wrist Y (lower Y = higher on screen)
  shoulderY: number;             // avg shoulder Y
  hipY: number;                  // avg hip Y
  elbowFlareX: number;           // elbow X offset from shoulder X (same side)
  shootingSide: Side;
};

export type ShotMetrics = {
  side: Side;
  kneeAngleAtLoad: number;       // min knee angle during the shot (deepest bend)
  elbowAngleAtSetpoint: number;  // elbow angle when wrist is at its lowest (pre-release)
  elbowAngleAtRelease: number;   // elbow angle when wrist peaks (release)
  wristPeakNormY: number;        // 0..1; lower = higher release
  elbowFlareAtSetpoint: number;  // |elbowX - shoulderX| at setpoint
  releaseVelocity: number;       // wrist upward speed at release (units/sec in normalized coords)
  shotDurationMs: number;        // load → release
  formScore: number;             // 0..100 computed summary
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
    shootingWristY: wrist.y,
    shoulderY,
    hipY,
    elbowFlareX,
    shootingSide: side,
  };
}

// Detect which hand is the shooting hand: whichever wrist is higher (lower Y)
// for sustained period while the other is steady is the shooting hand.
// For MVP we auto-pick per-frame based on which wrist is above the other.
export function pickShootingSide(lm: Landmarks): Side {
  return lm[RIGHT_WRIST].y < lm[LEFT_WRIST].y ? "right" : "left";
}

// ---- post-shot aggregation ----
export function summarizeShot(frames: FrameMetrics[]): ShotMetrics | null {
  if (frames.length < 5) return null;
  const side = frames[Math.floor(frames.length / 2)].shootingSide;

  // deepest knee bend
  const kneeAngleAtLoad = frames.reduce((m, f) => Math.min(m, f.kneeAngle), 180);

  // lowest wrist Y (highest on screen) is release
  let peakIdx = 0;
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].shootingWristY < frames[peakIdx].shootingWristY) peakIdx = i;
  }
  const releaseFrame = frames[peakIdx];
  const wristPeakNormY = releaseFrame.shootingWristY;
  const elbowAngleAtRelease = releaseFrame.shootingElbowAngle;

  // setpoint = lowest wrist position *before* release (highest Y before peakIdx)
  let setIdx = 0;
  for (let i = 1; i < peakIdx; i++) {
    if (frames[i].shootingWristY > frames[setIdx].shootingWristY) setIdx = i;
  }
  const setpointFrame = frames[setIdx];
  const elbowAngleAtSetpoint = setpointFrame.shootingElbowAngle;
  const elbowFlareAtSetpoint = setpointFrame.elbowFlareX;

  // release velocity: wrist Y delta between 2 frames before peak and peak
  const pre = frames[Math.max(0, peakIdx - 2)];
  const dt = Math.max(1, releaseFrame.t - pre.t);
  const releaseVelocity = ((pre.shootingWristY - releaseFrame.shootingWristY) / (dt / 1000));

  const shotDurationMs = releaseFrame.t - setpointFrame.t;

  const formScore = scoreShot({
    kneeAngleAtLoad,
    elbowAngleAtSetpoint,
    elbowAngleAtRelease,
    elbowFlareAtSetpoint,
  });

  return {
    side,
    kneeAngleAtLoad,
    elbowAngleAtSetpoint,
    elbowAngleAtRelease,
    wristPeakNormY,
    elbowFlareAtSetpoint,
    releaseVelocity,
    shotDurationMs,
    formScore,
  };
}

// 0..100 score. Heuristic, research-backed thresholds.
function scoreShot(m: {
  kneeAngleAtLoad: number;
  elbowAngleAtSetpoint: number;
  elbowAngleAtRelease: number;
  elbowFlareAtSetpoint: number;
}): number {
  let score = 100;
  // Knee bend: ideal 110-140° (research shows meaningful flex is required)
  if (m.kneeAngleAtLoad > 155) score -= 20;          // barely bending
  else if (m.kneeAngleAtLoad > 145) score -= 10;
  // Set-point elbow: ideal 75-95° (research: 75-90°)
  if (m.elbowAngleAtSetpoint < 60 || m.elbowAngleAtSetpoint > 115) score -= 15;
  else if (m.elbowAngleAtSetpoint < 70 || m.elbowAngleAtSetpoint > 100) score -= 7;
  // Release extension: should approach 180°
  if (m.elbowAngleAtRelease < 150) score -= 20;       // chicken wing
  else if (m.elbowAngleAtRelease < 165) score -= 10;
  // Elbow flare at setpoint: elbow should be under the ball, close to shoulder X
  if (m.elbowFlareAtSetpoint > 0.12) score -= 15;     // flared out
  else if (m.elbowFlareAtSetpoint > 0.08) score -= 7;
  return Math.max(0, Math.min(100, Math.round(score)));
}
