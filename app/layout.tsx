import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shadow — AI Boxing Coach in Your Browser",
  description:
    "Shadow box with an AI in your corner. Jab, cross, hook, uppercut detected live from your webcam. Combo caller, mood ring, pushups, squats. No install.",
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
