import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon512() {
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
          fontSize: 380,
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
