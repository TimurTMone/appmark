import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arc — AI form coach",
    short_name: "Arc",
    description:
      "On-device pose AI for basketball, golf, tennis. Research-calibrated biomechanics, sub-200ms voice coaching.",
    start_url: "/train",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#00ffa3",
    categories: ["sports", "fitness", "health"],
    icons: [
      { src: "/icon0", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon1", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon0", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
  };
}
