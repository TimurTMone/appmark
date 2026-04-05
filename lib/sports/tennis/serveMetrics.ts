// Tennis serve metrics from 2D pose, side-view camera, RH player.
//
// Dominant hand = right (RH server) = MediaPipe wrist 16.
// Tossing hand  = left              = MediaPipe wrist 15.
// Serve phases captured in a single continuous window.

import { angleAt, L, type Landmarks } from "@/lib/pose";
import type { ServeConfig } from "./serveTypes";

const LEFT_ELBOW = 13;
const LEFT_WRIST = 15;
const RIGHT_ELBOW = 14;
const RIGHT_WRIST = 16;

export type ServeFrame = {
  t: number;
  domWristY: number;
  domWristX: number;
  tossWristY: number;
  tossWristX: number;
  domElbowAngle: number;
  tossElbowAngle: number;
  kneeAngle: number;
  shoulderY: number;
  hipY: number;
};

export type ServeMetrics = {
  // key timestamps
  trophyT: number;
  dropT: number;
  contactT: number;
  // body kinematics
  kneeAngleAtTrophy: number;
  tossArmExtensionAtTrophy: number;
  racketDropNorm: number;         // depth below shoulder at lowest dominant wrist
  contactHeightNorm: number;      // above shoulder at contact
  contactArmExtension: number;    // dominant elbow angle at contact
  jumpAmplitude: number;          // max shoulder-Y drop from baseline
  serveDurationMs: number;        // trophy → contact
  // score
  formScore: number;
  subScores: {
    kneeFlex: number;
    tossArm: number;
    racketDrop: number;
    contactHeight: number;
    contactExtension: number;
    jumpDrive: number;
  };
};

export function computeFrame(lm: Landmarks, t: number, hand: "right" | "left" = "right"): ServeFrame {
  const domIsRight = hand === "right";
  const domElbow = domIsRight ? RIGHT_ELBOW : LEFT_ELBOW;
  const domWrist = domIsRight ? RIGHT_WRIST : LEFT_WRIST;
  const tossElbow = domIsRight ? LEFT_ELBOW : RIGHT_ELBOW;
  const tossWrist = domIsRight ? LEFT_WRIST : RIGHT_WRIST;
  const domShoulder = domIsRight ? L.RIGHT_SHOULDER : L.LEFT_SHOULDER;
  const tossShoulder = domIsRight ? L.LEFT_SHOULDER : L.RIGHT_SHOULDER;

  const domElbowAngle = angleAt(lm[domShoulder], lm[domElbow], lm[domWrist]);
  const tossElbowAngle = angleAt(lm[tossShoulder], lm[tossElbow], lm[tossWrist]);

  const leftKnee = angleAt(lm[L.LEFT_HIP], lm[L.LEFT_KNEE], lm[L.LEFT_ANKLE]);
  const rightKnee = angleAt(lm[L.RIGHT_HIP], lm[L.RIGHT_KNEE], lm[L.RIGHT_ANKLE]);
  const kneeAngle = (leftKnee + rightKnee) / 2;

  const shoulderY = (lm[L.LEFT_SHOULDER].y + lm[L.RIGHT_SHOULDER].y) / 2;
  const hipY = (lm[L.LEFT_HIP].y + lm[L.RIGHT_HIP].y) / 2;

  return {
    t,
    domWristY: lm[domWrist].y,
    domWristX: lm[domWrist].x,
    tossWristY: lm[tossWrist].y,
    tossWristX: lm[tossWrist].x,
    domElbowAngle,
    tossElbowAngle,
    kneeAngle,
    shoulderY,
    hipY,
  };
}

