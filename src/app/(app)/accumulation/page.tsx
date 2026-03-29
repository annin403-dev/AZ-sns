import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AccumulationCalendar from "./AccumulationCalendar";

/**
 * 積み上げトラッカーページ（積み上げ王 Type 02）
 *
 * 「地味に見えて、気づけば誰より遠くにいる」
 * - 連続記録ストリーク
 * - 30日カレンダーヒートマップ
 * - カテゴリ別累計時間
 * - 最近の記録一覧
 * - 「ここまで来た」振り返りスタッツ
 */
export default async function AccumulationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // 全記録（最新100件）
  const { data: records } = await supabase
    .from("accumulation_records")
    .select("*")
    .eq("user_id", user.id)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  // 今日の記録があるか
  const todayRecords =
    records?.filter((r) => r.record_date === today) || [];

  // 最近30日
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const recentRecords =
    records?.filter((r) => r.record_date >= thirtyDaysAgoStr) || [];

  // 連続日数を計算
  const streak = calcStreak(records || []);

  // 総累計分数
  const totalMinutes = records?.reduce((s, r) => s + (r.minutes_spent || 0), 0) || 0;

  // 総記録日数（ユニーク日）
  const uniqueDays = new Set(records?.map((r) => r.record_date)).size;

  // カテゴリ別累計
  const categoryTotals = calcCategoryTotals(records || []);

  // 最近7件
  const recent7 = records?.slice(0, 7) || [];

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider mb-1" style={{ color: "#2E7D32" }}>
              TYPE 02 · 積み上げ王
            </p>
            <h1 className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
              積み上げ記録
            </h1>
          </div>
          <Link
            href="/accumulation/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-semibold text-sm no-tap-highlight"
            style={{
              background: "linear-gradient(135deg, #2E7D32, #43A047)",
              color: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(46,125,50,0.30)",
            }}
          >
            <span className="text-base leading-none">+</span>
            <span>記録する</span>
          </Link>
        </div>
      </header>

      <main className="px-5 space-y-4">

        {/* ─── ストリーク & メインスタッツ ─── */}
        <StreakCard streak={streak} uniqueDays={uniqueDays} totalMinutes={totalMinutes} hasTodayRecord={todayRecords.length > 0} />

        {/* ─── カレンダーヒートマップ ─── */}
        <div className="card">
          <h2 className="text-sm font-bold mb-3" style={{ color: "#1C1A2E" }}>
            過去30日の積み上げ
          </h2>
          <AccumulationCalendar records={recentRecords} />
        </div>

        {/* ─── カテゴリ別 ─── */}
        {Object.keys(categoryTotals).length > 0 && (
          <CategoryCard totals={categoryTotals} totalMinutes={totalMinutes} />
        )}

        {/* ─── 「ここまで来た」振り返り ─── */}
        <ReflectionCard uniqueDays={uniqueDays} totalMinutes={totalMinutes} streak={streak} />

        {/* ─── 最近の記録 ─── */}
        <RecentRecordsCard records={recent7} />

        {/* ─── 空状態 ─── */}
        {records?.length === 0 && (
          <EmptyState />
        )}

      </main>
    </div>
  );
}

// ─── ストリークカード ────────────────────────────────────────

