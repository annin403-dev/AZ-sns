import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const CATEGORY_LABEL: Record<string, { label: string; emoji: string; color: string }> = {
  skill:     { label: "スキル",   emoji: "⚡", color: "#7C5CDB" },
  knowledge: { label: "学び",     emoji: "📚", color: "#1976D2" },
  network:   { label: "人脈",     emoji: "🤝", color: "#F57C00" },
  habit:     { label: "習慣",     emoji: "🌱", color: "#2E7D32" },
  health:    { label: "健康",     emoji: "💪", color: "#D32F2F" },
  work:      { label: "仕事",     emoji: "💼", color: "#455A64" },
  other:     { label: "その他",   emoji: "✨", color: "#9E9E9E" },
};

/**
 * 積み上げ記録 全履歴ページ
 */
export default async function AccumulationHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: records } = await supabase
    .from("accumulation_records")
    .select("*")
    .eq("user_id", user.id)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  // 日付でグループ化
  const grouped: Record<string, typeof records> = {};
  for (const r of records || []) {
    if (!grouped[r.record_date]) grouped[r.record_date] = [];
    grouped[r.record_date]!.push(r);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <Link href="/accumulation" className="p-2 rounded-xl no-tap-highlight" style={{ color: "#7B78A0" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>全履歴</h1>
          <p className="text-xs" style={{ color: "#7B78A0" }}>{sortedDates.length}日分の記録</p>
        </div>
      </header>

      <main className="px-5 space-y-4">
        {sortedDates.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm" style={{ color: "#7B78A0" }}>まだ記録がありません</p>
          </div>
        ) : (
          sortedDates.map((date) => {
            const dayRecords = grouped[date]!;
            const totalMins = dayRecords.reduce((s, r) => s + (r.minutes_spent || 0), 0);
            return (
              <div key={date} className="card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold" style={{ color: "#1C1A2E" }}>{date}</p>
                  {totalMins > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                      計 {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}分`}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {dayRecords.map((r) => {
                    const info = CATEGORY_LABEL[r.category] || CATEGORY_LABEL.other;
                    return (
                      <div key={r.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl" style={{ background: "#F8F7FF" }}>
                        <span className="text-base flex-shrink-0">{info.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>{r.title}</p>
                          {r.note && (
                            <p className="text-xs mt-0.5" style={{ color: "#7B78A0" }}>{r.note}</p>
                          )}
                        </div>
                        {r.minutes_spent > 0 && (
                          <span className="text-xs font-semibold flex-shrink-0" style={{ color: info.color }}>
                            {r.minutes_spent}分
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
