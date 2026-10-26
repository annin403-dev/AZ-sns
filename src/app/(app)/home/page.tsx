import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { table } from "@/lib/supabase/untyped";
import QuestList from "@/components/features/QuestList";

/**
 * ホームページ（サーバーコンポーネント）
 *
 * 毎日ここだけ見れば進める場所
 * - Luck Lv
 * - 今日のクエスト
 * - 感情ログ入口
 * - Three Good Things 入口
 * - 詰まりボタン（layout.tsxで常時表示）
 * - AZからのひとこと / If-Then / AZツール（Phase 3）
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // プロフィール取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 今日のクエスト取得
  const today = new Date().toISOString().split("T")[0];
  const { data: quests } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user.id)
    .eq("scheduled_date", today)
    .order("created_at");

  // 今日の感情ログ（あるかチェック）
  const { data: todayLog } = await supabase
    .from("emotion_logs_v2")
    .select("id, mood, hp_value, mp_value")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 今月の目標取得
  const { data: goals } = await supabase
    .from("goals")
    .select("id, title, progress")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // 今週の達成クエスト数
  const weekStart = getWeekStart();
  const { data: weeklyDone } = await supabase
    .from("quests")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_done", true)
    .gte("scheduled_date", weekStart);

  const { data: weeklyTotal } = await supabase
    .from("quests")
    .select("id")
    .eq("user_id", user.id)
    .gte("scheduled_date", weekStart);

  // 有効なIf-Thenプラン
  const { data: ifThens } = await table(supabase, "if_then_plans")
    .select("id, trigger_text, action_text, last_done_date")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(2);

  const displayName = profile?.display_name || "シーカー";
  const luckLv = profile?.luck_lv || 1;
  const luckXp = profile?.luck_xp || 0;
  const hp = profile?.hp || 7;
  const mp = profile?.mp || 7;
  const jobType = profile?.job_type || null;
  const auraType = profile?.aura_type || null;

  const doneCount = weeklyDone?.length || 0;
  const totalCount = weeklyTotal?.length || 0;
  const weeklyRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "#FAF9FF" }}
    >
      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: "#7B78A0" }}>
              おかえり
            </p>
            <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
              {displayName}
            </h1>
          </div>
          {/* Luck Lv バッジ */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "#FEF5E4", border: "1.5px solid #F5D98B" }}
          >
            <span className="text-sm">⭐</span>
            <span className="text-sm font-bold" style={{ color: "#F5A623" }}>
              Luck Lv.{luckLv}
            </span>
          </div>
        </div>
      </header>

      <main className="px-5 space-y-4">

        {/* ─── AZからのひとこと ─── */}
        <AzMessage
          doneToday={(quests || []).filter((q) => q.is_done).length}
          totalToday={(quests || []).length}
          mood={todayLog?.mood ?? null}
        />

        {/* ─── Luck Lv カード ─── */}
        <LuckCard luckLv={luckLv} luckXp={luckXp} hp={hp} mp={mp} />

        {/* ─── 今日のクエスト ─── */}
        <QuestList quests={quests || []} />

        {/* ─── If-Then ─── */}
        {ifThens && ifThens.length > 0 && (
          <IfThenSection plans={ifThens} today={today} />
        )}

        {/* ─── AZツール ─── */}
        <AzTools />

        {/* ─── 感情ログ ─── */}
        <EmotionSection todayLog={todayLog} />

        {/* ─── 今月の目標 ─── */}
        {goals && goals.length > 0 && (
          <GoalSection goals={goals} />
        )}

        {/* ─── 今週の達成率 ─── */}
        {totalCount > 0 && (
          <WeeklyStats doneCount={doneCount} totalCount={totalCount} rate={weeklyRate} />
        )}

        {/* ─── 診断を受けていない場合の誘導カード ─── */}
        {!jobType && (
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
              <p className="text-base font-bold mb-1" style={{ color: "#1C1A2E" }}>
                自分の取扱説明書を作ろう
              </p>
              <p className="text-sm" style={{ color: "#7B78A0" }}>
                2分で診断 → 40タイプから結果が出ます →
              </p>
            </div>
          </Link>
        )}

      </main>
    </div>
  );
}

// ─── Luck Lv カード ──────────────────────────────────────────

