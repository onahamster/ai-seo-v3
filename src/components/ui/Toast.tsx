"use client";

import { useStore } from "@/lib/store";

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-in-right flex items-center gap-3 px-5 py-3 border text-sm font-noto ${
            toast.type === "success"
              ? "border-green-400/30 text-green-400 bg-green-400/5"
              : toast.type === "error"
              ? "border-red-400/30 text-red-400 bg-red-400/5"
              : "border-cb-cyan/30 text-cb-cyan bg-cb-cyan/5"
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
