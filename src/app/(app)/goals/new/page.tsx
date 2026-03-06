"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addGoal } from "@/app/actions/goals";

const AREAS = [
  { id: "work", label: "仕事・キャリア", emoji: "💼" },
  { id: "health", label: "健康・体", emoji: "💪" },
  { id: "learn", label: "学習・スキル", emoji: "📚" },
  { id: "relation", label: "人間関係", emoji: "🤝" },
  { id: "money", label: "お金・資産", emoji: "💰" },
  { id: "life", label: "ライフスタイル", emoji: "🌱" },
];

export default function GoalNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [area, setArea] = useState("work");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("area", area);
    const result = await addGoal(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/home");
    }
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl no-tap-highlight"
          style={{ color: "#7B78A0" }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
          目標を追加
        </h1>
      </header>

      <main className="px-5 space-y-4">
        <form action={handleSubmit} className="space-y-4">

          {/* エリア選択 */}
          <div className="card">
            <label className="block text-sm font-semibold mb-3" style={{ color: "#1C1A2E" }}>
              カテゴリ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AREAS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setArea(a.id)}
                  className="rounded-xl py-3 px-2 text-center transition-all no-tap-highlight"
                  style={{
                    background: area === a.id ? "#EDE9F9" : "#F3F1FC",
                    border: `1.5px solid ${area === a.id ? "#7C5CDB" : "#E8E4F8"}`,
                  }}
                >
                  <div className="text-xl mb-1">{a.emoji}</div>
                  <div
                    className="text-xs font-medium leading-tight"
                    style={{ color: area === a.id ? "#7C5CDB" : "#7B78A0" }}
                  >
                    {a.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 目標タイトル */}
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1C1A2E" }}>
                目標
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="例: 3ヶ月で英語でメールが書けるようになる"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#F3F1FC",
                  border: "1.5px solid #E8E4F8",
                  color: "#1C1A2E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7C5CDB";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,92,219,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8E4F8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* 最小行動 */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1C1A2E" }}>
                最小行動 <span className="text-xs font-normal" style={{ color: "#B0ACC8" }}>（任意）</span>
              </label>
              <p className="text-xs mb-2" style={{ color: "#7B78A0" }}>
                絶対にできる最小の一歩は？
              </p>
              <input
                type="text"
                name="min_action"
                placeholder="例: 毎朝5分、単語アプリを開く"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#F3F1FC",
                  border: "1.5px solid #E8E4F8",
                  color: "#1C1A2E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7C5CDB";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,92,219,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8E4F8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* 勝てる条件 */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1C1A2E" }}>
                勝てる条件 <span className="text-xs font-normal" style={{ color: "#B0ACC8" }}>（任意）</span>
              </label>
              <p className="text-xs mb-2" style={{ color: "#7B78A0" }}>
                どんな状況・環境だと動きやすい？
              </p>
              <input
                type="text"
                name="win_context"
                placeholder="例: 朝に一人でやるとはかどる"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#F3F1FC",
                  border: "1.5px solid #E8E4F8",
                  color: "#1C1A2E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7C5CDB";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,92,219,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8E4F8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {error && (
            <div
              className="py-3 px-4 rounded-xl text-sm text-center"
              style={{ background: "#FEE8E8", color: "#C0392B" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary no-tap-highlight"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "保存中…" : "目標を追加する"}
          </button>
        </form>

        {/* ヒント */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "#F3F1FC", border: "1.5px solid #C8BEF0" }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: "#7C5CDB" }}>
            💡 目標設定のヒント
          </p>
          {[
            "「〜したい」より「〜できた状態」で書くと明確になる",
            "最小行動は2分でできるレベルに小さく",
            "勝てる条件を知ると継続率が上がる",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2 mt-1.5">
              <span className="text-xs mt-0.5" style={{ color: "#C8BEF0" }}>•</span>
              <span className="text-xs" style={{ color: "#7B78A0" }}>{tip}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
