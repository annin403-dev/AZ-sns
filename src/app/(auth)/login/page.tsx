"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";

/**
 * ログインページ（ライトテーマ）
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ background: "#FAF9FF" }}
    >
      {/* ロゴ */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold mb-1" style={{ color: "#7C5CDB" }}>
          AZ
        </h1>
        <p className="text-sm" style={{ color: "#7B78A0" }}>
          おかえり
        </p>
      </div>

      {/* フォーム */}
      <div className="w-full max-w-sm">
        <div className="card-lg space-y-5">
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#7B78A0" }}>
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl text-base outline-none transition-all"
                style={{
                  background: "#F3F1FC",
                  border: "1.5px solid #E8E4F8",
                  color: "#1C1A2E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7C5CDB";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,92,219,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8E4F8";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#7B78A0" }}>
                パスワード
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-xl text-base outline-none transition-all"
                style={{
                  background: "#F3F1FC",
                  border: "1.5px solid #E8E4F8",
                  color: "#1C1A2E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7C5CDB";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,92,219,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8E4F8";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="••••••••"
              />
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
              {loading ? "確認中…" : "ログイン"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#7B78A0" }}>
          まだアカウントがない？{" "}
          <Link href="/register" className="font-semibold no-tap-highlight" style={{ color: "#7C5CDB" }}>
            新規登録
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/diagnosis" className="text-xs no-tap-highlight" style={{ color: "#B0ACC8" }}>
            登録なしで診断だけしてみる →
          </Link>
        </div>
      </div>
    </div>
  );
}
