export default function MoodRing({ smile }: { smile: number | null }) {
  const s = smile ?? 0;
  const pct = Math.max(0, Math.min(1, s));
  const emoji = pct < 0.15 ? "😐" : pct < 0.35 ? "🙂" : pct < 0.6 ? "😊" : "😄";
  const R = 18;
  const C = 2 * Math.PI * R;
  const dash = C * pct;
  return (
    <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10">
      <div className="relative h-10 w-10 flex items-center justify-center">
        <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
          <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
          <circle
            cx="22" cy="22" r={R} fill="none" stroke="#fde047" strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C - dash}`}
            style={{ transition: "stroke-dasharray 120ms linear" }}
          />
        </svg>
        <span className="text-lg leading-none select-none">{emoji}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wider text-white/50 leading-none">Mood</span>
        <span className="text-xs font-semibold tabular-nums leading-tight">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}
