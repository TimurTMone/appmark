// Exercise detectors built on top of pose landmarks.
// All detectors are stateful objects that you feed frames to.

import { angleAt, L, type Landmarks } from "./pose";

export type Exercise = "squat" | "pushup" | "boxing";

// ------- SQUAT -------
export type SquatState = { phase: "up" | "down"; minKnee: number };
export function makeSquatDetector() {
  const s: SquatState = { phase: "up", minKnee: 180 };
  return {
    state: s,
    update(lm: Landmarks): { rep: boolean; depth: number; knee: number } {
      const left = angleAt(lm[L.LEFT_HIP], lm[L.LEFT_KNEE], lm[L.LEFT_ANKLE]);
      const right = angleAt(lm[L.RIGHT_HIP], lm[L.RIGHT_KNEE], lm[L.RIGHT_ANKLE]);
      const knee = (left + right) / 2;
      if (knee < s.minKnee) s.minKnee = knee;
      let rep = false;
      let depth = s.minKnee;
      if (s.phase === "up" && knee < 100) s.phase = "down";
      else if (s.phase === "down" && knee > 160) {
        s.phase = "up";
        rep = true;
        s.minKnee = 180;
      }
      return { rep, depth, knee };
    },
  };
}

// ------- PUSHUP -------
// Uses elbow angle (shoulder-elbow-wrist). Requires torso roughly horizontal
// so we don't count random arm bends while standing.
export function makePushupDetector() {
  let phase: "up" | "down" = "up";
  return {
    update(lm: Landmarks): { rep: boolean; elbow: number; horizontal: boolean } {
      const lElbow = angleAt(lm[L.LEFT_SHOULDER], lm[13], lm[15]);
      const rElbow = angleAt(lm[L.RIGHT_SHOULDER], lm[14], lm[16]);
      const elbow = (lElbow + rElbow) / 2;

      // torso horizontality: shoulder y and hip y should be close
      const shoulderY = (lm[L.LEFT_SHOULDER].y + lm[L.RIGHT_SHOULDER].y) / 2;
      const hipY = (lm[L.LEFT_HIP].y + lm[L.RIGHT_HIP].y) / 2;
      const horizontal = Math.abs(shoulderY - hipY) < 0.12;

      let rep = false;
      if (horizontal) {
        if (phase === "up" && elbow < 100) phase = "down";
        else if (phase === "down" && elbow > 155) {
          phase = "up";
          rep = true;
        }
      }
      return { rep, elbow, horizontal };
    },
  };
}

// ------- BOXING -------
// Punch detection from 2D landmarks: track wrist velocity; a punch fires when
// the wrist speed peaks past a threshold AND the arm is meaningfully extended.
// Classify by the motion vector at peak:
//   straight forward + arm extended  → jab/cross
//   lateral at shoulder height       → hook
//   upward from low position         → uppercut
export type PunchType = "jab" | "cross" | "hook" | "uppercut";
export type Punch = { hand: "left" | "right"; type: PunchType; speed: number; t: number };

type HandState = {
  lastX: number; lastY: number; lastT: number;
  cooldownUntil: number;
  lowestY: number; // tracks crouch for uppercut
};

export function makeBoxingDetector() {
  const left: HandState = { lastX: 0, lastY: 0, lastT: 0, cooldownUntil: 0, lowestY: 0 };
  const right: HandState = { lastX: 0, lastY: 0, lastT: 0, cooldownUntil: 0, lowestY: 0 };

  function classify(
    vx: number, vy: number, armExtension: number, wristY: number, shoulderY: number
  ): PunchType {
    const absVx = Math.abs(vx), absVy = Math.abs(vy);
    // hook: mostly horizontal, arm not fully extended
    if (absVx > absVy * 1.1 && armExtension < 150) return "hook";
    // uppercut: upward motion (negative vy in screen coords) + hand coming from below shoulder
    if (vy < 0 && absVy > absVx && wristY > shoulderY) return "uppercut";
    // straight punch: high arm extension
    return armExtension > 150 ? "jab" : "hook";
  }

  function tick(
    hs: HandState,
    hand: "left" | "right",
    wrist: { x: number; y: number },
    elbow: { x: number; y: number },
    shoulder: { x: number; y: number },
    t: number
  ): Punch | null {
    if (hs.lastT === 0) {
      hs.lastX = wrist.x; hs.lastY = wrist.y; hs.lastT = t;
      return null;
    }
    const dt = Math.max(1, t - hs.lastT);
    const vx = (wrist.x - hs.lastX) / (dt / 1000); // units per second (normalized coords)
    const vy = (wrist.y - hs.lastY) / (dt / 1000);
    const speed = Math.hypot(vx, vy);
    hs.lastX = wrist.x; hs.lastY = wrist.y; hs.lastT = t;

    if (t < hs.cooldownUntil) return null;

    // speed threshold tuned for normalized coords; ~2.5 units/sec = fast punch
    if (speed < 2.5) return null;

    const armExt = angleAt(shoulder, elbow, wrist);
    // require arm to be at least somewhat extended OR lateral
    if (armExt < 110) return null;

    const type: PunchType =
      hand === "left"
        ? classify(vx, wrist.y - hs.lastY, armExt, wrist.y, shoulder.y)
        : classify(vx, wrist.y - hs.lastY, armExt, wrist.y, shoulder.y);

    // crude jab/cross split: jab = lead (typically left in orthodox). We don't
    // know stance, so mark lead hand = whichever hand is further forward (smaller Y-ext to head).
    // For MVP: label left as jab, right as cross when straight.
    let finalType = type;
    if (type === "jab" && hand === "right") finalType = "cross";

    hs.cooldownUntil = t + 280; // dedupe same punch
    return { hand, type: finalType, speed, t };
  }

  return {
    update(lm: Landmarks, t: number): Punch | null {
      const leftPunch = tick(
        left, "left",
        lm[15], lm[13], lm[L.LEFT_SHOULDER], t
      );
      if (leftPunch) return leftPunch;
      const rightPunch = tick(
        right, "right",
        lm[16], lm[14], lm[L.RIGHT_SHOULDER], t
      );
      return rightPunch;
    },
  };
}

// ------- COMBO CALLER -------
// Calls combos like ["jab","cross"] and scores whether the user throws them in order within a time window.
export type ComboCall = { combo: PunchType[]; deadlineAt: number; idx: number };
export const COMBOS: { name: string; combo: PunchType[] }[] = [
  { name: "1", combo: ["jab"] },
  { name: "1-2", combo: ["jab", "cross"] },
  { name: "1-1-2", combo: ["jab", "jab", "cross"] },
  { name: "1-2-3", combo: ["jab", "cross", "hook"] },
  { name: "1-2-3-2", combo: ["jab", "cross", "hook", "cross"] },
];
