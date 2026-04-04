import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PoseAI Coach — Race your best self",
  description:
    "Real-time AI body tracking fitness coach in your browser. On-device pose AI, voice coaching, ghost-rep replay.",
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
