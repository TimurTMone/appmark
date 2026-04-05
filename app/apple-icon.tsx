import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 36,
            background: "linear-gradient(135deg, #00ffa3, #d946ef)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontSize: 102,
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size }
  );
}
