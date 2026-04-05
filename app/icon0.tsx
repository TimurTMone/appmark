import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon192() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #00ffa3, #d946ef)",
          color: "#000",
          fontSize: 140,
          fontWeight: 800,
          letterSpacing: "-0.04em",
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