function StreakCard({
  streak,
  uniqueDays,
  totalMinutes,
  hasTodayRecord,
}: {
  streak: number;
  uniqueDays: number;
  totalMinutes: number;
  hasTodayRecord: boolean;
}) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, #E8F5E9, #F1F8E9)",
        border: "1.5px solid #A5D6A7",
      }}
    >
      {/* ストリーク中央 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold mb-0.5" style={{ color: "#2E7D32" }}>
            連続積み上げ
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black" style={{ color: "#1B5E20" }}>
              {streak}
            </span>
            <span className="text-lg font-bold mb-1" style={{ color: "#2E7D32" }}>
              日
            </span>
            <span className="text-2xl mb-0.5">
              {streak >= 30 ? "🔥🔥🔥" : streak >= 14 ? "🔥🔥" : streak >= 7 ? "🔥" : streak >= 1 ? "⚡" : "💤"}
            </span>
          </div>
        </div>
        {/* 今日の状態バッジ */}
        <div
          className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={
            hasTodayRecord
              ? { background: "#2E7D32", color: "#FFFFFF" }
              : { background: "#FFF3E0", color: "#E65100", border: "1.5px solid #FFCC80" }
          }
        >
          {hasTodayRecord ? "✓ 今日も記録済み" : "今日はまだ"}
        </div>
      </div>

      {/* ミニスタッツ */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.7)" }}
        >
          <p className="text-xs font-medium mb-0.5" style={{ color: "#558B2F" }}>
            総記録日数
          </p>
          <p className="text-xl font-bold" style={{ color: "#1B5E20" }}>
            {uniqueDays}<span className="text-sm font-semibold ml-0.5">日</span>
          </p>
        </div>
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.7)" }}
        >
          <p className="text-xs font-medium mb-0.5" style={{ color: "#558B2F" }}>
            総積み上げ時間
          </p>
          <p className="text-xl font-bold" style={{ color: "#1B5E20" }}>
            {hours > 0 ? `${hours}h ${mins}m` : `${mins}分`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── カテゴリカード ──────────────────────────────────────────

const CATEGORY_LABEL: Record<string, { label: string; emoji: string; color: string }> = {
  skill:     { label: "スキル",   emoji: "⚡", color: "#7C5CDB" },
  knowledge: { label: "学び",     emoji: "📚", color: "#1976D2" },
  network:   { label: "人脈",     emoji: "🤝", color: "#F57C00" },
  habit:     { label: "習慣",     emoji: "🌱", color: "#2E7D32" },
  health:    { label: "健康",     emoji: "💪", color: "#D32F2F" },
  work:      { label: "仕事",     emoji: "💼", color: "#455A64" },
  other:     { label: "その他",   emoji: "✨", color: "#9E9E9E" },
};

function CategoryCard({
  totals,
  totalMinutes,
}: {
  totals: Record<string, number>;
  totalMinutes: number;
}) {
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="card">
      <h2 className="text-sm font-bold mb-3" style={{ color: "#1C1A2E" }}>
        カテゴリ別 積み上げ時間
      </h2>
      <div className="space-y-2.5">
        {sorted.map(([cat, mins]) => {
          const info = CATEGORY_LABEL[cat] || CATEGORY_LABEL.other;
          const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: "#1C1A2E" }}>
                  <span>{info.emoji}</span>
                  {info.label}
                </span>
                <span className="text-xs font-semibold" style={{ color: info.color }}>
                  {h > 0 ? `${h}h ${m}m` : `${m}分`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "#F0F0F0" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${pct}%`, background: info.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 振り返りカード ──────────────────────────────────────────

function ReflectionCard({
  uniqueDays,
  totalMinutes,
  streak,
}: {
  uniqueDays: number;
  totalMinutes: number;
  streak: number;
}) {
  const message = getReflectionMessage(uniqueDays, totalMinutes, streak);

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, #F3E5F5, #EDE7F6)",
        border: "1.5px solid #CE93D8",
      }}
    >
      <p className="text-xs font-semibold mb-1" style={{ color: "#7B1FA2" }}>
        ✦ ここまで来た
      </p>
      <p className="text-base font-bold mb-2" style={{ color: "#1C1A2E" }}>
        {message.title}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "#4A4060" }}>
        {message.body}
      </p>
      <p className="text-xs font-semibold mt-3 italic" style={{ color: "#7B1FA2" }}>
        「派手な一歩より、地味な千歩。最後に立っているのはお前だ」
      </p>
    </div>
  );
}

function getReflectionMessage(days: number, minutes: number, streak: number) {
  if (days === 0) {
    return {
      title: "最初の一歩を踏み出そう",
      body: "どんな大きな積み上げも、最初の1記録から始まる。今日、何を積み上げた？",
    };
  }
  if (days < 7) {
    return {
      title: `${days}日分の積み上げが積まれた`,
      body: "まだ始まったばかりに見えても、あなたは動き続けている。続けることが、あなた最大の才能だ。",
    };
  }
  if (days < 30) {
    const hours = Math.floor(minutes / 60);
    return {
      title: `${days}日間、コツコツ積み上げてきた`,
      body: `すでに${hours > 0 ? `${hours}時間以上` : `${minutes}分`}を積み上げた。周りはまだ気づいていないかもしれない。でも1年後、差は歴然だ。`,
    };
  }
  const hours = Math.floor(minutes / 60);
  return {
    title: `${days}日分の「証拠」がここにある`,
    body: `${hours}時間を超える積み上げ。これは運でも才能でもなく、あなたが毎日手を動かし続けた証拠だ。気づけば、誰より遠くに来ていた。`,
  };
}

// ─── 最近の記録 ──────────────────────────────────────────────

function RecentRecordsCard({
  records,
}: {
  records: Array<{
    id: string;
    title: string;
    category: string;
    minutes_spent: number;
    record_date: string;
    note: string | null;
  }>;
}) {
  if (records.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold" style={{ color: "#1C1A2E" }}>
          最近の積み上げ
        </h2>
        <Link
          href="/accumulation/history"
          className="text-xs font-medium no-tap-highlight"
          style={{ color: "#7C5CDB" }}
        >
          すべて見る →
        </Link>
      </div>
      <div className="space-y-2">
        {records.map((r) => {
          const info = CATEGORY_LABEL[r.category] || CATEGORY_LABEL.other;
          return (
            <div
              key={r.id}
              className="flex items-start gap-3 px-3 py-3 rounded-xl"
              style={{ background: "#F8F7FF", border: "1px solid #E8E4F8" }}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{info.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#1C1A2E" }}>
                  {r.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: "#7B78A0" }}>
                    {r.record_date}
                  </span>
                  {r.minutes_spent > 0 && (
                    <span className="text-xs font-semibold" style={{ color: info.color }}>
                      {r.minutes_spent}分
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 空状態 ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="text-5xl mb-4">🌱</div>
      <p className="text-base font-bold mb-2" style={{ color: "#1C1A2E" }}>
        今日の積み上げを記録しよう
      </p>
      <p className="text-sm mb-6 px-4" style={{ color: "#7B78A0" }}>
        毎日30分の積み重ねが、<br />
        1年後に誰も追いつけない壁になる。
      </p>
      <Link
        href="/accumulation/new"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm text-white no-tap-highlight"
        style={{
          background: "linear-gradient(135deg, #2E7D32, #43A047)",
          boxShadow: "0 4px 14px rgba(46,125,50,0.30)",
        }}
      >
        最初の積み上げを記録する
      </Link>
    </div>
  );
}

// ─── ユーティリティ ──────────────────────────────────────────

function calcStreak(records: Array<{ record_date: string }>): number {
  if (records.length === 0) return 0;

  const uniqueDates = [...new Set(records.map((r) => r.record_date))].sort(
    (a, b) => (a > b ? -1 : 1)
  );

  const today = new Date().toISOString().split("T")[0];
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })();

  // 今日か昨日から始まらないとストリーク0
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calcCategoryTotals(
  records: Array<{ category: string; minutes_spent: number }>
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const r of records) {
    if (r.minutes_spent > 0) {
      totals[r.category] = (totals[r.category] || 0) + r.minutes_spent;
    }
  }
  return totals;
}
