import { notFound } from "next/navigation";
import SwingCapture from "@/components/sports/golf/SwingCapture";
import { getSwingConfig } from "@/lib/sports/golf/swingTypes";

export default function GolfSwingPage({ params }: { params: { view: string } }) {
  const config = getSwingConfig(params.view);
  if (!config || params.view !== "face-on") notFound();
  return <SwingCapture config={config} />;
}
