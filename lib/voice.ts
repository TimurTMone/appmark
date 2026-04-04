// Minimal voice coach using the browser's Web Speech API.
// Throttled so we don't overlap utterances.

let lastSpoken = 0;

export function speak(text: string, minGapMs = 900) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  const now = Date.now();
  if (now - lastSpoken < minGapMs) return;
  lastSpoken = now;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  u.pitch = 1.0;
  u.volume = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
