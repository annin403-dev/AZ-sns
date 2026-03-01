import { createClient } from "@/lib/supabase/server";

/**
 * 探すページ（コミュニティ・チャレンジ）
 */
export default async function ExplorePage() {
  const supabase = await createClient();

  // コミュニティ一覧を取得
  const { data: communities } = await supabase
    .from("communities")
    .select("*")
    .order("member_count", { ascending: false })
    .limit(10);

  const GOAL_AREA_LABELS: Record<string, string> = {
    work: "💼 仕事",
    learning: "📚 学習",
    creation: "🎨 制作",
    health: "💪 健康",
    relationship: "🌟 人間関係",
  };

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-az-bg/95 backdrop-blur-xl z-40 px-4 pt-6 pb-3 border-b border-az-border">
        <h1 className="text-az-text font-bold text-lg">探す</h1>
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* 目標領域別タイムライン */}
        <div>
          <h2 className="text-az-text font-semibold mb-3">目標領域で探す</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(GOAL_AREA_LABELS).map(([area, label]) => (
              <button
                key={area}
                className="card-surface p-4 text-left hover:border-az-glow/40 transition-colors"
              >
                <div className="text-az-text font-medium text-sm">{label}</div>
                <div className="text-az-subtle text-xs mt-1">タイムラインを見る →</div>
              </button>
            ))}
          </div>
        </div>

        {/* コミュニティ */}
        <div>
          <h2 className="text-az-text font-semibold mb-3">
            サークル（コミュニティ）
          </h2>
          {communities && communities.length > 0 ? (
            <div className="space-y-3">
              {communities.map((community) => (
                <div key={community.id} className="card-surface p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-az-muted flex items-center justify-center text-xl">
                    {GOAL_AREA_LABELS[community.goal_area]?.split(" ")[0] || "🌟"}
                  </div>
                  <div className="flex-1">
                    <p className="text-az-text font-medium text-sm">{community.name}</p>
                    <p className="text-az-subtle text-xs">
                      {community.member_count}人参加中
                    </p>
                  </div>
                  <button className="px-3 py-1.5 rounded-full text-xs border border-az-glow
                                     text-az-glow hover:bg-az-glow/10 transition-colors">
                    参加
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-surface p-8 text-center">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-az-subtle text-sm">
                まだサークルがありません
              </p>
              <p className="text-az-subtle text-xs mt-1">
                近日公開予定
              </p>
            </div>
          )}
        </div>

        {/* チャレンジ（Coming Soon） */}
        <div>
          <h2 className="text-az-text font-semibold mb-3">チャレンジ</h2>
          <div className="card-surface p-8 text-center">
            <p className="text-4xl mb-3">⚔️</p>
            <p className="text-az-text font-medium">30日チャレンジ</p>
            <p className="text-az-subtle text-sm mt-1">
              近日公開予定
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