function LuckCard({
  luckLv,
  luckXp,
  hp,
  mp,
}: {
  luckLv: number;
  luckXp: number;
  hp: number;
  mp: number;
}) {
  // 次のレベルまでのXP
  const currentLvXp = (luckLv - 1) * 100;
  const nextLvXp = luckLv * 100;
  const progress = ((luckXp - currentLvXp) / 100) * 100;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, #FFFBF0, #FEF5E4)",
        border: "1.5px solid #F5D98B",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "#C98B0A" }}>
            LUCK Lv.{luckLv}
          </p>
          <p className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
            ⭐ {luckXp} XP
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "#C98B0A" }}>
            次のLvまで {nextLvXp - luckXp} XP
          </p>
        </div>
      </div>

      {/* XPバー */}
      <div className="w-full h-2 rounded-full mb-4" style={{ background: "#F5D98B50" }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: "linear-gradient(90deg, #F5A623, #FFD060)",
          }}
        />
      </div>

      {/* HP / MP */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs mb-1 font-medium" style={{ color: "#C98B0A" }}>
            HP（行動体力）
          </p>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-sm"
                style={{
                  background: i < hp ? "#F05252" : "#F5D98B50",
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs mb-1 font-medium" style={{ color: "#C98B0A" }}>
            MP（精神エネルギー）
          </p>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-sm"
                style={{
                  background: i < mp ? "#9060E0" : "#F5D98B50",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AZからのひとこと ────────────────────────────────────────

/**
 * 今日の状態に合わせて、内なる最高の自分＝AZが声をかける
 * 何もできていない日ほど、責めずに安全基地として受け止める
 */
function AzMessage({
  doneToday,
  totalToday,
  mood,
}: {
  doneToday: number;
  totalToday: number;
  mood: string | null;
}) {
  let message: string;
  let cta: { href: string; label: string };

  if (mood === "rough" || mood === "tired") {
    message = "今日は充電の日にしよう。アプリを開けた、それだけで今日の回路は通っているよ。";
    cta = { href: "/braindump", label: "モヤモヤを預ける" };
  } else if (doneToday > 0 && doneToday === totalToday) {
    message = "今日のクエスト、ぜんぶクリア。脳の中で新しい道がまた少し太くなったよ。";
    cta = { href: "/growth", label: "成長グラフを見る" };
  } else if (doneToday > 0) {
    message = "もう一歩踏み出せてるね。現状維持本能に勝った証拠だよ。";
    cta = { href: "/growth", label: "積み上げを見る" };
  } else if (totalToday > 0) {
    message = "動けなくても大丈夫。いちばん小さなクエストを、1分だけやってみる？";
    cta = { href: "/braindump", label: "頭の中を整理する" };
  } else {
    message = "おかえり。今日のあなたにできる、いちばん小さな一歩を一緒に決めよう。";
    cta = { href: "/roadmap", label: "今日の一歩を見る" };
  }

  return (
    <div
      className="rounded-2xl p-4 flex gap-3 items-start"
      style={{ background: "linear-gradient(135deg, #F3F1FC, #FFFFFF)", border: "1.5px solid #C8BEF0" }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
        style={{ background: "linear-gradient(135deg, #7C5CDB, #F5A623)" }}
      >
        AZ
      </div>
      <div className="flex-1">
        <p className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>
          {message}
        </p>
        <Link href={cta.href} className="text-xs font-semibold mt-1 inline-block no-tap-highlight" style={{ color: "#7C5CDB" }}>
          {cta.label} →
        </Link>
      </div>
    </div>
  );
}

// ─── If-Then セクション ──────────────────────────────────────

function IfThenSection({
  plans,
  today,
}: {
  plans: Array<{ id: string; trigger_text: string; action_text: string; last_done_date: string | null }>;
  today: string;
}) {
  return (
    <Link href="/ifthen" className="block card no-tap-highlight">
      <p className="text-sm font-bold mb-2" style={{ color: "#1C1A2E" }}>
        🔁 今日のIf-Then
      </p>
      <div className="space-y-1.5">
        {plans.map((p) => (
          <p key={p.id} className="text-sm" style={{ color: "#4A4766" }}>
            {p.last_done_date === today ? "✅" : "◻️"} もし{p.trigger_text}、{p.action_text}
          </p>
        ))}
      </div>
    </Link>
  );
}

// ─── AZツール ────────────────────────────────────────────────

const AZ_TOOLS = [
  { href: "/brake", emoji: "🧠", title: "ブレーキ診断", sub: "なぜ動けない？" },
  { href: "/roadmap", emoji: "🗺", title: "90日ロードマップ", sub: "迷わない道" },
  { href: "/braindump", emoji: "🌀", title: "ブレインダンプ", sub: "モヤモヤを預ける" },
  { href: "/growth", emoji: "🌱", title: "脳の成長グラフ", sub: "積み上げを見る" },
];

function AzTools() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {AZ_TOOLS.map((tool) => (
        <Link key={tool.href} href={tool.href} className="card no-tap-highlight">
          <span className="text-xl">{tool.emoji}</span>
          <p className="text-sm font-bold mt-1" style={{ color: "#1C1A2E" }}>
            {tool.title}
          </p>
          <p className="text-xs" style={{ color: "#7B78A0" }}>
            {tool.sub}
          </p>
        </Link>
      ))}
    </div>
  );
}

// ─── 感情ログセクション ──────────────────────────────────────

const MOOD_EMOJI: Record<string, string> = {
  great: "😄",
  good: "🙂",
  neutral: "😐",
  tired: "😴",
  rough: "😔",
};

function EmotionSection({
  todayLog,
}: {
  todayLog: { id: string; mood: string; hp_value: number; mp_value: number } | null;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold mb-0.5" style={{ color: "#1C1A2E" }}>
            今日の気分
          </h2>
          {todayLog ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MOOD_EMOJI[todayLog.mood] || "😐"}</span>
              <p className="text-sm" style={{ color: "#7B78A0" }}>
                HP {todayLog.hp_value}/10 · MP {todayLog.mp_value}/10
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#B0ACC8" }}>
              まだ記録していません
            </p>
          )}
        </div>
        {/* 感情ログボタン（本来はモーダル。今はプレースホルダー） */}
        <Link
          href="/home"
          className="px-4 py-2 rounded-xl text-sm font-medium no-tap-highlight"
          style={{
            background: todayLog ? "#F3F1FC" : "#7C5CDB",
            color: todayLog ? "#7C5CDB" : "#FFFFFF",
          }}
        >
          {todayLog ? "更新" : "記録する"}
        </Link>
      </div>
    </div>
  );
}

// ─── 目標セクション ──────────────────────────────────────────

function GoalSection({
  goals,
}: {
  goals: Array<{ id: string; title: string; progress: number }>;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold" style={{ color: "#1C1A2E" }}>
          今月の目標
        </h2>
        <Link
          href="/goals/new"
          className="text-sm font-medium no-tap-highlight"
          style={{ color: "#7C5CDB" }}
        >
          + 追加
        </Link>
      </div>
      <div className="space-y-3">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>
                {goal.title}
              </p>
              <span className="text-xs font-semibold" style={{ color: "#7C5CDB" }}>
                {goal.progress}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "#E8E4F8" }}>
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${goal.progress}%`,
                  background: "linear-gradient(90deg, #7C5CDB, #9B72E6)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 今週の達成率 ────────────────────────────────────────────

function WeeklyStats({
  doneCount,
  totalCount,
  rate,
}: {
  doneCount: number;
  totalCount: number;
  rate: number;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center justify-between"
      style={{
        background: rate >= 70 ? "#E8F9EF" : "#F3F1FC",
        border: `1.5px solid ${rate >= 70 ? "#B8E8CC" : "#C8BEF0"}`,
      }}
    >
      <div>
        <p className="text-xs font-medium" style={{ color: "#7B78A0" }}>
          今週の達成率
        </p>
        <p className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
          {rate}%
        </p>
        <p className="text-xs" style={{ color: "#7B78A0" }}>
          {doneCount}/{totalCount} クエスト完了
        </p>
      </div>
      <div className="text-3xl">
        {rate >= 80 ? "🎉" : rate >= 50 ? "💪" : "🌱"}
      </div>
    </div>
  );
}

// ─── ユーティリティ ──────────────────────────────────────────

/** 今週の月曜日の日付を返す（YYYY-MM-DD形式） */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  // 月曜始まりに調整（0=日 → 6, 1=月 → 0, ...）
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}
