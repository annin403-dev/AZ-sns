"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/actions/posts";

/** 投稿タイプの定義 */
const POST_TYPES = [
  { id: "insight", label: "💡 気づき", desc: "発見・学び" },
  { id: "progress", label: "📈 進捗", desc: "目標の進み具合" },
  { id: "task_complete", label: "⚡ 達成", desc: "タスク完了報告" },
  { id: "emotion", label: "🌊 感情", desc: "今の気持ち" },
] as const;

/** 公開範囲の定義 */
const VISIBILITIES = [
  { id: "public", label: "🌐 全体公開" },
  { id: "circle", label: "👥 サークル内" },
  { id: "private", label: "🔒 自分のみ" },
] as const;

/**
 * 投稿作成ページ
 */
export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"insight" | "progress" | "task_complete" | "emotion">("insight");
  const [visibility, setVisibility] = useState<"public" | "circle" | "private">("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 300;
  const remaining = maxLength - content.length;

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("content", content);
    formData.set("post_type", postType);
    formData.set("visibility", visibility);

    const result = await createPost(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/home");
    }
  }

  return (
    <div className="min-h-screen bg-az-bg">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-az-bg/95 backdrop-blur-xl border-b border-az-border z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-az-subtle hover:text-az-text transition-colors"
          >
            キャンセル
          </button>
          <h1 className="text-az-text font-semibold">気づきを投稿</h1>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="px-4 py-1.5 rounded-full bg-az-glow text-white text-sm font-semibold
                       disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "投稿中..." : "投稿"}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* 投稿タイプ選択 */}
        <div>
          <p className="text-az-subtle text-xs mb-2">投稿の種類</p>
          <div className="grid grid-cols-2 gap-2">
            {POST_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setPostType(type.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  postType === type.id
                    ? "border-az-glow bg-az-glow/10"
                    : "border-az-border bg-az-muted"
                }`}
              >
                <div className="text-sm font-medium text-az-text">{type.label}</div>
                <div className="text-xs text-az-subtle">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* テキストエリア */}
        <div className="card-surface p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={maxLength}
            placeholder="今の気づきを書いてみて...&#10;&#10;例：タスクを小さく分けたら意外とすぐできた"
            className="w-full bg-transparent text-az-text placeholder-az-subtle/50
                       resize-none focus:outline-none text-sm leading-relaxed
                       min-h-[150px]"
            autoFocus
          />
          <div className="flex justify-end mt-2">
            <span
              className={`text-xs ${
                remaining < 30 ? "text-az-flame" : "text-az-subtle"
              }`}
            >
              {remaining}
            </span>
          </div>
        </div>

        {/* 公開範囲 */}
        <div>
          <p className="text-az-subtle text-xs mb-2">公開範囲</p>
          <div className="flex gap-2">
            {VISIBILITIES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVisibility(v.id)}
                className={`flex-1 py-2 text-xs rounded-xl border transition-all ${
                  visibility === v.id
                    ? "border-az-glow bg-az-glow/10 text-az-text"
                    : "border-az-border text-az-subtle"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* ヒント */}
        <div className="p-3 rounded-xl bg-az-glow/5 border border-az-glow/20">
          <p className="text-az-subtle text-xs text-center">
            💡 投稿すると +5XP！<br />
            小さな気づきでも、誰かの力になる
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
