import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Arc — AI form coach for basketball, golf, tennis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #000 0%, #0a0a0a 40%, #001a12 100%)",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* ambient blobs */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            left: "-120px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,163,0.25), transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-160px",
            right: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217,70,239,0.20), transparent 70%)",
            display: "flex",
          }}
        />

        {/* logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", position: "relative" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #00ffa3, #d946ef)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.01em", color: "#fff" }}>
            Arc
          </div>
          <div style={{ display: "flex", fontSize: "18px", color: "rgba(255,255,255,0.4)", marginLeft: "8px" }}>
            · AI form coach
          </div>
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            marginTop: "80px",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", fontSize: "92px", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
            One AI coach.
          </div>
          <div style={{ display: "flex", fontSize: "92px", fontWeight: 800, letterSpacing: "-0.03em", color: "#00ffa3", lineHeight: 1 }}>
            Every sport.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "26px",
            color: "rgba(255,255,255,0.65)",
            marginTop: "36px",
            maxWidth: "900px",
            lineHeight: 1.35,
            position: "relative",
          }}
        >
          On-device pose AI · sub-200ms voice coaching · research-calibrated biomechanics
        </div>

        {/* sport pills */}
        <div style={{ display: "flex", gap: "14px", marginTop: "auto", position: "relative" }}>
          {[
            { emoji: "🏀", label: "Basketball" },
            { emoji: "⛳", label: "Golf" },
            { emoji: "🎾", label: "Tennis" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 22px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: "24px",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              <span style={{ fontSize: "28px" }}>{s.emoji}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
