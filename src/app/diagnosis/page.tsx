"use client";

/**
 * AZタイプ診断画面（3フォーマット混合・16問）
 *
 * Part1（Q1-6）  バイポーラスライダー：左↔右5段階
 * Part2（Q7-11） シナリオ4択：選択肢をタップ
 * Part3（Q12-16）共感度スライダー：文章への当てはまり度5段階
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MIXED_QUESTIONS, PART_INFO } from "@/lib/diagnosis/questions";
import type { MixedAnswers } from "@/lib/diagnosis/scoring";
import type { DiagnosisQuestion } from "@/lib/diagnosis/questions";

const STORAGE_KEY = "az_mixed_answers";
const POSITIONS = [1, 2, 3, 4, 5] as const;

export default function DiagnosisPage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<MixedAnswers>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = MIXED_QUESTIONS[currentIndex];
  const totalQuestions  = MIXED_QUESTIONS.length;
  const progress        = (currentIndex / totalQuestions) * 100;

  // ── 毎回まっさらな状態で開始（bfcache対策込み） ───────────
  useEffect(() => {
    const doReset = () => {
      setCurrentIndex(0);
      setAnswers({});
      setSelectedAnswer(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("az_slider_answers");
      localStorage.removeItem("az_diagnosis_answers");
    };

    // 初回マウント時にリセット
    doReset();

    // bfcache（Safari「戻る」）で復元された場合もstateをリセット
    // ※ window.location.reload() は使わない（途中問題への in-app 戻るが壊れるため）
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) doReset();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 回答処理（全フォーマット共通） ───────────────────────────

  const handleAnswer = (answer: number | string) => {
    if (isAnimating) return;

    setSelectedAnswer(answer);

    const delay = currentQuestion.type === "scenario" ? 300 : 350;

    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: answer };
      setAnswers(newAnswers);

      if (currentIndex < totalQuestions - 1) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setSelectedAnswer(null);
          setIsAnimating(false);
        }, 200);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
        router.push("/diagnosis/result");
      }
    }, delay);
  };

  // ── 戻るボタン ────────────────────────────────────────────

  const handleBack = () => {
    if (currentIndex === 0) {
      router.push("/");
    } else {
      const prevQ = MIXED_QUESTIONS[currentIndex - 1];
      setCurrentIndex((i) => i - 1);
      setSelectedAnswer(answers[prevQ.id] ?? null);
    }
  };

  // ── パート情報 ─────────────────────────────────────────────

  const currentPart = currentQuestion.part as 1 | 2 | 3;
  const partLabel   = PART_INFO[currentPart].label;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF9FF" }}>

      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl no-tap-highlight"
            style={{ color: "#7B78A0" }}
            aria-label="前の問題に戻る"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "#9B72E6" }}>
                Part {currentPart} · {partLabel}
              </span>
              <span className="text-xs font-medium" style={{ color: "#B0ACC8" }}>
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* ─── メインコンテンツ ─── */}
      <main
        className="flex-1 flex flex-col px-5 pb-8"
        style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 0.2s" }}
      >
        {/* 問題文 */}
        <div className="mt-8 mb-8 text-center">
          <p
            className="text-xl font-bold leading-relaxed whitespace-pre-line"
            style={{ color: "#1C1A2E", letterSpacing: "-0.01em" }}
          >
            {currentQuestion.text}
          </p>
        </div>

        {/* フォーマット別UI */}
        {currentQuestion.type === "bipolar" && (
          <BipolarSelector
            key={currentQuestion.id}
            question={currentQuestion}
            selected={selectedAnswer as number | null}
            onSelect={handleAnswer}
            disabled={isAnimating}
          />
        )}

        {currentQuestion.type === "scenario" && (
          <ScenarioSelector
            key={currentQuestion.id}
            question={currentQuestion}
            selected={selectedAnswer as string | null}
            onSelect={handleAnswer}
            disabled={isAnimating}
          />
        )}

        {currentQuestion.type === "agreement" && (
          <AgreementSelector
            key={currentQuestion.id}
            question={currentQuestion}
            selected={selectedAnswer as number | null}
            onSelect={handleAnswer}
            disabled={isAnimating}
          />
        )}

        <p className="text-center text-xs mt-6" style={{ color: "#C0BBC8" }}>
          直感で選んで大丈夫
        </p>
      </main>

      {/* ─── フッター ─── */}
      <footer className="text-center pb-6">
        <span className="text-sm font-semibold" style={{ color: "#7C5CDB" }}>AZ</span>
        <span className="text-xs ml-1" style={{ color: "#B0ACC8" }}>タイプ診断</span>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Part 1: バイポーラスライダー
// ─────────────────────────────────────────────────────────────

