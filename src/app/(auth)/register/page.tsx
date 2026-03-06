"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { register } from "@/app/actions/auth";

/**
 * 新規登録ページ（ライトテーマ）
 * URLパラメータ ?type=Pioneer&aura=挑戦 で診断結果を受け取る
 */
function RegisterForm() {
  const searchParams = useSearchParams();
  const diagType = searchParams.get("type") || "";
  const diagAura = searchParams.get("aura") || "";
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
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{ background: "#FAF9FF" }}>
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-1" style={{ color: "#7C5CDB" }}>AZ</h1>
        <p className="text-sm" style={{ color: "#7B78A0" }}>
          {diagType ? "診断完了！アカウントを作って続けよう" : "シーカーの旅をはじめよう"}
        </p>
      </div>

      {diagType && diagAura && (
        <div className="w-full max-w-sm mb-5 rounded-2xl px-4 py-3 text-center"
             style={{ background: "#F3F1FC", border: "1.5px solid #C8BEF0" }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: "#7B78A0" }}>あなたのAZタイプ</p>
          <p className="font-bold" style={{ color: "#7C5CDB" }}>{diagType} × {diagAura}</p>
          <p className="text-xs mt-0.5" style={{ color: "#B0ACC8" }}>登録後に取扱説明書を完成させよう</p>
        </div>
      )}

      <div className="w-full max-w-sm">
        <div className="card-lg">
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="job_type" value={diagType} />
            <input type="hidden" name="aura_type" value={diagAura} />

            {[
              { label: "表示名", name: "display_name", type: "text", placeholder: "あなたの名前（後から変更可）", maxLength: 30 },
              { label: "ユーザー名", name: "username", type: "text", placeholder: "英数字・_(3〜20文字)", minLength: 3, maxLength: 20, pattern: "[a-zA-Z0-9_]+" },
              { label: "メールアドレス", name: "email", type: "email", placeholder: "your@email.com", autoComplete: "email" },
              { label: "パスワード", name: "password", type: "password", placeholder: "8文字以上", minLength: 8 },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#7B78A0" }}>{field.label}</label>
                <input
                  {...field}
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-base outline-none"
                  style={{ background: "#F3F1FC", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
                  onFocus={(e) => { e.target.style.borderColor = "#7C5CDB"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,219,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E8E4F8"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}

            {error && (
              <div className="py-3 px-4 rounded-xl text-sm text-center" style={{ background: "#FEE8E8", color: "#C0392B" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary no-tap-highlight" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "準備中…" : "アカウントを作る ✨"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#7B78A0" }}>
          すでにアカウントがある？{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#7C5CDB" }}>ログイン</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ background: "#FAF9FF", minHeight: "100vh" }} />}>
      <RegisterForm />
    </Suspense>
  );
}
