"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    labelJp: "ダッシュボード",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" stroke="currentColor" strokeWidth="1.2" />
        <rect x="10" y="1" width="7" height="4" stroke="currentColor" strokeWidth="1.2" />
        <rect x="10" y="7" width="7" height="10" stroke="currentColor" strokeWidth="1.2" />
        <rect x="1" y="10" width="7" height="7" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    href: "/campaigns/",
    label: "Campaigns",
    labelJp: "キャンペーン",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M6 1V17M12 1V17M1 6H17M1 12H17M1 1H17V17H1V1Z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    href: "/settings/",
    label: "Settings",
    labelJp: "設定",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 1V4M9 14V17M1 9H4M14 9H17" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => useStore.getState().toggleSidebar()}
        />
      )}

      <aside
        className={classNames(
          "fixed top-14 left-0 bottom-0 w-56 bg-cb-black border-r border-cb-border z-30",
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="py-6">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === ""
                : pathname.startsWith(item.href.replace(/\/$/, ""));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  "flex items-center gap-3 px-6 py-3 text-sm font-noto transition-all duration-200",
                  "border-l-2",
                  isActive
                    ? "text-cb-text border-cb-cyan bg-cb-cyan/5"
                    : "text-cb-sub border-transparent hover:text-cb-text hover:bg-cb-surface/50"
                )}
              >
                <span className={isActive ? "text-cb-cyan" : ""}>{item.icon}</span>
                <div>
                  <div className="font-chakra text-[11px] tracking-wider uppercase opacity-60">
                    {item.label}
                  </div>
                  <div className="text-xs mt-0.5">{item.labelJp}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Stats footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-cb-border">
          <div className="text-[10px] text-cb-sub font-chakra tracking-widest uppercase">
            LLMO Tool v1.0
          </div>
          <div className="text-[10px] text-cb-sub/50 mt-1 font-noto">
            AI検索最適化プラットフォーム
          </div>
        </div>
      </aside>
    </>
  );
}
