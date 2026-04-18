"use client";

import { useStore } from "@/lib/store";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const addToast = useStore((s) => s.addToast);

  const handleSave = () => {
    addToast("設定を保存しました", "success");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-noto font-light text-cb-text">Settings</h1>
        <p className="text-xs text-cb-sub mt-1 font-noto">APIキーと外部連携の設定</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-xs text-cb-sub tracking-wider uppercase font-noto">LLM APIs</h2>
          <div className="space-y-2">
            <label className="block text-xs text-cb-sub tracking-wider uppercase font-noto">Gemini API Key</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-cb-surface border border-cb-border text-sm text-cb-sub font-noto">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Cloudflare Environment Variables によって管理されています
            </div>
            <p className="text-[10px] text-cb-sub/60 font-noto">※ Cloudflare Pages の管理画面で設定されたキーが使用されます。アプリ内での入力は不要です。</p>
          </div>
          <Input
            label="OpenAI API Key (Optional)"
            type="password"
            value={settings.openai_api_key}
            onChange={(e) => setSettings({ openai_api_key: e.target.value })}
            placeholder="ChatGPTのモニタリングに使用します"
          />
          <Input
            label="Perplexity API Key (Optional)"
            type="password"
            value={settings.perplexity_api_key}
            onChange={(e) => setSettings({ perplexity_api_key: e.target.value })}
            placeholder="Perplexityのモニタリングに使用します"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs text-cb-sub tracking-wider uppercase font-noto">Search APIs</h2>
          <Input
            label="Serper.dev API Key"
            type="password"
            value={settings.serper_api_key}
            onChange={(e) => setSettings({ serper_api_key: e.target.value })}
            placeholder="Google検索結果とAI Overviewの分析に使用します"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs text-cb-sub tracking-wider uppercase font-noto">WordPress Integration</h2>
          <Input
            label="WordPress URL"
            value={settings.wordpress_url}
            onChange={(e) => setSettings({ wordpress_url: e.target.value })}
            placeholder="https://your-blog.com"
          />
          <Input
            label="Username"
            value={settings.wordpress_username}
            onChange={(e) => setSettings({ wordpress_username: e.target.value })}
          />
          <Input
            label="App Password"
            type="password"
            value={settings.wordpress_app_password}
            onChange={(e) => setSettings({ wordpress_app_password: e.target.value })}
            placeholder="WordPressの管理画面で発行したアプリケーションパスワード"
          />
        </section>

        <div className="pt-4">
          <Button variant="primary" onClick={handleSave} className="w-full">
            設定を保存
          </Button>
        </div>
      </div>
    </div>
  );
}
