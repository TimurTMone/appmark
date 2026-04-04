import { NextResponse } from "next/server";
import { logSession } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const code = String(body?.code ?? "").trim().toLowerCase();
  const type = body?.type;
  const reps = Number(body?.reps) || 0;
  const targetReps = Number(body?.targetReps) || 0;
  if (!code || (type !== "squat" && type !== "pushup")) {
    return NextResponse.json({ error: "code and type required" }, { status: 400 });
  }
  const session = await logSession(code, type, reps, targetReps);
  if (!session) return NextResponse.json({ error: "patient not found" }, { status: 404 });
  return NextResponse.json({ session });
}
