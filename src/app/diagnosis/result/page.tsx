"use client";

/**
 * 診断結果画面
 *
 * localStorageから回答を読み込んでスコアを計算し、
 * タイプ・オーラ・人口割合・強みなどを表示する
 *
 * 表示後：
 *   - シェア → （v1.5で実装）
 *   - 続ける → 登録画面へ
 *   - あとで → ランディングへ
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { runSliderDiagnosis } from "@/lib/diagnosis/scoring";
import { getAZType, JOB_TYPE_INFO, AURA_INFO } from "@/lib/diagnosis/types-data";
import type { DiagnosisResult } from "@/lib/diagnosis/scoring";
import type { AZTypeData } from "@/lib/diagnosis/types-data";

const STORAGE_KEY = "az_slider_answers";

// ─── コンポーネント ──────────────────────────────────────────

export default function DiagnosisResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [typeData, setTypeData] = useState<AZTypeData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // localStorage から回答を取得してスコア計算
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // 回答がなければ診断ページへリダイレクト
      router.replace("/diagnosis");
      return;
    }

    const answers = JSON.parse(stored);
    const diagResult = runSliderDiagnosis(answers);
    const azType = getAZType(diagResult.jobType, diagResult.auraType);

    setResult(diagResult);
    setTypeData(azType ?? null);

    // アニメーションのために少し遅らせる
    setTimeout(() => setIsLoaded(true), 100);
  }, [router]);

  // ロード中の表示
  if (!result || !typeData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9FF" }}>
        <div className="text-center">
          <p className="text-sm" style={{ color: "#7B78A0" }}>結果を計算中…</p>
        </div>
      </div>
    );
  }

  const jobInfo = JOB_TYPE_INFO[result.jobType];
  const auraInfo = AURA_INFO[result.auraType];

  return (
    <div className="min-h-screen flex flex-col pb-8" style={{ background: "#FAF9FF" }}>

      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-2 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: "#7C5CDB" }}>
          AZ
        </Link>
        <span className="text-sm" style={{ color: "#7B78A0" }}>診断結果</span>
      </header>

      <main className="flex-1 px-5">

        {/* ─── 結果カード（メイン） ─── */}
        <div
          className="mt-6 rounded-3xl p-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${typeData.auraColorLight}, #FFFFFF)`,
            border: `2px solid ${typeData.auraColor}30`,
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.5s ease-out",
          }}
        >
          {/* オーラアイコン */}
          <div className="text-4xl mb-3">{auraInfo.emoji}</div>

          {/* 職業タイプ（英語） */}
          <p className="text-sm font-semibold tracking-widest mb-1" style={{ color: typeData.auraColor }}>
            {result.jobType.toUpperCase()} × {result.auraType}
          </p>

          {/* タイプ肩書き */}
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#1C1A2E" }}>
            {typeData.title}
          </h1>

          {/* 職業タイプ（日本語） */}
          <p className="text-lg font-medium mb-4" style={{ color: "#7B78A0" }}>
            {jobInfo.emoji} {jobInfo.nameJa}
          </p>

          {/* キャッチフレーズ */}
          <div
            className="rounded-2xl px-4 py-3 mb-4"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <p className="text-base font-medium italic" style={{ color: "#1C1A2E" }}>
              「{typeData.catchphrase}」
            </p>
          </div>

          {/* 人口割合 */}
          <p className="text-xs font-medium" style={{ color: "#7B78A0" }}>
            全シーカーの{" "}
            <span className="font-bold text-sm" style={{ color: typeData.auraColor }}>
              {typeData.populationPercent}%
            </span>{" "}
            がこのタイプ
          </p>
        </div>

        {/* ─── タイプ説明 ─── */}
        <div
          className="card mt-4"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.1s",
          }}
        >
          <h2 className="text-sm font-semibold mb-2" style={{ color: "#7B78A0" }}>
            あなたについて
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#1C1A2E" }}>
            {typeData.description}
          </p>
        </div>

        {/* ─── 強み3つ ─── */}
        <div
          className="card mt-4"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>
            あなたの強み
          </h2>
          <div className="space-y-2">
            {typeData.strengths.map((strength, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ background: typeData.auraColorLight }}
              >
                <span className="text-sm" style={{ color: typeData.auraColor }}>✦</span>
                <span className="text-sm font-medium" style={{ color: "#1C1A2E" }}>
                  {strength}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── オーラの説明 ─── */}
        <div
          className="card mt-4"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.3s",
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
        </div>

        {/* ─── HP / MP（簡易表示） ─── */}
        <div
          className="card mt-4"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.4s",
          }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>
            ステータス
          </h2>
          <div className="space-y-3">
            <StatusBar
              label="HP（行動体力）"
              value={typeData.hpDefault}
              color="#F05252"
            />
            <StatusBar
              label="MP（精神エネルギー）"
              value={typeData.mpDefault}
              color="#9060E0"
            />
          </div>
          <p className="text-xs mt-3" style={{ color: "#B0ACC8" }}>
            ※ 毎日の感情ログで更新されます
          </p>
        </div>

        {/* ─── CTAボタン ─── */}
        <div
          className="mt-8 space-y-3"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.5s",
          }}
        >
          {/* メインCTA：登録して続ける */}
          <Link
            href={`/register?type=${result.jobType}&aura=${result.auraType}`}
            className="btn-primary block text-center no-tap-highlight"
          >
            登録して、取扱説明書を完成させる →
          </Link>

          {/* サブCTA：あとで */}
          <Link
            href="/"
            className="block text-center py-3 text-sm no-tap-highlight"
            style={{ color: "#7B78A0" }}
          >
            あとでにする
          </Link>
        </div>
      </main>
    </div>
  );
}

// ─── ステータスバーコンポーネント ────────────────────────────

function StatusBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm" style={{ color: "#7B78A0" }}>
          {label}
        </span>
        <span className="text-sm font-semibold" style={{ color: "#1C1A2E" }}>
          {value}/10
        </span>
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
