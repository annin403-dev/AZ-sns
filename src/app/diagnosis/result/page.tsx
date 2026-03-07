"use client";

/**
 * 診断結果画面
 *
 * 表示順:
 *   1. キャッチフレーズ
 *   2. タイプ名（Pioneer（挑戦者）形式）
 *   3. あなたについて
 *   4. あなたの強み
 *   5. ハマりやすい罠
 *   6. うまくいく進み方
 *   7. 今のあなたへの一言
 *   8. CTA
 *
 * 非表示:
 *   - オーラ・原動力ラベル（登録後の育成要素として後出し）
 *   - HP / MP（登録後に解放）
 *   - シーカー比率
 *   - 二つ名（title フィールド）
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { runMixedDiagnosis } from "@/lib/diagnosis/scoring";
import { getAZType, JOB_TYPE_INFO } from "@/lib/diagnosis/types-data";
import { TypePixelArt } from "@/components/pixel-art/TypePixelArt";
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

  const jobInfo = JOB_TYPE_INFO[result.jobType];

  // descriptionの段落分割（\n\nで区切る）
  const descParagraphs = typeData.description.split("\n\n").filter(Boolean);
  const trapParagraphs = typeData.trap?.split("\n\n").filter(Boolean) ?? [];
  const howToWinParagraphs = typeData.howToWin?.split("\n\n").filter(Boolean) ?? [];

  const fadeIn = (delayIndex: number) => ({
    opacity:   isLoaded ? 1 : 0,
    transform: isLoaded ? "translateY(0)" : "translateY(12px)",
    transition: `all 0.5s ease-out ${delayIndex * 0.08}s`,
  });

  return (
    <div className="min-h-screen flex flex-col pb-12" style={{ background: "#FAF9FF" }}>

      {/* ヘッダー */}
      <header className="px-5 pt-12 pb-2 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: "#7C5CDB" }}>
          AZ
        </Link>
        <span className="text-sm" style={{ color: "#7B78A0" }}>診断結果</span>
      </header>

      <main className="flex-1 px-5 space-y-4">

        {/* ── 1. キャッチフレーズ ── */}
        <section
          className="mt-6 rounded-3xl px-6 py-8 text-center"
          style={{
            background: `linear-gradient(145deg, ${typeData.auraColorLight} 0%, #FFFFFF 70%)`,
            border: `1.5px solid ${typeData.auraColor}30`,
            ...fadeIn(0),
          }}
        >
          <p
            className="text-xl font-bold leading-snug"
            style={{ color: "#1C1A2E", letterSpacing: "-0.01em" }}
          >
            「{typeData.catchphrase}」
          </p>
        </section>

        {/* ── 2. タイプ名 ── */}
        <section
          className="rounded-3xl px-6 py-6 flex items-center gap-5"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E8E4F8",
            ...fadeIn(1),
          }}
        >
          <TypePixelArt jobType={result.jobType} scale={1.2} />
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "#B0ACC8" }}>
              あなたのタイプ
            </p>
            <p className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
              {result.jobType}
            </p>
            <p className="text-base font-semibold" style={{ color: typeData.auraColor }}>
              {jobInfo.nameJa}
            </p>
          </div>
        </section>

        {/* ── 3. あなたについて ── */}
        <section
          className="card"
          style={fadeIn(2)}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#7B78A0" }}>
            あなたについて
          </h2>
          <div className="space-y-3">
            {descParagraphs.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* ── 4. あなたの強み ── */}
        <section
          className="card"
          style={fadeIn(3)}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#7B78A0" }}>
            あなたの強み
          </h2>
          <div className="space-y-2">
            {typeData.strengths.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: typeData.auraColorLight }}
              >
                <span className="text-sm flex-shrink-0" style={{ color: typeData.auraColor }}>✦</span>
                <span className="text-sm font-medium" style={{ color: "#1C1A2E" }}>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. ハマりやすい罠 ── */}
        {trapParagraphs.length > 0 && (
          <section
            className="card"
            style={fadeIn(4)}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#7B78A0" }}>
              ハマりやすい罠
            </h2>
            <div className="space-y-3">
              {trapParagraphs.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. うまくいく進み方 ── */}
        {howToWinParagraphs.length > 0 && (
          <section
            className="card"
            style={fadeIn(5)}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#7B78A0" }}>
              うまくいく進み方
            </h2>
            <div className="space-y-3">
              {howToWinParagraphs.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ── 7. 今のあなたへの一言 ── */}
        {typeData.messageNow && (
          <section
            className="rounded-3xl px-6 py-6"
            style={{
              background: `linear-gradient(135deg, ${typeData.auraColorLight} 0%, #FFFFFF 100%)`,
              border: `1.5px solid ${typeData.auraColor}25`,
              ...fadeIn(6),
            }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: typeData.auraColor }}>
              今のあなたへ
            </p>
            <p
              className="text-base leading-relaxed font-medium"
              style={{ color: "#1C1A2E" }}
            >
              {typeData.messageNow}
            </p>
          </section>
        )}

        {/* ── 8. CTA ── */}
        <div
          className="pt-2 space-y-3"
          style={fadeIn(7)}
        >
          <Link
            href={`/register?type=${result.jobType}&aura=${encodeURIComponent(result.auraType)}`}
            className="btn-primary block text-center no-tap-highlight"
          >
            登録して、取扱説明書を完成させる →
          </Link>
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
