"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addQuest } from "@/app/actions/quests";

/**
 * クエスト追加ページ
 * 「今日の最小行動」を1つ決める
 */
export default function NewQuestPage() {
  const router = useRouter();
  const [title, setTitle]     = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("クエスト名を入力してください"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("context", context);
    fd.append("scheduled_date", today);
    const result = await addQuest(fd);
    if (result.error) { setError(result.error); setLoading(false); return; }
    router.push("/home");
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl no-tap-highlight" style={{ color: "#7B78A0" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>クエストを追加</h1>
      </header>

      <main className="px-5">
        {/* 説明カード */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: "#F3F1FC", border: "1.5px solid #C8BEF0" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#7C5CDB" }}>クエストとは？</p>
          <p className="text-sm" style={{ color: "#1C1A2E" }}>
            「今日できる最小の行動」。大きなゴールではなく、<br/>
            2分〜30分でできる具体的な行動を設定しよう。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1C1A2E" }}>
              今日のクエスト（何をする？）
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：企画書の最初の1ページだけ書く"
              className="w-full px-4 py-4 rounded-2xl text-base outline-none"
              style={{ background: "#FFFFFF", border: "2px solid #E8E4F8", color: "#1C1A2E" }}
              onFocus={(e) => { e.target.style.borderColor = "#7C5CDB"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E8E4F8"; }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1C1A2E" }}>
              いつ・どこでやる？（文脈メモ）
              <span className="font-normal ml-2" style={{ color: "#B0ACC8" }}>任意</span>
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="例：朝コーヒーを飲みながら、カフェで"
              className="w-full px-4 py-4 rounded-2xl text-base outline-none"
              style={{ background: "#FFFFFF", border: "2px solid #E8E4F8", color: "#1C1A2E" }}
              onFocus={(e) => { e.target.style.borderColor = "#7C5CDB"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E8E4F8"; }}
            />
            <p className="text-xs mt-2" style={{ color: "#B0ACC8" }}>
              文脈を決めると実行しやすくなります（実装意図という心理学的テクニック）
            </p>
          </div>

          {error && (
            <div className="py-3 px-4 rounded-xl text-sm text-center" style={{ background: "#FEE8E8", color: "#C0392B" }}>
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn-primary no-tap-highlight"
              style={{ opacity: (loading || !title.trim()) ? 0.6 : 1 }}
            >
              {loading ? "追加中…" : "クエストを追加する ✨"}
            </button>
          </div>
        </form>

        {/* ヒント */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold" style={{ color: "#7B78A0" }}>良いクエストのポイント</p>
          {[
            "できるだけ具体的に（「勉強する」より「教材の第1章を読む」）",
            "5〜30分で終わるサイズにする",
            "完了したかどうかが明確にわかるもの",
          ].map((tip) => (
            <div key={tip} className="flex gap-2">
              <span className="text-xs mt-0.5" style={{ color: "#7C5CDB" }}>✦</span>
              <p className="text-xs" style={{ color: "#7B78A0" }}>{tip}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
