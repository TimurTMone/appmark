import { notFound } from "next/navigation";
import ShotCapture from "@/components/sports/basketball/ShotCapture";

const SHOT_TYPES: Record<string, string> = {
  "free-throw": "Free Throw",
  "jump-shot": "Jump Shot",
  "three-point": "Three",
};

export default function ShootPage({ params }: { params: { shotType: string } }) {
  const label = SHOT_TYPES[params.shotType];
  if (!label) notFound();
  // For MVP only free-throw is live; the others are routed to 404 by the picker.
  return <ShotCapture shotType={params.shotType} shotTypeLabel={label} />;
}