export function summarizeServe(frames: ServeFrame[], baselineShoulderY: number, config: ServeConfig): ServeMetrics | null {
  if (frames.length < 12) return null;

  // trophy = frame where tossing wrist reaches its highest point (lowest Y)
  let trophyIdx = 0;
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].tossWristY < frames[trophyIdx].tossWristY) trophyIdx = i;
  }
  const trophyFrame = frames[trophyIdx];

  // racket drop = lowest dominant wrist Y AFTER trophy
  // (highest Y value = lowest on screen = racket behind back)
  let dropIdx = trophyIdx;
  for (let i = trophyIdx + 1; i < frames.length; i++) {
    if (frames[i].domWristY > frames[dropIdx].domWristY) dropIdx = i;
  }
  const dropFrame = frames[dropIdx];

  // contact = highest dominant wrist AFTER drop
  let contactIdx = dropIdx;
  for (let i = dropIdx + 1; i < frames.length; i++) {
    if (frames[i].domWristY < frames[contactIdx].domWristY) contactIdx = i;
  }
  const contactFrame = frames[contactIdx];

  // knee min over the window (deepest load)
  const kneeAngleAtTrophy = frames.reduce((m, f) => Math.min(m, f.kneeAngle), 180);

  const tossArmExtensionAtTrophy = trophyFrame.tossElbowAngle;

  // racket drop depth: how far below shoulder Y at the drop moment
  const racketDropNorm = Math.max(0, dropFrame.domWristY - dropFrame.shoulderY);

  // contact height: how far above shoulder Y at contact moment
  const contactHeightNorm = Math.max(0, contactFrame.shoulderY - contactFrame.domWristY);

  const contactArmExtension = contactFrame.domElbowAngle;

  // jump amplitude: max baseline - shoulderY
  let jumpAmplitude = 0;
  for (const f of frames) {
    const delta = baselineShoulderY - f.shoulderY;
    if (delta > jumpAmplitude) jumpAmplitude = delta;
  }

  const serveDurationMs = contactFrame.t - trophyFrame.t;

  const { formScore, subScores } = scoreServe(
    {
      kneeAngleAtTrophy,
      tossArmExtensionAtTrophy,
      racketDropNorm,
      contactHeightNorm,
      contactArmExtension,
      jumpAmplitude,
      serveDurationMs,
    },
    config
  );

  return {
    trophyT: trophyFrame.t,
    dropT: dropFrame.t,
    contactT: contactFrame.t,
    kneeAngleAtTrophy,
    tossArmExtensionAtTrophy,
    racketDropNorm,
    contactHeightNorm,
    contactArmExtension,
    jumpAmplitude,
    serveDurationMs,
    formScore,
    subScores,
  };
}

function scoreServe(
  m: {
    kneeAngleAtTrophy: number;
    tossArmExtensionAtTrophy: number;
    racketDropNorm: number;
    contactHeightNorm: number;
    contactArmExtension: number;
    jumpAmplitude: number;
    serveDurationMs: number;
  },
  c: ServeConfig
): { formScore: number; subScores: ServeMetrics["subScores"] } {
  void m.serveDurationMs; // reserved for future tempo scoring

  const kneeFlex = scoreRange(m.kneeAngleAtTrophy, c.idealKneeAtTrophy, 25);
  const tossArm = scoreRange(m.tossArmExtensionAtTrophy, c.idealTossArmExtension, 20);
  const racketDrop = scoreRange(m.racketDropNorm, c.idealRacketDropNorm, 0.1);
  const contactHeight = scoreRange(m.contactHeightNorm, c.idealContactHeightNorm, 0.12);
  const contactExtension = scoreAbove(m.contactArmExtension, c.idealContactArmExtension[0], 15);
  // jump drive: 0.03 normalized is a small pop, 0.08+ is explosive
  const jumpDrive = m.jumpAmplitude < 0.015 ? 0.2 :
                    m.jumpAmplitude < 0.04 ? 0.6 :
                    m.jumpAmplitude < 0.08 ? 0.85 : 1.0;

  const raw =
    kneeFlex * c.weights.kneeFlex +
    tossArm * c.weights.tossArm +
    racketDrop * c.weights.racketDrop +
    contactHeight * c.weights.contactHeight +
    contactExtension * c.weights.contactExtension +
    jumpDrive * c.weights.jumpDrive;

  return {
    formScore: Math.max(0, Math.min(100, Math.round(raw))),
    subScores: {
      kneeFlex: Math.round(kneeFlex * 100),
      tossArm: Math.round(tossArm * 100),
      racketDrop: Math.round(racketDrop * 100),
      contactHeight: Math.round(contactHeight * 100),
      contactExtension: Math.round(contactExtension * 100),
      jumpDrive: Math.round(jumpDrive * 100),
    },
  };
}

function scoreRange(v: number, range: [number, number], tol: number): number {
  const [lo, hi] = range;
  if (v >= lo && v <= hi) return 1;
  const d = v < lo ? lo - v : v - hi;
  return Math.max(0, 1 - d / tol);
}
function scoreAbove(v: number, threshold: number, tol: number): number {
  if (v >= threshold) return 1;
  return Math.max(0, 1 - (threshold - v) / tol);
}
