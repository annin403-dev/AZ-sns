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
      style={{ background: "#FAF9FF", paddingBottom: "80px" }}
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
