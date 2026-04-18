import DistributeClient from "./DistributeClient";

export function generateStaticParams() {
  return [{ id: "__dynamic__" }];
}

export default function DistributePage() {
  return <DistributeClient />;
}
