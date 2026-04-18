import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ToastContainer from "@/components/ui/Toast";

// Import globals.css from styles
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LLMO Tool — AI検索最適化プラットフォーム",
  description:
    "AI検索（ChatGPT、Perplexity、Gemini、AI Overview）で御社を推奨企業として表示させるLLMO自動対策ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600&family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cb-black text-cb-text font-noto antialiased">
        <Header />
        <Sidebar />
        <main className="pt-14 lg:pl-56 min-h-screen">
          <div className="p-6 lg:p-10">{children}</div>
        </main>
        <ToastContainer />
      </body>
    </html>
  );
}
