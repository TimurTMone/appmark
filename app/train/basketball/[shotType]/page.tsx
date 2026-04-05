import { notFound } from "next/navigation";
import ShotCapture from "@/components/sports/basketball/ShotCapture";
import { getShotConfig } from "@/lib/sports/basketball/shotTypes";

export default function ShootPage({ params }: { params: { shotType: string } }) {
  const config = getShotConfig(params.shotType);
  if (!config) notFound();
  return <ShotCapture config={config} />;
}
