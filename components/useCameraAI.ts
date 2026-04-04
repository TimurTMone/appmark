// Shared hook: sets up camera + pose + face, runs a user-supplied onFrame callback.

import { useEffect, useRef, useState } from "react";
import { getPoseLandmarker, type Landmarks } from "@/lib/pose";
import { getFaceLandmarker, smileScore } from "@/lib/face";

export type FrameData = { lm: Landmarks; t: number; smile: number | null };

export function useCameraAI(onFrame: (f: FrameData) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const onFrameRef = useRef(onFrame);
  useEffect(() => { onFrameRef.current = onFrame; }, [onFrame]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let frameCount = 0;
    let lastSmile: number | null = null;

    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (stopped) return;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();

        const [pose, face] = await Promise.all([getPoseLandmarker(), getFaceLandmarker()]);
        if (stopped) return;
        setReady(true);

        const loop = () => {
          if (stopped) return;
          const now = performance.now();
          const poseRes = pose.detectForVideo(v, now);
          frameCount++;
          if (frameCount % 2 === 0) {
            const faceRes = face.detectForVideo(v, now);
            const s = smileScore(faceRes.faceBlendshapes?.[0]?.categories);
            if (s != null) lastSmile = s;
          }
          const lm = poseRes.landmarks?.[0];
          if (lm) onFrameRef.current({ lm, t: now, smile: lastSmile });
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Camera error");
      }
    }

    init();
    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  return { videoRef, canvasRef, ready, err };
}
