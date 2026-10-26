import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import EfficacyCheck from "@/components/features/EfficacyCheck";

const DAYS = 91; // 13週

/** 習慣が自動化するまでの平均日数（Lally et al., 2010） */
const AUTOMATION_DAYS = 66;

/**
 * 脳の成長グラフ（神経可塑性の可視化）
 * - 行動した日を「新しい回路を通した日」としてヒートマップに積み上げる
 * - 自己効力感スコアの変化を線グラフで見せる
 */
export default async function GrowthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const todayKey = dateKey(new Date());
  const startKey = dateKey(new Date(Date.now() - (DAYS - 1) * 86400000));

  const [quests, emotions, dumps, ifThens, efficacy] = await Promise.all([
    table(supabase, "quests")
      .select("done_at")
      .eq("user_id", user.id)
      .eq("is_done", true)
      .gte("done_at", startKey),
    table(supabase, "emotion_logs_v2")
      .select("log_date")
      .eq("user_id", user.id)
      .gte("log_date", startKey),
    table(supabase, "brain_dumps")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", startKey),
    table(supabase, "if_then_plans")
      .select("last_done_date")
      .eq("user_id", user.id)
      .gte("last_done_date", startKey),
    table(supabase, "efficacy_checks")
      .select("score, check_date")
      .eq("user_id", user.id)
      .order("check_date", { ascending: true })
      .limit(30),
  ]);

  // 日付ごとの行動数
  const counts = new Map<string, number>();
  const bump = (iso: string | null) => {
    if (!iso) return;
    const key = iso.slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  };
  (quests.data || []).forEach((r: { done_at: string }) => bump(r.done_at));
  (emotions.data || []).forEach((r: { log_date: string }) => bump(r.log_date));
  (dumps.data || []).forEach((r: { created_at: string }) => bump(r.created_at));
  (ifThens.data || []).forEach((r: { last_done_date: string }) => bump(r.last_done_date));

  const days = Array.from({ length: DAYS }, (_, i) => {
    const key = dateKey(new Date(Date.now() - (DAYS - 1 - i) * 86400000));
    return { key, count: counts.get(key) || 0 };
  });

  const totalActions = days.reduce((sum, d) => sum + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;
  const streak = currentStreak(days);
  const stage = growthStage(activeDays);
  const checks = (efficacy.data || []) as Array<{ score: number; check_date: string }>;
  const todayScore = checks.find((c) => c.check_date === todayKey)?.score ?? null;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold mb-1" style={{ color: "#7C5CDB" }}>
          🧠 脳の成長グラフ
        </p>
        <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
          あなたが作ってきた新しい回路
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          脳は、くり返した行動の通り道を少しずつ太くしていきます
        </p>
      </header>

      <main className="px-5 space-y-4">
        {/* ステージ */}
        <div
          className="rounded-3xl p-5"
          style={{ background: "linear-gradient(135deg, #F3F1FC, #FFFFFF)", border: "1.5px solid #C8BEF0" }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "#7C5CDB" }}>
            いまのステージ
          </p>
          <p className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
            {stage.emoji} {stage.name}
          </p>
          <p className="text-sm mt-1 mb-3" style={{ color: "#4A4766" }}>
            {stage.message}
          </p>
          <div className="w-full h-2 rounded-full" style={{ background: "#E8E4F8" }}>
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.min(100, (activeDays / AUTOMATION_DAYS) * 100)}%`,
                background: "linear-gradient(90deg, #7C5CDB, #F5A623)",
              }}
            />
          </div>
          <p className="text-xs mt-1 text-right" style={{ color: "#7B78A0" }}>
            自動化の目安まで {activeDays} / {AUTOMATION_DAYS} 日
          </p>
        </div>

        {/* 数字 */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="積み上げた行動" value={totalActions} unit="回" />
          <Stat label="回路を通した日" value={activeDays} unit="日" />
          <Stat label="連続" value={streak} unit="日" />
        </div>

        {/* ヒートマップ */}
        <div className="card">
          <p className="text-sm font-bold mb-3" style={{ color: "#1C1A2E" }}>
            90日の足あと
          </p>
          <div
            className="grid gap-1"
            style={{ gridTemplateRows: "repeat(7, 1fr)", gridAutoFlow: "column", gridAutoColumns: "1fr" }}
          >
            {days.map((d) => (
              <div
                key={d.key}
                title={`${d.key}：${d.count}回`}
                className="aspect-square rounded-sm"
                style={{
                  background: heatColor(d.count),
                  outline: d.key === todayKey ? "1.5px solid #7C5CDB" : "none",
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-xs mr-1" style={{ color: "#B0ACC8" }}>少</span>
            {[0, 1, 2, 4].map((n) => (
              <div key={n} className="w-3 h-3 rounded-sm" style={{ background: heatColor(n) }} />
            ))}
            <span className="text-xs ml-1" style={{ color: "#B0ACC8" }}>多</span>
          </div>
        </div>

        {/* 自己効力感 */}
        <div className="card">
          <p className="text-sm font-bold mb-1" style={{ color: "#1C1A2E" }}>
            💪 自己効力感の変化
          </p>
          <p className="text-xs mb-3" style={{ color: "#7B78A0" }}>
            「自分ならできる」と感じる度合い
          </p>
          {checks.length >= 2 ? (
            <EfficacyChart checks={checks} />
          ) : (
            <p className="text-sm py-4 text-center" style={{ color: "#B0ACC8" }}>
              2回以上記録すると、変化がグラフになります
            </p>
          )}
          <EfficacyCheck todayScore={todayScore} />
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold" style={{ color: "#7C5CDB" }}>
        {value}
        <span className="text-xs ml-0.5" style={{ color: "#7B78A0" }}>
          {unit}
        </span>
      </p>
      <p className="text-xs mt-1" style={{ color: "#7B78A0" }}>
        {label}
      </p>
    </div>
  );
}

function EfficacyChart({ checks }: { checks: Array<{ score: number; check_date: string }> }) {
  const w = 300;
  const h = 120;
  const pad = 12;
  const points = checks.map((c, i) => {
    const x = pad + (i / (checks.length - 1)) * (w - pad * 2);
    const y = h - pad - ((c.score - 1) / 9) * (h - pad * 2);
    return { x, y, ...c };
  });
  const first = checks[0].score;
  const last = checks[checks.length - 1].score;
  const diff = last - first;

  return (
    <div className="mb-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="自己効力感の推移">
        {[1, 5, 10].map((v) => {
          const y = h - pad - ((v - 1) / 9) * (h - pad * 2);
          return <line key={v} x1={pad} x2={w - pad} y1={y} y2={y} stroke="#E8E4F8" strokeWidth="1" />;
        })}
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#7C5CDB"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p) => (
          <circle key={p.check_date} cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF" stroke="#7C5CDB" strokeWidth="2">
            <title>{`${p.check_date}：${p.score}`}</title>
          </circle>
        ))}
      </svg>
      <p className="text-xs text-right" style={{ color: diff >= 0 ? "#38C074" : "#7B78A0" }}>
        はじめ {first} → いま {last}
        {diff > 0 && `（+${diff}）`}
      </p>
    </div>
  );
}

// ─── ヘルパー ────────────────────────────────────────────────

function dateKey(d: Date) {
  return d.toISOString().split("T")[0];
}

function heatColor(count: number) {
  if (count === 0) return "#F0EEF8";
  if (count === 1) return "#D6CBF5";
  if (count <= 3) return "#A98DEB";
  return "#7C5CDB";
}

/** 今日（または昨日）から遡って連続で行動した日数 */
function currentStreak(days: Array<{ count: number }>) {
  let i = days.length - 1;
  // 今日まだ何もしていなくても、昨日までの連続は途切れていない扱い
  if (days[i]?.count === 0) i--;
  let streak = 0;
  for (; i >= 0 && days[i].count > 0; i--) streak++;
  return streak;
}

function growthStage(activeDays: number) {
  if (activeDays === 0) {
    return { emoji: "🌰", name: "はじまりの種", message: "最初の一歩で、新しい回路の種がまかれます。" };
  }
  if (activeDays < 21) {
    return {
      emoji: "🌱",
      name: "回路づくり期",
      message: "まだ細い道を踏み固めている途中。小さくても、通るたびに道は太くなっています。",
    };
  }
  if (activeDays < AUTOMATION_DAYS) {
    return {
      emoji: "🌿",
      name: "回路強化期",
      message: "脳が「これはいつものこと」と覚えはじめています。休んだ日があっても回路は消えません。",
    };
  }
  return {
    emoji: "🌳",
    name: "自動化期",
    message: "これだけ積み上げてきたんだから大丈夫。行動があなたの一部になっています。",
  };
}
