// ============================================
// ユーティリティ関数
// ============================================

export function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  return formatDateShort(dateStr);
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-cb-cyan";
  if (score >= 40) return "text-yellow-400";
  if (score >= 20) return "text-orange-400";
  return "text-red-400";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-400";
  if (score >= 60) return "bg-cb-cyan";
  if (score >= 40) return "bg-yellow-400";
  if (score >= 20) return "bg-orange-400";
  return "bg-red-400";
}

export function getPlatformColor(platform: string): string {
  switch (platform) {
    case "chatgpt":
      return "#10a37f";
    case "perplexity":
      return "#20b8cd";
    case "gemini":
    case "google_gemini":
      return "#8e75b2";
    case "google_aio":
      return "#4285f4";
    default:
      return "#86868b";
  }
}

export function getPlatformName(platform: string): string {
  switch (platform) {
    case "chatgpt":
      return "ChatGPT";
    case "perplexity":
      return "Perplexity";
    case "gemini":
    case "google_gemini":
      return "Gemini";
    case "google_aio":
      return "AI Overview";
    default:
      return platform;
  }
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case "positive":
      return "text-green-400";
    case "negative":
      return "text-red-400";
    default:
      return "text-cb-sub";
  }
}

export function calculateOverallScore(scores: { score: number }[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseJsonSafe<T>(str: string, fallback: T): T {
  try {
    const cleaned = str.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~1.5 tokens per character for Japanese, ~0.75 for English
  const japaneseChars = (text.match(/[\u3000-\u9fff\uff00-\uffef]/g) || []).length;
  const otherChars = text.length - japaneseChars;
  return Math.ceil(japaneseChars * 1.5 + otherChars * 0.75);
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}
