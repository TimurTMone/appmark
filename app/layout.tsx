import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arc — AI form coach for basketball, golf, tennis",
  description:
    "On-device pose AI. Research-calibrated biomechanics. Voice coaching in under 200ms. Basketball (free throw, jump shot, three), golf (face-on swing), tennis (serve kinetic chain). One engine, tuned per sport.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans no-tap-highlight bg-black text-white">{children}</body>
    </html>
  );
}
