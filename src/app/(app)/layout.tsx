import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNavigation from "@/components/layout/BottomNavigation";
import StuckButton from "@/components/features/StuckButton";

/**
 * アプリメインレイアウト
 *
 * 認証必須のページすべてに適用される共通レイアウト
 * - ボトムナビゲーション（5タブ）
 * - 詰まりボタン（右下に常時表示）
 * - ページ下部のパディング（ボトムナビの高さ分）
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className="min-h-screen"
      // ボトムナビ＋iPhoneのホームバー分の余白（ページ末尾がナビに隠れないように）
      style={{ background: "#FAF9FF", paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
    >
      {/* メインコンテンツ */}
      <main>{children}</main>

      {/* 詰まりボタン（右下固定・全ページ共通） */}
      <StuckButton />

      {/* ボトムナビゲーション（5タブ） */}
      <BottomNavigation />
    </div>
  );
}
