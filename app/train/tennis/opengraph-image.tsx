import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Arc — Tennis serve analyzer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TennisOG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a001a 0%, #0a0a0a 50%, #18001a 100%)",
          padding: "64px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: "-140px", left: "-120px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(217,70,239,0.28), transparent 70%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "-120px", right: "-100px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.20), transparent 70%)", display: "flex" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "14px", position: "relative" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #00ffa3, #d946ef)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: "26px", fontWeight: 800 }}>A</div>
          <div style={{ display: "flex", fontSize: "26px", fontWeight: 700, color: "#fff" }}>Arc</div>
          <div style={{ display: "flex", fontSize: "26px", color: "rgba(255,255,255,0.3)", marginLeft: "6px" }}>·</div>
          <div style={{ display: "flex", fontSize: "22px", color: "rgba(255,255,255,0.7)", marginLeft: "6px", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "26px" }}>🎾</span>
            <span>Tennis</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative", marginTop: "80px", gap: "16px" }}>
          <div style={{ display: "flex", fontSize: "80px", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
            The kinetic chain,
          </div>
          <div style={{ display: "flex", fontSize: "80px", fontWeight: 800, letterSpacing: "-0.03em", color: "#00ffa3", lineHeight: 1 }}>
            decoded.
          </div>
          <div style={{ display: "flex", fontSize: "26px", color: "rgba(255,255,255,0.6)", marginTop: "12px" }}>
            Knee flex is the #1 predictor of serve speed. We measure it.
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", marginTop: "auto", position: "relative" }}>
          {[
            { label: "Knee @ trophy", value: "100–125°" },
            { label: "Contact ext.", value: "155°+" },
            { label: "Toss arm", value: "160–180°" },
          ].map((m) => (
            <div key={m.label} style={{ display: "flex", flexDirection: "column", padding: "16px 22px", borderRadius: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", gap: "4px" }}>
              <div style={{ display: "flex", fontSize: "14px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</div>
              <div style={{ display: "flex", fontSize: "30px", fontWeight: 700, color: "#fff" }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
