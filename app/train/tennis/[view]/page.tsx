import { notFound } from "next/navigation";
import ServeCapture from "@/components/sports/tennis/ServeCapture";
import { getServeConfig } from "@/lib/sports/tennis/serveTypes";

export default function ServePage({ params }: { params: { view: string } }) {
  const config = getServeConfig(params.view);
  if (!config) notFound();
  return <ServeCapture config={config} />;
}
