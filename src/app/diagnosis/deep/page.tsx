"use client";

/**
 * AZ Deep 診断画面
 * 29問 × 7軸の質問を1問1画面で表示する
 * 回答はlocalStorageに保存（登録なしでもOK）
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AZ_DEEP_QUESTIONS } from "@/lib/diagnosis/az-deep-questions";
import type { DeepAnswers } from "@/lib/diagnosis/az-deep-scoring";

const STORAGE_KEY = "az_deep_answers";

// ─── 軸ごとの色設定 ──────────────────────────────────────────────
const AXIS_COLORS: Record<string, { primary: string; light: string }> = {
  engine:   { primary: "#E05252", light: "#FFF0F0" },
  running:  { primary: "#4A90E2", light: "#EEF5FF" },
  brake:    { primary: "#7B78A0", light: "#F0EFF8" },
  recharge: { primary: "#E89B3A", light: "#FFF8EE" },
  compass:  { primary: "#38A169", light: "#F0FFF4" },
  desire:   { primary: "#9060E0", light: "#F5EEFF" },
};

// ─── 軸ラベルマップ ──────────────────────────────────────────────
const AXIS_SECTIONS: Record<string, string> = {
  engine:   "あなたを動かすもの",
  running:  "あなたの進み方",
  brake:    "あなたが止まる理由",
  recharge: "あなたの回復の仕方",
  compass:  "あなたが大切にするもの",
  desire:   "あなたの内なる欲求",
};

export default function DeepDiagnosisPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<DeepAnswers>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAxisBanner, setShowAxisBanner] = useState(true);

  const currentQuestion = AZ_DEEP_QUESTIONS[currentIndex];
  const total = AZ_DEEP_QUESTIONS.length;
  const progress = ((currentIndex) / total) * 100;

  const colors = AXIS_COLORS[currentQuestion.axis];

  // 前の軸と比較して、軸が変わったかどうか
  const prevAxis = currentIndex > 0 ? AZ_DEEP_QUESTIONS[currentIndex - 1].axis : null;
  const axisChanged = prevAxis !== currentQuestion.axis;

  const handleSelect = (optionId: string) => {
    if (isAnimating) return;
    setSelectedId(optionId);

    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: optionId };
      setAnswers(newAnswers);

      if (currentIndex < total - 1) {
        setIsAnimating(true);
        setShowAxisBanner(AZ_DEEP_QUESTIONS[currentIndex + 1].axis !== currentQuestion.axis);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setSelectedId(null);
          setIsAnimating(false);
        }, 220);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
        router.push("/diagnosis/deep/result");
      }
    }, 380);
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      router.push("/");
    } else {
      setCurrentIndex(currentIndex - 1);
      setSelectedId(null);
    }
  };

  // 現在の軸の質問数と、その軸内の何問目かを計算
  const questionsInAxis = AZ_DEEP_QUESTIONS.filter(
    (q) => q.axis === currentQuestion.axis
  );
  const axisQuestionIndex = questionsInAxis.findIndex(
    (q) => q.id === currentQuestion.id
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF9FF" }}>

      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl no-tap-highlight"
            style={{ color: "#7B78A0" }}
            aria-label="戻る"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex-1">
            {/* 全体進捗バー */}
            <div className="progress-bar-bg mb-1">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "#7B78A0" }}>
                {currentIndex + 1} / {total}
              </span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: colors.light, color: colors.primary }}
              >
                {currentQuestion.axisLabel}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 軸セクションバナー（軸が変わった最初の1問のみ） ─── */}
      {axisChanged && axisQuestionIndex === 0 && (
        <div
          className="mx-5 mb-3 rounded-2xl px-4 py-3"
          style={{ background: colors.light, border: `1.5px solid ${colors.primary}30` }}
        >
          <p className="text-xs font-semibold" style={{ color: colors.primary }}>
            {currentQuestion.axisLabel} — {AXIS_SECTIONS[currentQuestion.axis]}
          </p>
          <div className="flex gap-1 mt-1.5">
            {questionsInAxis.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full flex-1 transition-all duration-300"
                style={{
                  background: i <= axisQuestionIndex ? colors.primary : `${colors.primary}30`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── 質問 + 選択肢 ─── */}
      <main
        className="flex-1 flex flex-col px-5 pb-8"
        style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 0.22s" }}
      >
        {/* 問題文 */}
        <div className="mt-4 mb-8">
          <p
            className="text-2xl font-bold leading-relaxed whitespace-pre-line"
            style={{ color: "#1C1A2E" }}
          >
            {currentQuestion.text}
          </p>
          {currentQuestion.subText && (
            <p className="mt-2 text-sm" style={{ color: "#7B78A0" }}>
              {currentQuestion.subText}
            </p>
          )}
        </div>

        {/* 選択肢 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={isAnimating}
                className="w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 active:scale-95 no-tap-highlight"
                style={{
                  border: `2px solid ${isSelected ? colors.primary : "#E8E4F8"}`,
                  background: isSelected ? colors.light : "#FFFFFF",
                  boxShadow: isSelected ? `0 0 0 3px ${colors.primary}18` : "none",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold mt-0.5"
                    style={{
                      background: isSelected ? colors.primary : "#EDE9F9",
                      color: isSelected ? "#FFFFFF" : "#7C5CDB",
                      transition: "all 0.2s",
                    }}
                  >
                    {option.id.toUpperCase()}
                  </span>
                  <span className="text-base leading-relaxed" style={{ color: "#1C1A2E" }}>
                    {option.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* ─── フッター ─── */}
      <footer className="text-center pb-6">
        <span className="text-sm font-semibold" style={{ color: "#7C5CDB" }}>AZ</span>
        <span className="text-xs ml-1" style={{ color: "#B0ACC8" }}>Deep</span>
      </footer>
    </div>
  );
}
