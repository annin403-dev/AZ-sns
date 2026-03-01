import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNavigation from "@/components/layout/BottomNavigation";
import StuckButton from "@/components/features/StuckButton";

/**
 * アプリメインレイアウト
 * ボトムナビゲーション＋常時表示の詰まりボタンを含む
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
    <div className="min-h-screen bg-az-bg pb-20">
      {/* メインコンテンツ */}
      <main>{children}</main>

      {/* 詰まりボタン（常時表示・右下固定） */}
      <StuckButton />

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </div>
  );
}
