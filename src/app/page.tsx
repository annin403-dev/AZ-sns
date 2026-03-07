import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SeekerPixelArt } from "@/components/pixel-art/SeekerPixelArt";

/**
 * ランディングページ
 * - ログイン済み → ホームへリダイレクト
 * - 未ログイン → 診断への入口を表示
 *
 * 世界観はまだ出しすぎず、診断で引き込むデザイン
 */
export default async function RootPage() {
  // Supabase未設定の場合はランディングをそのまま表示
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // オンボーディング完了チェック
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_done")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_done) {
        redirect("/home");
      } else {
        redirect("/onboarding");
      }
    }
  } catch {
    // Supabase未設定 or エラー時はランディングを表示
  }

  return (
    <div className="min-h-screen bg-az-bg flex flex-col">
      {/* ─── ヘッダー ─── */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="text-2xl font-bold tracking-tight" style={{ color: "#7C5CDB" }}>
          AZ
        </div>
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-2 rounded-xl"
          style={{ color: "#7B78A0" }}
        >
          ログイン
        </Link>
      </header>

      {/* ─── メインコンテンツ ─── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-12">

        {/* メインキャラクター（上を見上げる人・星）*/}
        <div className="mb-8 animate-fade-in">
          <SeekerPixelArt scale={1.5} />
        </div>

        {/* キャッチコピー */}
        <div className="text-center mb-3 animate-slide-up">
          <p className="text-sm font-medium mb-2" style={{ color: "#7B78A0" }}>
            2分でわかる
          </p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "#1C1A2E" }}>
            自分の
            <span style={{ color: "#7C5CDB" }}>取扱説明書</span>
            を<br />作ろう
          </h1>
        </div>

        {/* サブテキスト */}
        <p
          className="text-center text-base leading-relaxed mb-10 animate-slide-up"
          style={{ color: "#7B78A0", maxWidth: "280px" }}
        >
          15の質問に直感で答えるだけで、あなたの「勝ちパターン」と「心のエンジン」が見えてくる
        </p>

        {/* CTAボタン */}
        <div className="w-full max-w-xs animate-slide-up">
          <Link href="/diagnosis" className="btn-primary block text-center no-tap-highlight">
            診断スタート →
          </Link>
          <p className="text-center text-xs mt-3" style={{ color: "#B0ACC8" }}>
            登録なしでできます
          </p>
        </div>

        {/* 特徴ポイント */}
        <div className="mt-10 w-full max-w-xs space-y-3 animate-fade-in">
          {[
            { icon: "⏱", text: "約5分・16問の本格診断" },
            { icon: "🔮", text: "40パターンから判定" },
            { icon: "📖", text: "自分の取扱説明書が作れる" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "#F3F1FC" }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium" style={{ color: "#1C1A2E" }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* ─── フッター ─── */}
      <footer className="text-center pb-8">
        <p className="text-xs" style={{ color: "#B0ACC8" }}>
          すでにアカウントをお持ちの方は
          <Link href="/login" className="ml-1 underline" style={{ color: "#7C5CDB" }}>
            ログイン
          </Link>
        </p>
      </footer>
    </div>
  );
}

