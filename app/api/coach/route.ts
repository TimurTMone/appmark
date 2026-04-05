import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Post-shot coaching via Claude. Works without an API key in dev mode
// by returning a canned response. Set ANTHROPIC_API_KEY in Vercel to
// enable the real call.
export async function POST(req: Request) {
  const body = await req.json();
  const metrics = body?.metrics;
  const cues = body?.cues;
  if (!metrics) {
    return NextResponse.json({ error: "metrics required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      coach:
        "Nice rep. " +
        (cues?.[0]?.text ?? "Work on repeating that rhythm and hold the follow-through.") +
        " (Configure ANTHROPIC_API_KEY for personalized coaching.)",
      source: "stub",
    });
  }

  const prompt = buildPrompt(metrics, cues);
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
    const text = data?.content?.[0]?.text ?? "Keep shooting.";
    return NextResponse.json({ coach: text, source: "claude" });
  } catch (e) {
    return NextResponse.json({
      coach: "Couldn't reach the coach. " + (cues?.[0]?.text ?? "Keep shooting."),
      source: "error",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

function buildPrompt(metrics: Record<string, number>, cues: { text: string }[] | undefined): string {
  const m = metrics;
  const bullets = cues?.map((c) => `- ${c.text}`).join("\n") ?? "- (no faults detected)";
  return `You are a basketball shooting coach speaking to an athlete right after a shot attempt.
You just measured these metrics from their shot:

- Knee angle at load: ${Math.round(m.kneeAngleAtLoad)}° (ideal: 110–140°)
- Elbow angle at set-point: ${Math.round(m.elbowAngleAtSetpoint)}° (ideal: 75–95°)
- Elbow angle at release: ${Math.round(m.elbowAngleAtRelease)}° (ideal: near 180°)
- Elbow flare at set-point: ${m.elbowFlareAtSetpoint.toFixed(3)} (ideal: < 0.08)
- Form score: ${Math.round(m.formScore)}/100

Rule-based faults detected:
${bullets}

Write ONE specific, encouraging coaching note in 2–3 short sentences. Reference ONE concrete number from the data. Sound like a real coach in a gym, not a textbook. Do not restate all metrics. Do not use emoji.`;
}
