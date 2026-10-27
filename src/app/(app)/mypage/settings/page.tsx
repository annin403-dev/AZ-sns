import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import SettingsForm from "@/components/features/SettingsForm";

/**
 * 設定
 * - 表示名・ひとこと紹介の変更
 * - 診断のやり直し
 * - ログアウト
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await table(supabase, "profiles")
    .select("display_name, username, bio")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <Link href="/mypage" className="text-sm no-tap-highlight" style={{ color: "#7B78A0" }}>
          ← マイページ
        </Link>
        <h1 className="text-xl font-bold mt-2" style={{ color: "#1C1A2E" }}>
          ⚙️ 設定
        </h1>
      </header>

      <main className="px-5 space-y-4">
        <SettingsForm
          email={user.email ?? ""}
          username={profile?.username ?? ""}
          displayName={profile?.display_name ?? ""}
          bio={profile?.bio ?? ""}
        />

        <div className="card">
          <p className="text-sm font-bold mb-3" style={{ color: "#1C1A2E" }}>
            診断をやり直す
          </p>
          <div className="space-y-2">
            {[
              { href: "/diagnosis", label: "✨ AZタイプ診断" },
              { href: "/brake", label: "🧠 ブレーキ診断" },
              { href: "/onboarding", label: "📖 深掘り診断（取扱説明書）" },
              { href: "/roadmap?new=1", label: "🗺 90日ロードマップを作り直す" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-sm no-tap-highlight"
                style={{ background: "#F8F7FF", color: "#1C1A2E" }}
              >
                {item.label}
                <span style={{ color: "#B0ACC8" }}>›</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
