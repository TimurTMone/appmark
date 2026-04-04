import { NextResponse } from "next/server";
import { listSessions } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sessions = await listSessions(params.id);
  return NextResponse.json({ sessions });
}
