import CampaignDetailClient from "./CampaignDetailClient";

export function generateStaticParams() {
  return [{ id: "__dynamic__" }];
}

export default function CampaignDetailPage() {
  return <CampaignDetailClient />;
}
