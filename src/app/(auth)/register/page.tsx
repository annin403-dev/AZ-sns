"use client";

import { useState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";

/**
 * 新規登録ページ
 */
export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-mystic flex flex-col items-center justify-center px-4 py-10">
      {/* ロゴ */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-az-gold text-gold-glow mb-2">
          AZ
        </h1>
        <p className="text-az-subtle text-sm">〜アズ〜</p>
        <p className="text-az-text/60 text-xs mt-2">
          あなただけの成長の旅が始まる
        </p>
      </div>

      {/* 登録フォーム */}
      <div className="w-full max-w-sm">
        <div className="card-surface p-6 space-y-5">
          <h2 className="text-lg font-semibold text-center text-az-text">
            旅を始める
          </h2>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-az-subtle mb-1.5">
                ユーザー名
              </label>
              <input
                type="text"
                name="username"
                required
                pattern="[a-zA-Z0-9_]+"
                minLength={3}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-az-muted border border-az-border
                           text-az-text placeholder-az-subtle/50 focus:outline-none
                           focus:border-az-glow focus:ring-1 focus:ring-az-glow/30
                           transition-all duration-200"
                placeholder="your_username"
              />
              <p className="text-az-subtle/60 text-xs mt-1">
                英数字とアンダースコアのみ（3〜20文字）
              </p>
            </div>

            <div>
              <label className="block text-sm text-az-subtle mb-1.5">
                表示名
              </label>
              <input
                type="text"
                name="display_name"
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl bg-az-muted border border-az-border
                           text-az-text placeholder-az-subtle/50 focus:outline-none
                           focus:border-az-glow focus:ring-1 focus:ring-az-glow/30
                           transition-all duration-200"
                placeholder="あなたの名前"
              />
            </div>

            <div>
              <label className="block text-sm text-az-subtle mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-az-muted border border-az-border
                           text-az-text placeholder-az-subtle/50 focus:outline-none
                           focus:border-az-glow focus:ring-1 focus:ring-az-glow/30
                           transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-az-subtle mb-1.5">
                パスワード
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl bg-az-muted border border-az-border
                           text-az-text placeholder-az-subtle/50 focus:outline-none
                           focus:border-az-glow focus:ring-1 focus:ring-az-glow/30
                           transition-all duration-200"
                placeholder="8文字以上"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white
                         bg-az-glow btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "旅の準備中..." : "旅を始める ✨"}
            </button>
          </form>
        </div>

        <p className="text-center text-az-subtle text-sm mt-6">
          すでにアカウントがある？{" "}
          <Link
            href="/login"
            className="text-az-glow hover:text-az-mystic transition-colors"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
