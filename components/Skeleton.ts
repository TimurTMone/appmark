import { L, type Landmarks } from "@/lib/pose";

const PAIRS: [number, number][] = [
  [L.LEFT_SHOULDER, L.RIGHT_SHOULDER],
  [L.LEFT_SHOULDER, L.LEFT_HIP],
  [L.RIGHT_SHOULDER, L.RIGHT_HIP],
  [L.LEFT_HIP, L.RIGHT_HIP],
  [L.LEFT_HIP, L.LEFT_KNEE],
  [L.LEFT_KNEE, L.LEFT_ANKLE],
  [L.RIGHT_HIP, L.RIGHT_KNEE],
  [L.RIGHT_KNEE, L.RIGHT_ANKLE],
  [L.LEFT_SHOULDER, 13], [13, 15], // left arm
  [L.RIGHT_SHOULDER, 14], [14, 16], // right arm
];

const JOINTS = [
  L.LEFT_HIP, L.RIGHT_HIP, L.LEFT_KNEE, L.RIGHT_KNEE,
  L.LEFT_ANKLE, L.RIGHT_ANKLE, L.LEFT_SHOULDER, L.RIGHT_SHOULDER,
  13, 14, 15, 16,
];

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  lm: Landmarks,
  w: number, h: number,
  color = "#00ffa3",
  alpha = 1,
  lineWidth = 5,
  jointR = 6
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  for (const [a, b] of PAIRS) {
    const pa = lm[a], pb = lm[b];
    if (!pa || !pb) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * w, pa.y * h);
    ctx.lineTo(pb.x * w, pb.y * h);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  for (const i of JOINTS) {
    const p = lm[i];
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, jointR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
