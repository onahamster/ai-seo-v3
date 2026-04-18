"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const currentPhase = useStore((s) => s.currentPhase);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-cb-black border-b border-cb-border" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-cb-sub hover:text-cb-text transition-colors lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5H17M3 10H17M3 15H17"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-chakra text-sm tracking-widest text-cb-text">
              LLMO
            </span>
            <span className="text-cb-cyan font-chakra text-[10px] tracking-[0.3em] opacity-60">
              TOOL
            </span>
          </Link>
        </div>

        {currentPhase.phase !== "idle" && (
          <div className="flex items-center gap-3">
            <div className="w-32 h-1 bg-cb-surface overflow-hidden">
              <div
                className="h-full bg-cb-cyan transition-all duration-500"
                style={{ width: `${currentPhase.progress}%` }}
              />
            </div>
            <span className="text-[11px] text-cb-sub font-noto">
              {currentPhase.message}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Link
            href="/settings/"
            className="text-cb-sub hover:text-cb-text transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M14.55 11.25C14.4333 11.5166 14.3917 11.8083 14.4333 12.1C14.475 12.3916 14.6 12.6583 14.7917 12.875L14.8333 12.9167C14.988 13.0713 15.1107 13.2546 15.1944 13.4561C15.2781 13.6576 15.3212 13.8733 15.3212 14.0912C15.3212 14.3091 15.2781 14.5249 15.1944 14.7264C15.1107 14.9279 14.988 15.1112 14.8333 15.2658C14.6787 15.4205 14.4954 15.5432 14.2939 15.6269C14.0924 15.7106 13.8766 15.7537 13.6587 15.7537C13.4408 15.7537 13.225 15.7106 13.0236 15.6269C12.8221 15.5432 12.6388 15.4205 12.4842 15.2658L12.4425 15.2242C12.2258 15.0325 11.9591 14.9075 11.6675 14.8658C11.3758 14.8242 11.0841 14.8658 10.8175 14.9825C10.5558 15.0942 10.3325 15.2792 10.1742 15.5142C10.0158 15.7492 9.93 16.0242 9.92583 16.3075V16.4167C9.92583 16.8587 9.75028 17.2826 9.43772 17.5952C9.12516 17.9077 8.70124 18.0833 8.25917 18.0833C7.81709 18.0833 7.39317 17.9077 7.08061 17.5952C6.76806 17.2826 6.5925 16.8587 6.5925 16.4167V16.3583C6.58364 16.0679 6.48979 15.7867 6.32271 15.5499C6.15564 15.3131 5.92271 15.1312 5.65083 15.0258C5.38419 14.9092 5.09249 14.8675 4.80083 14.9092C4.50917 14.9508 4.24249 15.0758 4.02583 15.2675L3.98417 15.3092C3.82955 15.4638 3.64625 15.5865 3.44476 15.6702C3.24327 15.7539 3.02751 15.797 2.80961 15.797C2.5917 15.797 2.37594 15.7539 2.17445 15.6702C1.97296 15.5865 1.78966 15.4638 1.63504 15.3092C1.48041 15.1545 1.35771 14.9712 1.27399 14.7698C1.19028 14.5683 1.14722 14.3525 1.14722 14.1346C1.14722 13.9167 1.19028 13.7009 1.27399 13.4995C1.35771 13.298 1.48041 13.1147 1.63504 12.96L1.67671 12.9183C1.86837 12.7017 1.99338 12.435 2.03504 12.1433C2.07671 11.8517 2.03504 11.56 1.91838 11.2933C1.80671 11.0317 1.62171 10.8083 1.38671 10.65C1.15171 10.4917 0.876712 10.4058 0.593379 10.4017H0.484046C0.0419691 10.4017 -0.382024 10.2261 -0.694576 9.91357C-1.00713 9.60101 -1.18268 9.17709 -1.18268 8.73501C-1.18268 8.29294 -1.00713 7.86902 -0.694576 7.55646C-0.382024 7.2439 0.0419691 7.06835 0.484046 7.06835H0.542379C0.832796 7.05948 1.11396 6.96564 1.35079 6.79856C1.58762 6.63148 1.76952 6.39856 1.87504 6.12668"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="square"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
