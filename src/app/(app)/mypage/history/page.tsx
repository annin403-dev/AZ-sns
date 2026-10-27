import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";

const MOOD_EMOJI: Record<string, string> = {
  great: "😄",
  good: "🙂",
  neutral: "😐",
  tired: "😴",
  rough: "😔",
};

/**
 * 記録・履歴
 * 気分の記録・達成したクエスト・SOSの記録を新しい順に見る
 */
export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: moods }, { data: quests }, { data: stucks }] = await Promise.all([
    table(supabase, "emotion_logs_v2")
      .select("id, log_date, mood, hp_value, mp_value, memo, good_things")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(14),
    table(supabase, "quests")
      .select("id, title, done_at")
      .eq("user_id", user.id)
      .eq("is_done", true)
      .order("done_at", { ascending: false })
      .limit(20),
    table(supabase, "stuck_records")
      .select("id, situation, alternative_view, next_action, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <Link href="/mypage" className="text-sm no-tap-highlight" style={{ color: "#7B78A0" }}>
          ← マイページ
        </Link>
        <h1 className="text-xl font-bold mt-2" style={{ color: "#1C1A2E" }}>
          📊 記録・履歴
        </h1>
        <Link href="/growth" className="text-xs no-tap-highlight" style={{ color: "#7C5CDB" }}>
          🌱 脳の成長グラフで見る →
        </Link>
      </header>

      <main className="px-5 space-y-4">
        <Section title="今日の気分" empty="まだ記録がありません" count={moods?.length ?? 0}>
          {moods?.map((m: { id: string; log_date: string; mood: string; hp_value: number; mp_value: number; memo: string; good_things: string[] }) => (
            <div key={m.id} className="py-2 border-b last:border-0" style={{ borderColor: "#F0EEF8" }}>
              <p className="text-sm" style={{ color: "#1C1A2E" }}>
                {MOOD_EMOJI[m.mood] ?? "😐"} {date(m.log_date)}　HP {m.hp_value} · MP {m.mp_value}
              </p>
              {m.memo && <p className="text-xs mt-0.5" style={{ color: "#7B78A0" }}>{m.memo}</p>}
              {m.good_things?.length > 0 && (
                <p className="text-xs mt-0.5" style={{ color: "#38C074" }}>✨ {m.good_things.join(" / ")}</p>
              )}
            </div>
          ))}
        </Section>

        <Section title="達成したクエスト" empty="まだありません" count={quests?.length ?? 0}>
          {quests?.map((q: { id: string; title: string; done_at: string | null }) => (
            <p key={q.id} className="text-sm py-1.5" style={{ color: "#1C1A2E" }}>
              ✅ {q.title}
              {q.done_at && <span className="text-xs ml-2" style={{ color: "#B0ACC8" }}>{date(q.done_at)}</span>}
            </p>
          ))}
        </Section>

        <Section title="🆘 SOSの記録" empty="まだありません" count={stucks?.length ?? 0}>
          {stucks?.map((s: { id: string; situation: string; alternative_view: string; next_action: string; created_at: string }) => (
            <div key={s.id} className="py-2 border-b last:border-0" style={{ borderColor: "#F0EEF8" }}>
              <p className="text-sm" style={{ color: "#1C1A2E" }}>{date(s.created_at)}　{s.situation}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7B78A0" }}>💡 {s.alternative_view} → ▶ {s.next_action}</p>
            </div>
          ))}
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  empty,
  count,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <p className="text-sm font-bold mb-2" style={{ color: "#1C1A2E" }}>{title}</p>
      {count === 0 ? <p className="text-sm" style={{ color: "#B0ACC8" }}>{empty}</p> : children}
    </div>
  );
}
