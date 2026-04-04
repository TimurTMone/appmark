// FaceLandmarker with blendshapes for smile detection.
// Lazy-loaded, reuses the same vision WASM fileset as pose.

import type { FaceLandmarker } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker;
  const vision = await import("@mediapipe/tasks-vision");
  const fileset = await vision.FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  faceLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false,
  });
  return faceLandmarker;
}

// Returns smile intensity 0..1 by averaging left+right smile blendshapes.
export function smileScore(
  blendshapes: Array<{ categoryName: string; score: number }> | undefined
): number | null {
  if (!blendshapes) return null;
  let left = 0, right = 0, found = 0;
  for (const b of blendshapes) {
    if (b.categoryName === "mouthSmileLeft") { left = b.score; found++; }
    else if (b.categoryName === "mouthSmileRight") { right = b.score; found++; }
  }
  if (found === 0) return null;
  return (left + right) / 2;
}
