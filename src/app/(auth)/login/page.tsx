"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";

/**
 * ログインページ
 */
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-mystic flex flex-col items-center justify-center px-4">
      {/* ロゴ */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-az-gold text-gold-glow mb-2">
          AZ
        </h1>
        <p className="text-az-subtle text-sm">〜アズ〜</p>
        <p className="text-az-text/60 text-xs mt-2">自己成長型SNS</p>
      </div>

      {/* ログインフォーム */}
      <div className="w-full max-w-sm">
        <div className="card-surface p-6 space-y-5">
          <h2 className="text-lg font-semibold text-center text-az-text">
            おかえりなさい
          </h2>

          <form action={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-xl bg-az-muted border border-az-border
                           text-az-text placeholder-az-subtle/50 focus:outline-none
                           focus:border-az-glow focus:ring-1 focus:ring-az-glow/30
                           transition-all duration-200"
                placeholder="••••••••"
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
              {loading ? "確認中..." : "ログイン"}
            </button>
          </form>
        </div>

        <p className="text-center text-az-subtle text-sm mt-6">
          まだアカウントがない？{" "}
          <Link
            href="/register"
            className="text-az-glow hover:text-az-mystic transition-colors"
          >
            新規登録
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/onboarding"
            className="text-az-subtle/70 text-xs underline hover:text-az-subtle transition-colors"
          >
            登録なしでまず診断してみる →
          </Link>
        </div>
      </div>
    </div>
  );
}
