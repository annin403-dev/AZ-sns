"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAccumulationRecord, type AccumulationCategory } from "@/app/actions/accumulation";

const CATEGORIES: {
  value: AccumulationCategory;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: "habit",     label: "習慣",   emoji: "🌱", color: "#2E7D32" },
  { value: "skill",     label: "スキル", emoji: "⚡", color: "#7C5CDB" },
  { value: "knowledge", label: "学び",   emoji: "📚", color: "#1976D2" },
  { value: "work",      label: "仕事",   emoji: "💼", color: "#455A64" },
  { value: "health",    label: "健康",   emoji: "💪", color: "#D32F2F" },
  { value: "network",   label: "人脈",   emoji: "🤝", color: "#F57C00" },
  { value: "other",     label: "その他", emoji: "✨", color: "#9E9E9E" },
];

const MINUTE_PRESETS = [15, 30, 45, 60, 90, 120];

/**
 * 積み上げ記録追加ページ
 * 今日積み上げたことを1つ記録する
 */
export default function NewAccumulationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AccumulationCategory>("habit");
  const [minutes, setMinutes] = useState(30);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("内容を入力してください");
      return;
    }
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("category", category);
    fd.append("minutes_spent", String(minutes));
    fd.append("note", note);
    fd.append("record_date", today);

    const result = await addAccumulationRecord(fd);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/accumulation");
  }

  const selectedCat = CATEGORIES.find((c) => c.value === category)!;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl no-tap-highlight"
          style={{ color: "#7B78A0" }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 19L8 12L15 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
            今日の積み上げを記録
          </h1>
          <p className="text-xs" style={{ color: "#7B78A0" }}>
            {today}
          </p>
        </div>
      </header>

      <main className="px-5">
        {/* モチベカード */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: "linear-gradient(135deg, #E8F5E9, #F1F8E9)",
            border: "1.5px solid #A5D6A7",
          }}
        >
          <p className="text-xs font-semibold mb-0.5" style={{ color: "#2E7D32" }}>
            積み上げ王の鉄則
          </p>
          <p className="text-sm font-medium" style={{ color: "#1B5E20" }}>
            「今日の30分が、1年後の自分を作る」
          </p>
          <p className="text-xs mt-1" style={{ color: "#558B2F" }}>
            小さくてもいい。手を動かした事実が積み上がる。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ─── 内容 ─── */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#1C1A2E" }}
            >
              今日積み上げたこと
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：Reactのフックを30分勉強した"
              className="w-full px-4 py-4 rounded-2xl text-base outline-none"
              style={{
                background: "#FFFFFF",
                border: "2px solid #E8E4F8",
                color: "#1C1A2E",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2E7D32";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E8E4F8";
              }}
            />
          </div>

          {/* ─── カテゴリ ─── */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#1C1A2E" }}
            >
              カテゴリ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className="flex flex-col items-center py-2.5 px-1 rounded-xl transition-all no-tap-highlight"
                  style={{
                    background:
                      category === cat.value
                        ? `${cat.color}18`
                        : "#F8F7FF",
                    border: `2px solid ${
                      category === cat.value ? cat.color : "#E8E4F8"
                    }`,
                  }}
                >
                  <span className="text-xl mb-0.5">{cat.emoji}</span>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color:
                        category === cat.value ? cat.color : "#7B78A0",
                    }}
                  >
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ─── 時間 ─── */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#1C1A2E" }}
            >
              積み上げ時間
              <span
                className="font-normal ml-2"
                style={{ color: "#B0ACC8" }}
              >
                任意
              </span>
            </label>
            {/* プリセットボタン */}
            <div className="flex flex-wrap gap-2 mb-3">
              {MINUTE_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all no-tap-highlight"
                  style={{
                    background:
                      minutes === m ? selectedCat.color : "#F0F0F8",
                    color: minutes === m ? "#FFFFFF" : "#7B78A0",
                    border: `1.5px solid ${
                      minutes === m ? selectedCat.color : "#E8E4F8"
                    }`,
                  }}
                >
                  {m >= 60 ? `${m / 60}h` : `${m}分`}
                </button>
              ))}
            </div>
            {/* スライダー */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="240"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                className="flex-1 h-2 rounded-full outline-none"
                style={{ accentColor: selectedCat.color }}
              />
              <span
                className="text-base font-bold w-16 text-right"
                style={{ color: selectedCat.color }}
              >
                {minutes >= 60
                  ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
                  : `${minutes}分`}
              </span>
            </div>
          </div>

          {/* ─── メモ ─── */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#1C1A2E" }}
            >
              メモ・感想
              <span
                className="font-normal ml-2"
                style={{ color: "#B0ACC8" }}
              >
                任意
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今日の気づきや感想を残しておこう"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
              style={{
                background: "#FFFFFF",
                border: "2px solid #E8E4F8",
                color: "#1C1A2E",
                lineHeight: "1.6",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2E7D32";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E8E4F8";
              }}
            />
          </div>

          {/* ─── エラー ─── */}
          {error && (
            <p className="text-sm text-center" style={{ color: "#D32F2F" }}>
              {error}
            </p>
          )}

          {/* ─── 送信ボタン ─── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-base text-white transition-all active:scale-95 no-tap-highlight"
            style={{
              background: loading
                ? "#A5D6A7"
                : "linear-gradient(135deg, #2E7D32, #43A047)",
              boxShadow: loading
                ? "none"
                : "0 4px 14px rgba(46,125,50,0.35)",
            }}
          >
            {loading ? "保存中..." : "積み上げを記録する ✓"}
          </button>
        </form>
      </main>
    </div>
  );
}
