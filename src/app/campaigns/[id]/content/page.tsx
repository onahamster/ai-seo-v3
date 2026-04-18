import ContentClient from "./ContentClient";

export function generateStaticParams() {
  return [{ id: "__dynamic__" }];
}

export default function ContentPage() {
  return <ContentClient />;
}
