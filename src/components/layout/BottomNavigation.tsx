"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * ボトムナビゲーション（5タブ）
 * タブ：ホーム / 診断 / Wish Map / SNS / マイページ
 * 親指で届きやすいように下部に固定
 */

// ─── アイコン定義 ──────────────────────────────────────────

// ホームアイコン
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 診断アイコン（星・魔法陣的なイメージ）
function DiagnosisIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.09 8.26L20.5 9L15.5 13.74L16.82 20.16L12 17L7.18 20.16L8.5 13.74L3.5 9L9.91 8.26L12 2Z"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "rgba(124,92,219,0.15)" : "none"}
      />
    </svg>
  );
}

// Wish Mapアイコン（地図・ピン）
function WishMapIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C12 21 4 14 4 9C4 6.79086 5.79086 5 8 5C9.37228 5 10.5766 5.72066 11.2929 6.79289C11.5985 6.31325 11.9997 5.89898 12.4721 5.57533M12 21C12 21 20 14 20 9C20 6.79086 18.2091 5 16 5C14.6277 5 13.4234 5.72066 12.7071 6.79289"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="9"
        r="2"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        fill={active ? "rgba(124,92,219,0.15)" : "none"}
      />
    </svg>
  );
}

// SNSアイコン（つながり・ネットワーク）
function SNSIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <circle
        cx="18"
        cy="5"
        r="3"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        fill={active ? "rgba(124,92,219,0.15)" : "none"}
      />
      <circle
        cx="6"
        cy="12"
        r="3"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        fill={active ? "rgba(124,92,219,0.15)" : "none"}
      />
      <circle
        cx="18"
        cy="19"
        r="3"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        fill={active ? "rgba(124,92,219,0.15)" : "none"}
      />
      <path
        d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// マイページアイコン（シーカー・人）
function MypageIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        fill={active ? "rgba(124,92,219,0.15)" : "none"}
      />
      <path
        d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
        stroke={active ? "#7C5CDB" : "#B0ACC8"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── タブ定義 ──────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: "/home",
    label: "ホーム",
    Icon: HomeIcon,
  },
  {
    href: "/diagnosis/menu",
    label: "診断",
    Icon: DiagnosisIcon,
  },
  {
    href: "/wishmap",
    label: "Wish",
    Icon: WishMapIcon,
  },
  {
    href: "/sns",
    label: "SNS",
    Icon: SNSIcon,
  },
  {
    href: "/mypage",
    label: "マイページ",
    Icon: MypageIcon,
  },
];

// ─── コンポーネント ────────────────────────────────────────

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {NAV_ITEMS.map((item) => {
          // 現在のページが該当タブかどうか判定
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 flex-1 py-1 no-tap-highlight"
            >
              <item.Icon active={isActive} />
              <span
                className="text-xs transition-colors"
                style={{
                  color: isActive ? "#7C5CDB" : "#B0ACC8",
                  fontWeight: isActive ? 600 : 400,
                }}
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