function BipolarSelector({
  question, selected, onSelect, disabled,
}: {
  question: Extract<DiagnosisQuestion, { type: "bipolar" }>;
  selected: number | null;
  onSelect: (pos: number) => void;
  disabled: boolean;
}) {
  return (
    <div
      className="rounded-3xl px-6 py-8"
      style={{
        background: "#FFFFFF",
        border: "1.5px solid #E8E4F8",
        boxShadow: "0 2px 20px rgba(124,92,219,0.06)",
      }}
    >
      {/* 左右ラベル */}
      <div className="flex justify-between mb-7">
        <span className="text-sm font-semibold leading-snug" style={{ color: "#7C5CDB", maxWidth: "42%" }}>
          {question.leftLabel}
        </span>
        <span className="text-sm font-semibold leading-snug text-right" style={{ color: "#5B8AF0", maxWidth: "42%" }}>
          {question.rightLabel}
        </span>
      </div>

      {/* 5ドット */}
      <DotScale
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        leftColor="#7C5CDB"
        rightColor="#5B8AF0"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Part 2: シナリオ4択
// ─────────────────────────────────────────────────────────────

function ScenarioSelector({
  question, selected, onSelect, disabled,
}: {
  question: Extract<DiagnosisQuestion, { type: "scenario" }>;
  selected: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      {question.options.map((option) => {
        const isSelected = selected === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className="w-full text-left px-5 py-4 rounded-2xl no-tap-highlight"
            style={{
              border:      `2px solid ${isSelected ? "#7C5CDB" : "#E8E4F8"}`,
              background:  isSelected ? "#F3F1FC" : "#FFFFFF",
              boxShadow:   isSelected ? "0 0 0 3px rgba(124,92,219,0.12)" : "none",
              transform:   isSelected ? "scale(0.98)" : "scale(1)",
              transition:  "all 0.15s ease",
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold mt-0.5"
                style={{
                  background: isSelected ? "#7C5CDB" : "#EDE9F9",
                  color:      isSelected ? "#FFFFFF"  : "#7C5CDB",
                  transition: "all 0.15s",
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
  );
}

// ─────────────────────────────────────────────────────────────
// Part 3: 共感度スライダー
// ─────────────────────────────────────────────────────────────

function AgreementSelector({
  question, selected, onSelect, disabled,
}: {
  question: Extract<DiagnosisQuestion, { type: "agreement" }>;
  selected: number | null;
  onSelect: (pos: number) => void;
  disabled: boolean;
}) {
  return (
    <div
      className="rounded-3xl px-6 py-7"
      style={{
        background: "#FFFFFF",
        border: "1.5px solid #E8E4F8",
        boxShadow: "0 2px 20px rgba(124,92,219,0.06)",
      }}
    >
      {/* 文章 */}
      <div
        className="rounded-2xl px-4 py-4 mb-7 text-center"
        style={{ background: "#F7F5FE" }}
      >
        <p className="text-base font-semibold leading-relaxed" style={{ color: "#1C1A2E" }}>
          「{question.statement}」
        </p>
      </div>

      {/* スケールラベル */}
      <div className="flex justify-between mb-5 px-1">
        <span className="text-xs font-medium" style={{ color: "#B0ACC8" }}>全くそう思わない</span>
        <span className="text-xs font-medium" style={{ color: "#7C5CDB" }}>とても当てはまる</span>
      </div>

      {/* 5ドット（単色グラデーション） */}
      <DotScale
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        leftColor="#C8BEF0"
        rightColor="#7C5CDB"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 共通：5段階ドットコンポーネント
// ─────────────────────────────────────────────────────────────

function DotScale({
  selected, onSelect, disabled, leftColor, rightColor,
}: {
  selected: number | null;
  onSelect: (pos: number) => void;
  disabled: boolean;
  leftColor: string;
  rightColor: string;
}) {
  // 選択済みポジションの色（左〜右グラデーション補間）
  const dotColors: Record<number, string> = {
    1: leftColor,
    2: leftColor,
    3: "#9B72E6",
    4: rightColor,
    5: rightColor,
  };

  return (
    <div className="relative flex items-center justify-between px-2">
      {/* 繋ぎ線 */}
      <div
        style={{
          position: "absolute",
          left: "calc(10% + 2px)",
          right: "calc(10% + 2px)",
          height: "2px",
          background: `linear-gradient(90deg, ${leftColor}60 0%, ${rightColor}60 100%)`,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 0,
        }}
      />

      {POSITIONS.map((pos) => {
        const isSelected = selected === pos;
        const color = dotColors[pos];
        return (
          <button
            key={pos}
            onClick={() => onSelect(pos)}
            disabled={disabled}
            className="no-tap-highlight"
            style={{
              position: "relative",
              zIndex: 1,
              width: "20%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px 0",
              background: "transparent",
              border: "none",
              cursor: disabled ? "default" : "pointer",
            }}
            aria-label={`${pos}`}
          >
            <div
              style={{
                width:  isSelected ? "28px" : "22px",
                height: isSelected ? "28px" : "22px",
                borderRadius: "50%",
                border:     isSelected ? "none" : "2px solid #D8D2F0",
                background: isSelected ? color : "#FFFFFF",
                boxShadow:  isSelected
                  ? `0 0 0 5px ${color}25, 0 2px 8px ${color}40`
                  : "none",
                transform:  isSelected ? "scale(1)" : "scale(1)",
                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
