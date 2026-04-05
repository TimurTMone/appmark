// Tracks detection→audio latency samples and reports p50/p95.
// Pure client-side, no network.

type Sample = { label: string; ms: number; t: number };

const samples: Sample[] = [];
const MAX = 200;

export function record(label: string, ms: number) {
  samples.push({ label, ms, t: Date.now() });
  if (samples.length > MAX) samples.shift();
}

export function stats(label?: string): { n: number; p50: number; p95: number; last: number | null } {
  const rows = (label ? samples.filter((s) => s.label === label) : samples).map((s) => s.ms).sort((a, b) => a - b);
  if (rows.length === 0) return { n: 0, p50: 0, p95: 0, last: null };
  const p50 = rows[Math.floor(rows.length * 0.5)];
  const p95 = rows[Math.floor(rows.length * 0.95)];
  const last = rows[rows.length - 1];
  return { n: rows.length, p50, p95, last };
}

export function clear() { samples.length = 0; }
