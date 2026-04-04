import { NextResponse } from "next/server";
import { createPatient, listPatients, adherencePct, streakDays } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const patients = await listPatients();
  const enriched = await Promise.all(
    patients.map(async (p) => ({
      ...p,
      adherence: await adherencePct(p),
      streak: await streakDays(p),
    }))
  );
  return NextResponse.json({ patients: enriched });
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  const exercises = body?.exercises;
  if (!name || !Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json({ error: "name and exercises required" }, { status: 400 });
  }
  const clean = exercises
    .map((e: { type: unknown; targetReps: unknown }) => ({
      type: String(e?.type),
      targetReps: Math.max(1, Math.min(100, Number(e?.targetReps) || 10)),
    }))
    .filter((e) => e.type === "squat" || e.type === "pushup");
  if (clean.length === 0) {
    return NextResponse.json({ error: "valid exercises required" }, { status: 400 });
  }
  const patient = await createPatient(name, clean as { type: "squat" | "pushup"; targetReps: number }[]);
  return NextResponse.json({ patient });
}
