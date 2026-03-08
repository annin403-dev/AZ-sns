import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { JOB_TYPE_INFO, AURA_INFO } from "@/lib/diagnosis/types-data";
import type { JobType, AuraType } from "@/lib/diagnosis/questions";

/**
 * マイページ
 *
 * 現在地と取扱説明書を見る場所
 * - シーカーのビット絵
 * - 名前・職業タイプ・オーラ
 * - Luck Lv
 * - 推進剤マップ・停止装置マップ・勝てる条件
 * - バッジ
 * - 設定
 */
export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: azProfile } = await supabase
    .from("az_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: badges } = await supabase
    .from("badges")
    .select("*")
    .eq("user_id", user.id)
    .order("awarded_at", { ascending: false });

  const displayName = profile?.display_name || "あなた";
  const jobType = profile?.job_type as JobType | null;
  const auraType = profile?.aura_type as AuraType | null;
  const luckLv = profile?.luck_lv || 1;
  const luckXp = profile?.luck_xp || 0;

  const jobInfo = jobType ? JOB_TYPE_INFO[jobType] : null;
  const auraInfo = auraType ? AURA_INFO[auraType] : null;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
            マイページ
          </h1>
          <Link
            href="/mypage/settings"
            className="p-2 rounded-xl no-tap-highlight"
            style={{ color: "#7B78A0" }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </header>

      <main className="px-5 space-y-4">

        {/* ─── プロフィールカード ─── */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: auraInfo
              ? `linear-gradient(135deg, ${auraInfo.colorLight}, #FFFFFF)`
              : "linear-gradient(135deg, #F3F1FC, #FFFFFF)",
            border: `1.5px solid ${auraInfo ? auraInfo.color + "30" : "#E8E4F8"}`,
          }}
        >
          <div className="flex items-start gap-4">
            {/* シーカーのビット絵（小） */}
            <MiniSeekerPixelArt auraColor={auraInfo?.color} />

            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
                {displayName}
              </h2>
              {jobInfo && auraInfo ? (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: auraInfo.colorLight,
                      color: auraInfo.color,
                    }}
                  >
                    {auraInfo.emoji} {auraType}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "#EDE9F9", color: "#7C5CDB" }}
                  >
                    {jobInfo.emoji} {jobInfo.nameJa}
                  </span>
                </div>
              ) : (
                <Link
                  href="/diagnosis"
                  className="text-sm mt-1 no-tap-highlight"
                  style={{ color: "#7C5CDB" }}
                >
                  診断を受けてタイプを確認 →
                </Link>
              )}

              {/* Luck Lv */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm">⭐</span>
                <span className="text-sm font-bold" style={{ color: "#F5A623" }}>
                  Luck Lv.{luckLv}
                </span>
                <span className="text-xs" style={{ color: "#7B78A0" }}>
                  ({luckXp} XP)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 取扱説明書 ─── */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: "#1C1A2E" }}>
              📖 取扱説明書
            </h2>
            {!azProfile?.propellant_map && (
              <Link
                href="/onboarding"
                className="text-xs font-medium px-3 py-1 rounded-lg no-tap-highlight"
                style={{ color: "#7C5CDB", background: "#EDE9F9" }}
              >
                深掘り診断へ
              </Link>
            )}
          </div>

          {azProfile ? (
            <div className="space-y-3">
              {/* 推進剤マップ */}
              <ManualSection
                title="⚡ 推進剤（動くエネルギー源）"
                data={azProfile.propellant_map}
                color="#F5A623"
                colorLight="#FEF5E4"
              />
              {/* 停止装置マップ */}
              <ManualSection
                title="🛑 停止装置（止まるトリガー）"
                data={azProfile.blocker_map}
                color="#F05252"
                colorLight="#FEE8E8"
              />
              {/* 勝てる条件 */}
              <ManualSection
                title="🏆 勝てる条件"
                data={azProfile.winning_condition}
                color="#38C074"
                colorLight="#E8F9EF"
              />
              {/* 自己定義 */}
              {azProfile.self_definition && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: "#F3F1FC", border: "1px solid #C8BEF0" }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: "#7C5CDB" }}>
                    自己定義
                  </p>
                  <p className="text-sm" style={{ color: "#1C1A2E" }}>
                    「{azProfile.self_definition}」
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="rounded-xl py-6 text-center"
              style={{ background: "#F3F1FC" }}
            >
              <p className="text-sm" style={{ color: "#7B78A0" }}>
                深掘り診断を受けると
                <br />
                取扱説明書が完成します
              </p>
              <Link
                href="/onboarding"
                className="inline-block mt-3 text-sm font-medium no-tap-highlight"
                style={{ color: "#7C5CDB" }}
              >
                深掘り診断をはじめる →
              </Link>
            </div>
          )}
        </div>

        {/* ─── バッジ ─── */}
        {badges && badges.length > 0 && (
          <div className="card">
            <h2 className="text-base font-bold mb-3" style={{ color: "#1C1A2E" }}>
              🏅 バッジ
            </h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "#FEF5E4", color: "#F5A623" }}
                >
                  {badge.badge_name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── メニューリスト ─── */}
        <div className="card">
          {[
            { href: "/diagnosis/menu", icon: "⭐", label: "診断メニュー" },
            { href: "/mypage/history", icon: "📊", label: "記録・履歴" },
            { href: "/mypage/prompt", icon: "🤖", label: "AI会話用プロンプト" },
            { href: "/mypage/settings", icon: "⚙️", label: "設定" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 py-3 border-b last:border-b-0 no-tap-highlight"
              style={{ borderColor: "#F3F1FC" }}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span className="flex-1 text-sm font-medium" style={{ color: "#1C1A2E" }}>
                {item.label}
              </span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="#B0ACC8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── 取扱説明書セクション ────────────────────────────────────

function ManualSection({
  title,
  data,
  color,
  colorLight,
}: {
  title: string;
  data: Record<string, unknown> | null;
  color: string;
  colorLight: string;
}) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="rounded-xl p-3" style={{ background: colorLight }}>
      <p className="text-xs font-medium mb-2" style={{ color }}>
        {title}
      </p>
      {/* JSONB形式のデータを表示 */}
      {Array.isArray(data.items) ? (
        <ul className="space-y-1">
          {(data.items as string[]).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-xs mt-0.5" style={{ color }}>•</span>
              <span className="text-sm" style={{ color: "#1C1A2E" }}>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm" style={{ color: "#1C1A2E" }}>
          {String(data.summary || "")}
        </p>
      )}
    </div>
  );
}

// ─── ミニシーカーのビット絵 ──────────────────────────────────

function MiniSeekerPixelArt({ auraColor }: { auraColor?: string }) {
  const color = auraColor || "#9060E0";
  const px = 5;

  // シンプルな5×7のビット絵
  const pixels = [
    [0, 1, 1, 1, 0],
    [0, 2, 2, 2, 0],
    [0, 2, 3, 2, 0],
    [0, 2, 2, 2, 0],
    [0, 4, 4, 4, 0],
    [4, 4, 0, 4, 4],
    [0, 4, 0, 4, 0],
  ];

  const colorMap: Record<number, string> = {
    1: color,
    2: "#FDDBB0",
    3: "#3A3A5C",
    4: color + "90",
  };

  return (
    <div style={{ imageRendering: "pixelated" }}>
      <svg
        width={px * 5}
        height={px * 7}
        viewBox={`0 0 ${px * 5} ${px * 7}`}
        style={{ imageRendering: "pixelated" }}
      >
        {pixels.map((row, y) =>
          row.map((cell, x) => {
            if (cell === 0) return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x * px}
                y={y * px}
                width={px}
                height={px}
                fill={colorMap[cell]}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
