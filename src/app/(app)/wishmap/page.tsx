import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

/**
 * Wish Map ページ
 *
 * 望みのカケラを集める場所
 * タブ：回復 / やりたいこと / 欲しいもの
 */

// カテゴリの定義
const CATEGORIES = [
  {
    key: "recovery" as const,
    label: "回復",
    emoji: "🌿",
    description: "休みたいこと・やめたいこと",
    color: "#38C074",
    colorLight: "#E8F9EF",
  },
  {
    key: "want_to_do" as const,
    label: "やりたいこと",
    emoji: "✨",
    description: "いつかやってみたいこと",
    color: "#7C5CDB",
    colorLight: "#F3F1FC",
  },
  {
    key: "want_to_have" as const,
    label: "欲しいもの",
    emoji: "💫",
    description: "手に入れたいもの・状態",
    color: "#F5A623",
    colorLight: "#FEF5E4",
  },
];

export default async function WishMapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Wish Mapのアイテムを取得
  const { data: wishItems } = await supabase
    .from("wish_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = wishItems || [];

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
          Wish Map
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          望みのカケラを集める場所
        </p>
      </header>

      <main className="px-5 space-y-5">
        {CATEGORIES.map((category) => {
          const categoryItems = items.filter((i) => i.category === category.key);
          return (
            <div key={category.key} className="card">
              {/* カテゴリヘッダー */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.emoji}</span>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: "#1C1A2E" }}>
                      {category.label}
                    </h2>
                    <p className="text-xs" style={{ color: "#7B78A0" }}>
                      {category.description}
                    </p>
                  </div>
                </div>
                {/* 追加ボタン（後でモーダルに変更） */}
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg no-tap-highlight"
                  style={{ background: category.color }}
                  aria-label={`${category.label}を追加`}
                >
                  +
                </button>
              </div>

              {/* アイテムリスト */}
              {categoryItems.length === 0 ? (
                <div
                  className="rounded-xl py-5 text-center"
                  style={{ background: category.colorLight }}
                >
                  <p className="text-sm" style={{ color: "#7B78A0" }}>
                    まだ何もありません
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#B0ACC8" }}>
                    思いついたことを気軽に追加しよう
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl"
                      style={{
                        background: item.is_fulfilled
                          ? "#F0EAFC"
                          : category.colorLight,
                        border: `1.5px solid ${item.is_fulfilled ? "#C8BEF0" : "transparent"}`,
                      }}
                    >
                      <span className="text-lg">
                        {item.is_fulfilled ? "✅" : category.emoji}
                      </span>
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: "#1C1A2E",
                            textDecoration: item.is_fulfilled ? "line-through" : "none",
                          }}
                        >
                          {item.title}
                        </p>
                        {item.memo && (
                          <p className="text-xs mt-0.5" style={{ color: "#7B78A0" }}>
                            {item.memo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* 合計カード */}
        <div
          className="rounded-2xl px-5 py-4 text-center"
          style={{ background: "#F3F1FC", border: "1.5px solid #C8BEF0" }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: "#7B78A0" }}>
            集めた望みのカケラ
          </p>
          <p className="text-2xl font-bold" style={{ color: "#7C5CDB" }}>
            {items.length} 個
          </p>
          {items.filter((i) => i.is_fulfilled).length > 0 && (
            <p className="text-xs mt-1" style={{ color: "#38C074" }}>
              ✅ うち {items.filter((i) => i.is_fulfilled).length} 個が叶った！
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
