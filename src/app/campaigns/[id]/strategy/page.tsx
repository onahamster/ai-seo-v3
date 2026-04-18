import StrategyClient from "./StrategyClient";

export function generateStaticParams() {
  return [{ id: "__dynamic__" }];
}

export default function StrategyPage() {
  return <StrategyClient />;
}
