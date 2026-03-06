"use client";

/**
 * AZタイプ診断画面
 *
 * 1問1画面で12問を順番に表示する
 * 回答はlocalStorageに保存（登録なしでもできる）
 * 全問回答後、結果画面へ遷移
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DIAGNOSIS_QUESTIONS } from "@/lib/diagnosis/questions";
import type { DiagnosisAnswers } from "@/lib/diagnosis/scoring";

// ─── localStorageのキー ──────────────────────────────────────
const STORAGE_KEY = "az_diagnosis_answers";

// ─── コンポーネント ──────────────────────────────────────────

export default function DiagnosisPage() {
  const router = useRouter();

  // 現在の問題番号（0始まり）
  const [currentIndex, setCurrentIndex] = useState(0);
  // 選択した回答をすべて保持
  const [answers, setAnswers] = useState<DiagnosisAnswers>({});
  // 今の問題で選択した選択肢（タップしたとき一瞬ハイライト）
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // アニメーション用（問題切り替え時）
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = DIAGNOSIS_QUESTIONS[currentIndex];
  const totalQuestions = DIAGNOSIS_QUESTIONS.length;
  const progress = (currentIndex / totalQuestions) * 100;

  // ─── 選択肢をタップしたとき ──────────────────────────────

  const handleSelect = (optionId: string) => {
    if (isAnimating) return; // アニメーション中は操作を受け付けない

    setSelectedId(optionId);

    // 少し待ってから次の問題へ（選択感を出すため0.4秒）
    setTimeout(() => {
      const newAnswers = {
        ...answers,
        [currentQuestion.id]: optionId,
      };
      setAnswers(newAnswers);

      if (currentIndex < totalQuestions - 1) {
        // 次の問題へ
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setSelectedId(null);
          setIsAnimating(false);
        }, 200);
      } else {
        // 全問回答完了 → 結果を保存して結果画面へ
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
        router.push("/diagnosis/result");
      }
    }, 400);
  };

  // ─── 戻るボタン ──────────────────────────────────────────

  const handleBack = () => {
    if (currentIndex === 0) {
      router.push("/"); // 最初の問題なら、ランディングへ戻る
    } else {
      setCurrentIndex(currentIndex - 1);
      setSelectedId(null);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#FAF9FF" }}
    >
      {/* ─── ヘッダー（進捗バー + 問題番号） ─── */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-4">
          {/* 戻るボタン */}
          <button
            onClick={handleBack}
            className="p-2 rounded-xl no-tap-highlight"
            style={{ color: "#7B78A0" }}
            aria-label="前の問題に戻る"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <path
                d="M15 19L8 12L15 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 問題番号 */}
          <span className="text-sm font-medium" style={{ color: "#7B78A0" }}>
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* 進捗バー */}
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* ─── メインコンテンツ（問題 + 選択肢） ─── */}
      <main
        className="flex-1 flex flex-col px-5 pb-8"
        style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 0.2s" }}
      >
        {/* 問題文 */}
        <div className="mt-8 mb-8">
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

        {/* 選択肢リスト */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`choice-btn ${isSelected ? "selected" : ""}`}
                disabled={isAnimating}
              >
                <div className="flex items-start gap-3">
                  {/* 選択肢ラベル（A/B/C/D） */}
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold mt-0.5"
                    style={{
                      background: isSelected ? "#7C5CDB" : "#EDE9F9",
                      color: isSelected ? "#FFFFFF" : "#7C5CDB",
                      transition: "all 0.2s",
                    }}
                  >
                    {option.id.toUpperCase()}
                  </span>
                  {/* 選択肢テキスト */}
                  <span className="text-base leading-relaxed">
                    {option.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* ─── フッター（AZロゴ） ─── */}
      <footer className="text-center pb-6">
        <span className="text-sm font-semibold" style={{ color: "#7C5CDB" }}>
          AZ
        </span>
        <span className="text-xs ml-1" style={{ color: "#B0ACC8" }}>
          タイプ診断
        </span>
      </footer>
    </div>
  );
}
