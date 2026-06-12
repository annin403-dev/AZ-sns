"use client";

/**
 * AZ Deep 診断結果画面
 *
 * 設計書 PART 1「結果画面に表示する項目」に準拠:
 *   1. メインタイプ名 + キャッチコピー
 *   2. 「つまりあなたはこういう人」サマリー
 *   3. 📋 一目で分かるまとめ（強み/弱み/武器）
 *   4. 各軸（エンジン・走行・ブレーキ・充電・コンパス）の説明
 *   5. 💎 欲求バランス（5つの棒グラフ）
 *   6. 📊 HP/MP
 *   7. 就活/起業/人生設計アドバイス
 *   8. 相性の良いタイプ
 *   9. CTAボタン
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { runDeepDiagnosis } from "@/lib/diagnosis/az-deep-scoring";
import {
  getMainType,
  ENGINE_INFO,
  RUNNING_INFO,
  BRAKE_INFO,
  RECHARGE_INFO,
  COMPASS_INFO,
  DESIRE_INFO,
  MAIN_TYPES,
} from "@/lib/diagnosis/az-deep-types";
import type { DeepResult } from "@/lib/diagnosis/az-deep-scoring";
import type { MainTypeData } from "@/lib/diagnosis/az-deep-types";

const STORAGE_KEY = "az_deep_answers";

export default function DeepResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DeepResult | null>(null);
  const [typeData, setTypeData] = useState<MainTypeData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "axes" | "advice">("overview");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      router.replace("/diagnosis/deep");
      return;
    }
    const answers = JSON.parse(stored);
    const r = runDeepDiagnosis(answers);
    const t = getMainType(r.mainTypeKey);
    setResult(r);
    setTypeData(t ?? null);
    setTimeout(() => setIsLoaded(true), 100);
  }, [router]);

  if (!result || !typeData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9FF" }}>
        <p className="text-sm" style={{ color: "#7B78A0" }}>結果を計算中…</p>
      </div>
    );
  }

  const engineInfo = ENGINE_INFO[result.engineType];
  const runningInfo = RUNNING_INFO[result.runningType];
  const brakeInfo = BRAKE_INFO[result.brakeType];
  const rechargeInfo = RECHARGE_INFO[result.rechargeType];
  const compassInfo = COMPASS_INFO[result.compassType];

  const fadeIn = (delay: number) => ({
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.5s ease-out ${delay}s`,
  });

  // 相性の良いタイプデータ
  const goodWithTypes = typeData.goodWith
    .map((key) => MAIN_TYPES.find((t) => t.typeKey === key))
    .filter(Boolean) as MainTypeData[];

  return (
    <div className="min-h-screen flex flex-col pb-12" style={{ background: "#FAF9FF" }}>

      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-2 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: "#7C5CDB" }}>
          AZ
        </Link>
        <span className="text-sm font-medium" style={{ color: "#7B78A0" }}>Deep 診断結果</span>
      </header>

      <main className="flex-1 px-5">

        {/* ─── ① メインタイプカード ─── */}
        <div
          className="mt-6 rounded-3xl p-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${typeData.colorLight}, #FFFFFF)`,
            border: `2px solid ${typeData.color}25`,
            ...fadeIn(0),
          }}
        >
          <div className="text-5xl mb-3">{typeData.emoji}</div>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: typeData.color }}>
            {engineInfo.emoji} {result.engineType} × {runningInfo.emoji} {result.runningType}
          </p>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#1C1A2E" }}>
            {typeData.title}
          </h1>
          <div
            className="rounded-2xl px-4 py-3 mb-3 mt-2"
            style={{ background: "rgba(255,255,255,0.75)" }}
          >
            <p className="text-base font-medium italic" style={{ color: "#1C1A2E" }}>
              「{typeData.catchphrase}」
            </p>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#3C3A5E" }}>
            {typeData.summary}
          </p>
        </div>

        {/* ─── タブナビ ─── */}
        <div
          className="mt-5 flex rounded-2xl p-1 gap-1"
          style={{ background: "#F3F1FC", ...fadeIn(0.1) }}
        >
          {(["overview", "axes", "advice"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-tap-highlight"
              style={{
                background: activeTab === tab ? "#FFFFFF" : "transparent",
                color: activeTab === tab ? "#1C1A2E" : "#7B78A0",
                boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {tab === "overview" ? "まとめ" : tab === "axes" ? "7つの軸" : "アドバイス"}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════
            タブ：まとめ
        ══════════════════════════════════ */}
        {activeTab === "overview" && (
          <div style={fadeIn(0.15)}>

            {/* ③ 一目で分かるまとめ */}
            <div className="card mt-4">
              <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>📋 あなたの特性まとめ</h2>
              <div className="space-y-3">
                <SummaryRow label="強みは" value={typeData.strengths.join("、")} color={typeData.color} />
                <SummaryRow label="気をつけること" value={typeData.weaknesses} color="#7B78A0" />
                <SummaryRow label="武器3つ" value={typeData.weapons.join(" / ")} color={typeData.color} />
              </div>
            </div>

            {/* ⑥ HP/MP */}
            <div className="card mt-4">
              <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>📊 ステータス</h2>
              <div className="space-y-3">
                <HPMPBar label="HP（行動力）" value={result.hp} color="#E05252" />
                <HPMPBar label="MP（精神エネルギー）" value={result.mp} color="#9060E0" />
              </div>
              <p className="text-xs mt-3" style={{ color: "#B0ACC8" }}>
                ※ 毎日のセルフチェックで更新されます
              </p>
            </div>

            {/* ⑤ 欲求バランス */}
            <div className="card mt-4">
              <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>💎 あなたの欲求バランス</h2>
              <div className="space-y-2.5">
                {result.desireRanking.map((desire, rank) => {
                  const info = DESIRE_INFO[desire];
                  const score = result.scores.desire[desire];
                  const maxScore = 5;
                  const percent = Math.round((score / maxScore) * 100);
                  return (
                    <div key={desire}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">
                          {rank === 0 && <span className="text-xs mr-1" style={{ color: "#F5A623" }}>1位</span>}
                          {info.emoji} {info.label}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "#7B78A0" }}>
                          {score}/{maxScore}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ background: "#E8E4F8" }}>
                        <div
                          className="h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${percent}%`,
                            background: rank === 0 ? "#9060E0" : "#B8A8E8",
                          }}
                        />
                      </div>
                      {rank === 0 && (
                        <p className="text-xs mt-1" style={{ color: "#7B78A0" }}>
                          {info.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⑧ 相性の良いタイプ */}
            {goodWithTypes.length > 0 && (
              <div className="card mt-4">
                <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>🤝 相性の良いタイプ</h2>
                <div className="space-y-2">
                  {goodWithTypes.map((t) => (
                    <div
                      key={t.typeKey}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: t.colorLight }}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: t.color }}>{t.title}</p>
                        <p className="text-xs" style={{ color: "#7B78A0" }}>
                          {t.engineType} × {t.runningType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            タブ：7つの軸
        ══════════════════════════════════ */}
        {activeTab === "axes" && (
          <div style={fadeIn(0.1)}>

            {/* エンジン */}
            <AxisCard
              emoji={engineInfo.emoji}
              title={`エンジン：${result.engineType}`}
              subtitle="あなたを動かす原動力"
              content={engineInfo.description}
              color={engineInfo.color}
              detail={`スコア内訳：${Object.entries(result.scores.engine)
                .sort(([,a],[,b]) => b - a)
                .map(([k, v]) => `${k}(${v})`)
                .join(" / ")}`}
            />

            {/* 走行スタイル */}
            <AxisCard
              emoji={runningInfo.emoji}
              title={`走行スタイル：${result.runningType}`}
              subtitle="あなたの進み方"
              content={runningInfo.description}
              color="#4A90E2"
              detail={`スコア内訳：${Object.entries(result.scores.running)
                .sort(([,a],[,b]) => b - a)
                .map(([k, v]) => `${k}(${v})`)
                .join(" / ")}`}
            />

            {/* ブレーキ */}
            <AxisCard
              emoji={brakeInfo.emoji}
              title={brakeInfo.label}
              subtitle="あなたが止まる理由"
              content={brakeInfo.advice}
              color="#7B78A0"
            />

            {/* 充電スタイル */}
            <AxisCard
              emoji={rechargeInfo.emoji}
              title={`充電スタイル：${result.rechargeType}充電`}
              subtitle="あなたの回復の仕方"
              content={rechargeInfo.description}
              color="#E89B3A"
            />

            {/* コンパス */}
            <AxisCard
              emoji={compassInfo.emoji}
              title={`コンパス：${result.compassType}`}
              subtitle="あなたが大切にするもの"
              content={compassInfo.description}
              color="#38A169"
            />

            {/* 欲求トップ3 */}
            <div className="card mt-4">
              <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>
                💎 欲求バランス TOP3
              </h2>
              <div className="space-y-2">
                {result.desireRanking.slice(0, 3).map((desire, i) => {
                  const info = DESIRE_INFO[desire];
                  return (
                    <div key={desire} className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: i === 0 ? "#9060E0" : i === 1 ? "#B8A8E8" : "#DDD8F8",
                          color: i === 0 ? "#FFFFFF" : "#7C5CDB",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-lg">{info.emoji}</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>{info.label}</p>
                        <p className="text-xs" style={{ color: "#7B78A0" }}>{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            タブ：アドバイス
        ══════════════════════════════════ */}
        {activeTab === "advice" && (
          <div style={fadeIn(0.1)}>

            <div className="card mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💼</span>
                <h2 className="text-sm font-semibold" style={{ color: "#7B78A0" }}>就活アドバイス</h2>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "#1C1A2E" }}>
                {typeData.jobAdvice}
              </p>
            </div>

            <div className="card mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🚀</span>
                <h2 className="text-sm font-semibold" style={{ color: "#7B78A0" }}>起業・副業アドバイス</h2>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "#1C1A2E" }}>
                {typeData.bizAdvice}
              </p>
            </div>

            <div className="card mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🌿</span>
                <h2 className="text-sm font-semibold" style={{ color: "#7B78A0" }}>人生設計アドバイス</h2>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "#1C1A2E" }}>
                {typeData.lifeAdvice}
              </p>
            </div>

            {/* 気をつけること + 対処法 */}
            <div className="card mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🌑</span>
                <h2 className="text-sm font-semibold" style={{ color: "#7B78A0" }}>気をつけること</h2>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "#1C1A2E" }}>
                {typeData.weaknesses}
              </p>
              <div
                className="mt-3 rounded-xl px-4 py-3"
                style={{ background: brakeInfo.emoji === "🟢" ? "#F0FFF4" : "#FFF8EE" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "#7B78A0" }}>ブレーキへの対処</p>
                <p className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>
                  {brakeInfo.advice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── CTAボタン ─── */}
        <div className="mt-8 space-y-3" style={fadeIn(0.3)}>
          <Link
            href={`/register?engine=${result.engineType}&running=${result.runningType}`}
            className="btn-primary block text-center no-tap-highlight"
          >
            登録して、自分のトリセツを完成させる →
          </Link>
          <button
            onClick={() => {
              const text = `AZ Deep診断結果：${typeData.title}（${result.engineType} × ${result.runningType}）\n「${typeData.catchphrase}」`;
              if (navigator.share) {
                navigator.share({ text, title: "AZ Deep 診断結果" });
              } else {
                navigator.clipboard.writeText(text);
                alert("コピーしました！");
              }
            }}
            className="w-full py-3 rounded-2xl text-sm font-medium no-tap-highlight transition-all active:scale-95"
            style={{ border: "1.5px solid #7C5CDB", color: "#7C5CDB", background: "#FFFFFF" }}
          >
            結果をシェアする
          </button>
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

// ─── サブコンポーネント ──────────────────────────────────────────

function SummaryRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs font-semibold mb-1" style={{ color: "#7B78A0" }}>{label}</p>
      <p className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>{value}</p>
    </div>
  );
}

function HPMPBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm" style={{ color: "#7B78A0" }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: "#1C1A2E" }}>{value}/10</span>
      </div>
      <div className="w-full h-2.5 rounded-full" style={{ background: "#E8E4F8" }}>
        <div
          className="h-2.5 rounded-full transition-all duration-1000"
          style={{
            width: `${(value / 10) * 100}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

function AxisCard({
  emoji, title, subtitle, content, color, detail,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  content: string;
  color: string;
  detail?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="card mt-4 w-full text-left no-tap-highlight"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color }}>{title}</p>
            <p className="text-xs" style={{ color: "#7B78A0" }}>{subtitle}</p>
          </div>
        </div>
        <svg
          className="w-4 h-4 transition-transform"
          style={{ color: "#7B78A0", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none" viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      {open && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid #E8E4F8" }}>
          <p className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>{content}</p>
          {detail && (
            <p className="text-xs mt-2" style={{ color: "#B0ACC8" }}>{detail}</p>
          )}
        </div>
      )}
    </button>
  );
}
