import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const m = body?.metrics;
  const cues = body?.cues;
  if (!m) return NextResponse.json({ error: "metrics required" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      coach:
        "Nice serve. " +
        (cues?.[0]?.text ?? "Keep hitting up through the ball.") +
        " (Configure ANTHROPIC_API_KEY for personalized coaching.)",
      source: "stub",
    });
  }

  const prompt = buildTennisPrompt(m, cues);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 220,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json();
    const text = data?.content?.[0]?.text ?? "Keep serving.";
    return NextResponse.json({ coach: text, source: "claude" });
  } catch (e) {
    return NextResponse.json({
      coach: "Couldn't reach the coach. " + (cues?.[0]?.text ?? "Keep serving."),
      source: "error",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

function buildTennisPrompt(m: Record<string, number>, cues: { text: string }[] | undefined): string {
  const bullets = cues?.map((c) => `- ${c.text}`).join("\n") ?? "- (no faults detected)";
  return `You are a tennis coach speaking to a student right after a serve. You measured these metrics from side-view camera:

- Knee angle at trophy: ${Math.round(m.kneeAngleAtTrophy)}° (ideal: 100–125° — the #1 predictor of serve speed)
- Tossing arm extension at trophy: ${Math.round(m.tossArmExtensionAtTrophy)}° (ideal: 160–180°)
- Racket drop depth: ${Number(m.racketDropNorm).toFixed(2)} normalized (ideal: 0.12–0.35)
- Contact height above shoulder: ${(Number(m.contactHeightNorm) * 100).toFixed(0)}% (ideal: 22–40%)
- Arm extension at contact: ${Math.round(m.contactArmExtension)}° (ideal: 155°+)
- Jump amplitude: ${(Number(m.jumpAmplitude) * 100).toFixed(1)} normalized
- Serve duration (trophy→contact): ${Math.round(m.serveDurationMs)}ms (pros: 350–700ms)
- Form score: ${Math.round(m.formScore)}/100

Rule-based faults:
${bullets}

Write ONE specific, encouraging coaching note in 2–3 short sentences. Reference ONE concrete number. Sound like a real coach on the court, not a textbook. Do not restate all metrics. Do not use emoji.`;
}
