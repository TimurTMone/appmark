import Link from "next/link";

export const metadata = { title: "Arc · Privacy Policy" };

export default function Privacy() {
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-accent to-fuchsia-400 flex items-center justify-center text-black font-bold text-xs">A</div>
            <span className="font-semibold">Arc</span>
          </Link>
          <div className="text-xs text-white/50">Privacy Policy</div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12 prose prose-invert prose-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-white/50 text-xs mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-sm text-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">The short version</h2>
            <p>
              Arc runs pose-detection AI on your device. Your camera feed is <strong>never</strong>{" "}
              uploaded to any server. We do not sell your data. We do not build a profile on you.
              You are in control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">What the camera sees</h2>
            <p>
              When you grant camera access, Arc uses Google's MediaPipe pose model running entirely
              inside your browser or the app's WebView. The video frames are processed locally and
              discarded. Nothing is sent to our servers. Nothing is stored.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">What we store</h2>
            <p>Arc may store the following locally on your device (via your browser's storage):</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Your most recent session metrics (rep counts, scores, computed angles)</li>
              <li>Your preferences (voice on/off, sport selection)</li>
            </ul>
            <p className="mt-3">
              This data lives on your device only. Clearing your browser storage deletes all of it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">What we send to a server</h2>
            <p>
              When you tap <strong>Get AI analysis</strong> after a session, Arc sends the{" "}
              <em>numeric metrics only</em> (e.g. elbow angle, release arc, knee flexion) to our
              coaching endpoint which calls Anthropic's Claude API. No video, no images, no
              personally identifying information is ever sent. Claude returns a short coaching
              paragraph which we display and discard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Shadow Clinic (B2B)</h2>
            <p>
              If a physical therapy clinic invites you via a Shadow Clinic link, your session
              completion data (exercise type, rep count, timestamp) is sent to our backend so the
              clinic can see whether you completed your prescribed routine. Your camera feed is
              still processed on-device only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Children</h2>
            <p>
              Arc is not directed at children under 13. We do not knowingly collect information
              from children. If you believe a child has used Arc, contact us and we will delete
              any associated data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Not medical advice</h2>
            <p>
              Arc is a training aid, not a medical device. The form corrections and AI coaching
              feedback are educational only. Consult a qualified coach or medical professional for
              injury, diagnosis, or rehabilitation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
            <p>
              Questions or concerns: open an issue at{" "}
              <a href="https://github.com/TimurTMone/appmark" className="text-accent underline">
                github.com/TimurTMone/appmark
              </a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
