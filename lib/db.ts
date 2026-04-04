// Tiny data layer. Uses Vercel KV when KV_REST_API_URL is set
// (automatically provisioned when you add Vercel KV to the project),
// otherwise falls back to an in-memory Map so local dev and preview
// deploys without KV keep working.

import "server-only";

export type ExerciseType = "squat" | "pushup";
export type ProgramExercise = { type: ExerciseType; targetReps: number };
export type Program = { id: string; exercises: ProgramExercise[] };
export type Patient = {
  id: string;
  code: string; // short shareable code (e.g. "x7k3")
  name: string;
  program: Program;
  createdAt: number;
};
export type Session = {
  id: string;
  patientId: string;
  patientCode: string;
  exerciseType: ExerciseType;
  reps: number;
  targetReps: number;
  completedAt: number;
};

// ------- backend detection -------
const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

// in-memory fallback (per process)
const memStore: Record<string, unknown> = {};
const memSets: Record<string, Set<string>> = {};

async function kvGet<T>(key: string): Promise<T | null> {
  if (hasKV) {
    const { kv } = await import("@vercel/kv");
    return (await kv.get<T>(key)) ?? null;
  }
  return (memStore[key] as T) ?? null;
}
async function kvSet<T>(key: string, value: T): Promise<void> {
  if (hasKV) {
    const { kv } = await import("@vercel/kv");
    await kv.set(key, value);
    return;
  }
  memStore[key] = value;
}
async function kvSAdd(key: string, member: string): Promise<void> {
  if (hasKV) {
    const { kv } = await import("@vercel/kv");
    await kv.sadd(key, member);
    return;
  }
  if (!memSets[key]) memSets[key] = new Set();
  memSets[key].add(member);
}
async function kvSMembers(key: string): Promise<string[]> {
  if (hasKV) {
    const { kv } = await import("@vercel/kv");
    return (await kv.smembers(key)) as string[];
  }
  return Array.from(memSets[key] ?? []);
}

// ------- ids / codes -------
function randomCode(len = 5): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous chars
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// ------- API -------
export async function createPatient(
  name: string,
  exercises: ProgramExercise[]
): Promise<Patient> {
  const id = randomId();
  const code = randomCode();
  const patient: Patient = {
    id,
    code,
    name,
    program: { id: randomId(), exercises },
    createdAt: Date.now(),
  };
  await kvSet(`patient:${id}`, patient);
  await kvSet(`code:${code}`, id);
  await kvSAdd("patients", id);
  return patient;
}

export async function getPatient(id: string): Promise<Patient | null> {
  return kvGet<Patient>(`patient:${id}`);
}
export async function getPatientByCode(code: string): Promise<Patient | null> {
  const id = await kvGet<string>(`code:${code}`);
  if (!id) return null;
  return getPatient(id);
}
export async function listPatients(): Promise<Patient[]> {
  const ids = await kvSMembers("patients");
  const rows = await Promise.all(ids.map((id) => getPatient(id)));
  return rows
    .filter((p): p is Patient => p != null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function logSession(
  patientCode: string,
  exerciseType: ExerciseType,
  reps: number,
  targetReps: number
): Promise<Session | null> {
  const patient = await getPatientByCode(patientCode);
  if (!patient) return null;
  const s: Session = {
    id: randomId(),
    patientId: patient.id,
    patientCode,
    exerciseType,
    reps,
    targetReps,
    completedAt: Date.now(),
  };
  await kvSet(`session:${s.id}`, s);
  await kvSAdd(`sessions:${patient.id}`, s.id);
  return s;
}

export async function listSessions(patientId: string): Promise<Session[]> {
  const ids = await kvSMembers(`sessions:${patientId}`);
  const rows = await Promise.all(ids.map((id) => kvGet<Session>(`session:${id}`)));
  return rows
    .filter((s): s is Session => s != null)
    .sort((a, b) => b.completedAt - a.completedAt);
}

// adherence = sessions done in last 7 days / program exercises * 7
export async function adherencePct(patient: Patient): Promise<number> {
  const sessions = await listSessions(patient.id);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = sessions.filter((s) => s.completedAt > weekAgo);
  const expected = patient.program.exercises.length * 7;
  if (expected === 0) return 0;
  return Math.min(100, Math.round((recent.length / expected) * 100));
}

export async function streakDays(patient: Patient): Promise<number> {
  const sessions = await listSessions(patient.id);
  if (sessions.length === 0) return 0;
  const byDay = new Set<string>();
  for (const s of sessions) {
    const d = new Date(s.completedAt);
    byDay.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (byDay.has(key)) streak++;
    else if (i > 0) break; // allow today to be empty
  }
  return streak;
}

export { hasKV };
