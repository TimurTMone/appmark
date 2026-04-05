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
        "Nice swing. " +
        (cues?.[0]?.text ?? "Keep repeating that move.") +
        " (Configure ANTHROPIC_API_KEY for personalized coaching.)",
      source: "stub",
    });
  }

  const prompt = buildGolfPrompt(m, cues);
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
    const text = data?.content?.[0]?.text ?? "Keep swinging.";
    return NextResponse.json({ coach: text, source: "claude" });
  } catch (e) {
    return NextResponse.json({
      coach: "Couldn't reach the coach. " + (cues?.[0]?.text ?? "Keep swinging."),
      source: "error",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

function buildGolfPrompt(m: Record<string, number>, cues: { text: string }[] | undefined): string {
  const bullets = cues?.map((c) => `- ${c.text}`).join("\n") ?? "- (no faults detected)";
  return `You are a PGA golf coach speaking to a student right after a swing.
You measured these metrics from their face-on camera swing:

- X-Factor (shoulder−hip separation at top): ${Math.round(m.xFactor)}° (pro range: 35–50°)
- Shoulder turn at top: ${Math.round(m.shoulderTurnAtTopDeg)}°
- Hip turn at top: ${Math.round(m.hipTurnAtTopDeg)}°
- Weight shift to lead foot at impact: ${Math.round(m.weightShiftPct)}% (ideal: 70–95%)
- Max head drift during swing: ${(Number(m.headDriftMaxNorm) * 100).toFixed(1)}% of frame (ideal: <8%)
- Tempo ratio (backswing:downswing): ${Number(m.tempoRatio).toFixed(1)}:1 (classic pro: ~3:1)
- Spine angle change address→impact: ${Math.round(m.spineAngleChangeDeg)}° (ideal: <10°)
- Form score: ${Math.round(m.formScore)}/100

Rule-based faults:
${bullets}

Write ONE specific, encouraging coaching note in 2–3 short sentences. Reference ONE concrete number. Sound like a real coach on the range, not a textbook. Do not restate all metrics. Do not use emoji.`;
}
