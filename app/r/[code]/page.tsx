import { notFound } from "next/navigation";
import { getPatientByCode } from "@/lib/db";
import RoutineClient from "./RoutineClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function RoutinePage({ params }: { params: { code: string } }) {
  const code = params.code.toLowerCase();
  const patient = await getPatientByCode(code);
  if (!patient) notFound();
  return (
    <RoutineClient
      code={patient.code}
      name={patient.name}
      exercises={patient.program.exercises}
    />
  );
}
