import Link from "next/link";

export const metadata = { title: "Shadow Clinic — Pricing" };

export default function ClinicPricing() {
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center text-black font-bold text-xs">S</div>
            <span className="font-semibold">Shadow Clinic</span>
          </Link>
          <Link href="/clinic" className="text-sm text-white/60 hover:text-white">Open dashboard →</Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 mb-6">
            For independent PT & rehab clinics
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-5">
            Only <span className="text-accent">35%</span> of your patients do their home exercises.
            <br />Change that.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Shadow Clinic sends your patients a link. They do their routine in their browser — no
            app, no sensors. Our pose AI counts reps and checks form. You get a weekly adherence
            dashboard. Patients get better faster. You get the outcomes data to prove it.
          </p>
        </div>

        {/* how it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-16">
          {[
            { n: "1", title: "Create a patient", body: "Name them, pick 3–5 exercises from the library, set rep targets." },
            { n: "2", title: "Share the link", body: "They open it on any phone. No install, no login, no friction." },
            { n: "3", title: "Track adherence", body: "See who trained this week, streaks, red flags. Call the ones who need you." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="h-8 w-8 rounded-full bg-accent text-black font-bold flex items-center justify-center mb-4">{s.n}</div>
              <h3 className="text-lg font-semibold mb-1.5">{s.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Pilot</div>
            <div className="text-3xl font-bold mb-1">Free</div>
            <div className="text-xs text-white/60 mb-4">first 90 days · no card</div>
            <ul className="text-sm text-white/70 space-y-2 mb-6">
              <li>✓ Up to 25 patients</li>
              <li>✓ Adherence dashboard</li>
              <li>✓ Pose AI form check</li>
              <li>✓ Email support</li>
            </ul>
            <Link href="/clinic" className="block text-center rounded-full bg-white/10 border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/15 transition-colors">
              Start pilot
            </Link>
          </div>

          <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/10 to-fuchsia-500/10 p-6 relative md:-my-2">
            <div className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-accent text-black">Popular</div>
            <div className="text-xs uppercase tracking-wider text-white/70 mb-2">Clinic</div>
            <div className="text-3xl font-bold mb-1">$49<span className="text-base text-white/60 font-normal">/clinic/mo</span></div>
            <div className="text-xs text-white/60 mb-4">billed monthly · cancel anytime</div>
            <ul className="text-sm text-white/80 space-y-2 mb-6">
              <li>✓ Unlimited patients</li>
              <li>✓ Adherence + outcomes reports</li>
              <li>✓ Form score trends per patient</li>
              <li>✓ Branded patient links</li>
              <li>✓ Priority support</li>
            </ul>
            <Link href="/clinic" className="block text-center rounded-full bg-accent text-black font-semibold px-4 py-2.5 text-sm hover:bg-accent/90 transition-colors">
              Try it (pilot first)
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Enterprise</div>
            <div className="text-3xl font-bold mb-1">Custom</div>
            <div className="text-xs text-white/60 mb-4">multi-location + EHR</div>
            <ul className="text-sm text-white/70 space-y-2 mb-6">
              <li>✓ SSO / HIPAA BAA</li>
              <li>✓ Jane App / Prompt sync</li>
              <li>✓ Custom exercise library</li>
              <li>✓ Dedicated CSM</li>
            </ul>
            <a href="mailto:hello@shadow.app" className="block text-center rounded-full bg-white/10 border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/15 transition-colors">
              Talk to sales
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-3 max-w-3xl">
          {[
            { q: "Does it work on any phone?", a: "Yes — any modern browser with a camera. iPhone, Android, laptop. No install." },
            { q: "What about HIPAA?", a: "Video never leaves the patient's device. We store rep counts and timestamps only. BAA available on Enterprise." },
            { q: "Does it replace my EHR?", a: "No. It's an add-on. We'll integrate with Jane App and Prompt for Enterprise customers." },
            { q: "How accurate is the form check?", a: "MediaPipe's pose model runs at 30+ FPS on-device with 95%+ landmark accuracy. Good enough for adherence and obvious form faults — not a replacement for your eye in clinic." },
          ].map((f) => (
            <div key={f.q} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="font-semibold text-sm mb-1">{f.q}</div>
              <div className="text-sm text-white/60">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 pb-10 pt-6 text-center text-white/40 text-xs border-t border-white/5">
        Shadow Clinic · Built on Shadow's pose AI engine
      </footer>
    </main>
  );
}
