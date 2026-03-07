"use client";

/**
 * 診断結果画面（説明文ファースト）
 *
 * 見せ方の優先順位：
 *   1. キャッチフレーズ（一番パンチがある）
 *   2. 説明文（「あなたについて」のメイン本文）
 *   3. タイプ名・英語コード（サブ情報）
 *   4. 強み / 心のエンジン / ステータス
 *   5. CTA
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { runMixedDiagnosis } from "@/lib/diagnosis/scoring";
import { getAZType, JOB_TYPE_INFO, AURA_INFO } from "@/lib/diagnosis/types-data";
import type { DiagnosisResult } from "@/lib/diagnosis/scoring";
import type { AZTypeData } from "@/lib/diagnosis/types-data";

const STORAGE_KEY = "az_mixed_answers";

export default function DiagnosisResultPage() {
  const router = useRouter();
  const [result,   setResult]   = useState<DiagnosisResult | null>(null);
  const [typeData, setTypeData] = useState<AZTypeData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      router.replace("/diagnosis");
      return;
    }
    const answers    = JSON.parse(stored);
    const diagResult = runMixedDiagnosis(answers);
    const azType     = getAZType(diagResult.jobType, diagResult.auraType);

    setResult(diagResult);
    setTypeData(azType ?? null);
    setTimeout(() => setIsLoaded(true), 80);
  }, [router]);

  if (!result || !typeData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9FF" }}>
        <p className="text-sm" style={{ color: "#7B78A0" }}>結果を計算中…</p>
      </div>
    );
  }

  const auraInfo = AURA_INFO[result.auraType];

  return (
    <div className="min-h-screen flex flex-col pb-10" style={{ background: "#FAF9FF" }}>

      {/* ヘッダー */}
      <header className="px-5 pt-12 pb-2 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: "#7C5CDB" }}>
          AZ
        </Link>
        <span className="text-sm" style={{ color: "#7B78A0" }}>診断結果</span>
      </header>

      <main className="flex-1 px-5">

        {/* ── Hero カード（説明文ファースト） ── */}
        <section
          className="mt-6 rounded-3xl p-6"
          style={{
            background: `linear-gradient(145deg, ${typeData.auraColorLight} 0%, #FFFFFF 70%)`,
            border: `1.5px solid ${typeData.auraColor}30`,
            opacity:   isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s ease-out",
          }}
        >
          {/* オーラアイコン */}
          <div className="text-3xl mb-4 text-center">{auraInfo.emoji}</div>

          {/* キャッチフレーズ（一番大きく・最初） */}
          <p
            className="text-xl font-bold text-center leading-snug mb-5"
            style={{ color: "#1C1A2E", letterSpacing: "-0.01em" }}
          >
            「{typeData.catchphrase}」
          </p>

          {/* 説明文（メイン本文） */}
          <p
            className="text-sm leading-relaxed mb-6 text-center"
            style={{ color: "#3A3660" }}
          >
            {typeData.description}
          </p>

          {/* 区切り線 */}
          <div style={{ height: "1px", background: `${typeData.auraColor}20`, marginBottom: "16px" }} />

          {/* タイプ名（サブ情報） */}
          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: typeData.auraColor }}>
              {result.jobType.toUpperCase()} × {result.auraType}
            </p>
            <p className="text-2xl font-bold mb-2" style={{ color: "#1C1A2E" }}>
              {typeData.title}
            </p>
            <p className="text-xs" style={{ color: "#7B78A0" }}>
              全シーカーの{" "}
              <span className="font-bold" style={{ color: typeData.auraColor }}>
                {typeData.populationPercent}%
              </span>{" "}
              がこのタイプ
            </p>
          </div>
        </section>

        {/* ── 勝ちパターン（強み） ── */}
        <section
          className="card mt-4"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.1s",
          }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>
            あなたの勝ちパターン
          </h2>
          <div className="space-y-2">
            {typeData.strengths.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: typeData.auraColorLight }}
              >
                <span className="text-sm" style={{ color: typeData.auraColor }}>✦</span>
                <span className="text-sm font-medium" style={{ color: "#1C1A2E" }}>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 心のエンジン（原動力） ── */}
        <section
          className="card mt-4"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{auraInfo.emoji}</span>
            <h2 className="text-sm font-semibold" style={{ color: "#7B78A0" }}>
              あなたの心のエンジン：{result.auraType}
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>
            {auraInfo.description}
          </p>
        </section>

        {/* ── ステータス ── */}
        <section
          className="card mt-4"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.3s",
          }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>
            ステータス
          </h2>
          <div className="space-y-3">
            <StatusBar label="HP（行動体力）"      value={typeData.hpDefault} color="#F05252" />
            <StatusBar label="MP（精神エネルギー）" value={typeData.mpDefault} color="#9060E0" />
          </div>
          <p className="text-xs mt-3" style={{ color: "#B0ACC8" }}>
            ※ 毎日の感情ログで更新されます
          </p>
        </section>

        {/* ── CTA ── */}
        <div
          className="mt-8 space-y-3"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.4s",
          }}
        >
          <Link
            href={`/register?type=${result.jobType}&aura=${encodeURIComponent(result.auraType)}`}
            className="btn-primary block text-center no-tap-highlight"
          >
            登録して、取扱説明書を完成させる →
          </Link>
          <Link href="/" className="block text-center py-3 text-sm no-tap-highlight" style={{ color: "#7B78A0" }}>
            あとでにする
          </Link>
        </div>

      </main>
    </div>
  );
}

// ─── ステータスバー ───────────────────────────────────────────

function StatusBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm" style={{ color: "#7B78A0" }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: "#1C1A2E" }}>{value}/10</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: "#E8E4F8" }}>
        <div
          className="h-2 rounded-full transition-all duration-1000"
          style={{
            width: `${(value / 10) * 100}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
          }}
        />
      </div>
    </div>
  );
}
