import MonitorClient from "./MonitorClient";

export function generateStaticParams() {
  return [{ id: "__dynamic__" }];
}

export default function MonitorPage() {
  return <MonitorClient />;
}
