import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { JOB_TYPE_INFO, AURA_INFO } from "@/lib/diagnosis/types-data";
import type { JobType, AuraType } from "@/lib/diagnosis/questions";

/**
 * 診断メニューページ
 *
 * AZタイプ診断の結果確認・深掘り診断への導線
 * - AZタイプ診断（結果表示 or 診断へ）
 * - 深掘り診断 6カード
 * - AI会話用プロンプト
 */
export default async function DiagnosisMenuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("job_type, aura_type, luck_lv")
    .eq("id", user.id)
    .single();

  const { data: azProfile } = await supabase
    .from("az_profiles")
    .select("type_key, self_definition")
    .eq("user_id", user.id)
    .maybeSingle();

  const jobType = profile?.job_type as JobType | null;
  const auraType = profile?.aura_type as AuraType | null;
  const jobInfo = jobType ? JOB_TYPE_INFO[jobType] : null;
  const auraInfo = auraType ? AURA_INFO[auraType] : null;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
          診断
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          自己理解の入口
        </p>
      </header>

      <main className="px-5 space-y-4">

        {/* ─── AZタイプ診断 ─── */}
        {jobType && auraInfo && jobInfo ? (
          // 診断済み
          <div
            className="rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, ${auraInfo.colorLight}, #FFFFFF)`,
              border: `1.5px solid ${auraInfo.color}40`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: auraInfo.color }}>
                  あなたのAZタイプ
                </p>
                <p className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
                  {jobInfo.emoji} {jobInfo.nameJa}
                  <span className="text-sm font-normal ml-2" style={{ color: auraInfo.color }}>
                    × {auraInfo.emoji} {auraType}
                  </span>
                </p>
              </div>
              <Link
                href="/diagnosis"
                className="text-xs px-3 py-1.5 rounded-lg no-tap-highlight"
                style={{ background: "#FFFFFF", color: "#7B78A0" }}
              >
                再診断
              </Link>
            </div>
          </div>
        ) : (
          // 未診断
          <Link href="/diagnosis" className="block">
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, #F3F1FC, #EDE9F9)",
                border: "1.5px solid #C8BEF0",
              }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "#7C5CDB" }}>
                ✨ AZタイプ診断
              </p>
              <p className="text-lg font-bold mb-2" style={{ color: "#1C1A2E" }}>
                まだ診断を受けていません
              </p>
              <p className="text-sm" style={{ color: "#7C5CDB" }}>
                12問で自分のタイプとオーラがわかる →
              </p>
            </div>
          </Link>
        )}

        {/* ─── 深掘り診断 ─── */}
        <div className="card">
          <h2 className="text-base font-bold mb-3" style={{ color: "#1C1A2E" }}>
            深掘り診断
          </h2>
          <p className="text-sm mb-4" style={{ color: "#7B78A0" }}>
            6つのカードで「自分の取扱説明書」を完成させよう
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "A", title: "エネルギー棚卸し", emoji: "⚡", done: !!azProfile },
              { id: "B", title: "得意の正体", emoji: "✨", done: !!azProfile },
              { id: "C", title: "苦手の正体", emoji: "🌪", done: !!azProfile },
              { id: "D", title: "やる気の燃料", emoji: "🔥", done: !!azProfile },
              { id: "E", title: "勝てる環境", emoji: "🏆", done: !!azProfile },
              { id: "F", title: "自己定義", emoji: "📖", done: !!azProfile },
            ].map((card) => (
              <div
                key={card.id}
                className="rounded-xl p-3"
                style={{
                  background: card.done ? "#F0EAFC" : "#F8F7FF",
                  border: `1.5px solid ${card.done ? "#C8BEF0" : "#E8E4F8"}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{card.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: "#7C5CDB" }}>
                    {card.id}
                  </span>
                  {card.done && (
                    <span className="text-xs ml-auto" style={{ color: "#38C074" }}>
                      ✅
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium" style={{ color: "#1C1A2E" }}>
                  {card.title}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/onboarding"
            className="btn-primary block text-center mt-4 no-tap-highlight"
          >
            {azProfile ? "見直す" : "はじめる →"}
          </Link>
        </div>

        {/* ─── AI会話用プロンプト ─── */}
        <div className="card">
          <h2 className="text-base font-bold mb-2" style={{ color: "#1C1A2E" }}>
            🤖 AI会話用プロンプト
          </h2>
          <p className="text-sm mb-3" style={{ color: "#7B78A0" }}>
            ChatGPTやClaudeに「自分のことを理解してもらう」ためのプロンプトを生成
          </p>
          {azProfile ? (
            <Link
              href="/mypage/prompt"
              className="btn-secondary block text-center no-tap-highlight"
            >
              プロンプトを見る
            </Link>
          ) : (
            <div
              className="rounded-xl py-4 text-center"
              style={{ background: "#F3F1FC" }}
            >
              <p className="text-xs" style={{ color: "#B0ACC8" }}>
                深掘り診断を完了するとプロンプトが生成されます
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
