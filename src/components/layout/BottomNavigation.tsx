"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** ナビゲーションアイテム */
const NAV_ITEMS = [
  {
    href: "/home",
    label: "ホーム",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-az-gold" : "text-az-subtle"}`}
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "探す",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-az-aurora" : "text-az-subtle"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    href: "/post/new",
    label: "投稿",
    icon: () => (
      <div className="w-12 h-12 rounded-full bg-az-glow flex items-center justify-center
                      -mt-3 shadow-lg transition-transform hover:scale-105 active:scale-95"
           style={{ boxShadow: "0 0 20px rgba(96, 96, 240, 0.5)" }}>
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    ),
  },
  {
    href: "/profile",
    label: "自分",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-az-mystic" : "text-az-subtle"}`}
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    href: "/coach",
    label: "AZコーチ",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-az-glow" : "text-az-subtle"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
  },
];

/**
 * ボトムナビゲーション（5タブ）
 */
export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-0 flex-1 py-1"
            >
              {item.icon(isActive)}
              <span
                className={`text-xs transition-colors ${
                  isActive ? "text-az-gold font-medium" : "text-az-subtle"
                } ${item.label === "投稿" ? "sr-only" : ""}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
