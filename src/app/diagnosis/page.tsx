"use client";

/**
 * AZタイプ診断画面（スライダー式）
 *
 * 1問1画面で15問を順番に表示する
 * 各問は左極↔右極の5段階スペクトラムで回答
 * 全問回答後、結果画面へ遷移
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SLIDER_QUESTIONS } from "@/lib/diagnosis/questions";
import type { SliderAnswers } from "@/lib/diagnosis/scoring";

const STORAGE_KEY = "az_slider_answers";

const POSITIONS = [1, 2, 3, 4, 5] as const;

export default function DiagnosisPage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SliderAnswers>({});
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = SLIDER_QUESTIONS[currentIndex];
  const totalQuestions = SLIDER_QUESTIONS.length;
  const progress = (currentIndex / totalQuestions) * 100;

  // ── 毎回まっさらな状態で開始（bfcache対策込み） ───────────
  useEffect(() => {
    const reset = () => {
      setCurrentIndex(0);
      setAnswers({});
      setSelectedPos(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("az_diagnosis_answers");
    };

    reset();

    // iPhoneの「戻る」でキャッシュから復元されたときも強制リセット
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) reset();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ポジション選択 ─────────────────────────────────────────

  const handleSelect = (pos: number) => {
    if (isAnimating) return;

    setSelectedPos(pos);

    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: pos };
      setAnswers(newAnswers);

      if (currentIndex < totalQuestions - 1) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setSelectedPos(null);
          setIsAnimating(false);
        }, 200);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
        router.push("/diagnosis/result");
      }
    }, 350);
  };

  // ── 戻るボタン ────────────────────────────────────────────

  const handleBack = () => {
    if (currentIndex === 0) {
      router.push("/");
    } else {
      setCurrentIndex(currentIndex - 1);
      setSelectedPos(answers[SLIDER_QUESTIONS[currentIndex - 1].id] ?? null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF9FF" }}>

      {/* ─── ヘッダー ─── */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-4">
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
          <span className="text-sm font-medium" style={{ color: "#7B78A0" }}>
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* ─── メインコンテンツ ─── */}
      <main
        className="flex-1 flex flex-col px-5 pb-8"
        style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 0.2s" }}
      >
        {/* 問題文 */}
        <div className="mt-10 mb-12 text-center">
          <p
            className="text-2xl font-bold leading-relaxed"
            style={{ color: "#1C1A2E", letterSpacing: "-0.01em" }}
          >
            {currentQuestion.text}
          </p>
        </div>

        {/* スペクトラムセレクター */}
        <div
          className="rounded-3xl px-6 py-8 mx-0"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E8E4F8",
            boxShadow: "0 2px 20px rgba(124, 92, 219, 0.06)",
          }}
        >
          {/* 左右ラベル */}
          <div className="flex justify-between mb-6">
            <span
              className="text-sm font-medium leading-tight"
              style={{ color: "#7C5CDB", maxWidth: "40%" }}
            >
              {currentQuestion.leftLabel}
            </span>
            <span
              className="text-sm font-medium leading-tight text-right"
              style={{ color: "#5B8AF0", maxWidth: "40%" }}
            >
              {currentQuestion.rightLabel}
            </span>
          </div>

          {/* ドット列 */}
          <div className="relative flex items-center justify-between px-2">
            {/* 繋ぎ線 */}
            <div
              className="absolute"
              style={{
                left: "calc(10% + 4px)",
                right: "calc(10% + 4px)",
                height: "2px",
                background: "linear-gradient(90deg, #C8B9F0 0%, #9DB8F8 100%)",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 0,
              }}
            />

            {POSITIONS.map((pos) => {
              const isSelected = selectedPos === pos;
              const isMiddle = pos === 3;

              return (
                <button
                  key={pos}
                  onClick={() => handleSelect(pos)}
                  disabled={isAnimating}
                  className="no-tap-highlight"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: "20%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 0",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-label={`ポジション ${pos}`}
                >
                  <div
                    style={{
                      width: isMiddle ? "20px" : "26px",
                      height: isMiddle ? "20px" : "26px",
                      borderRadius: "50%",
                      border: isSelected
                        ? "none"
                        : `2px solid ${isMiddle ? "#C8B9F0" : "#D0C8F0"}`,
                      background: isSelected
                        ? pos <= 2
                          ? "linear-gradient(135deg, #9060E0, #7C5CDB)"
                          : pos === 3
                          ? "linear-gradient(135deg, #9B72E6, #7C8FDB)"
                          : "linear-gradient(135deg, #7C8FDB, #5B8AF0)"
                        : "#FFFFFF",
                      boxShadow: isSelected
                        ? "0 0 0 5px rgba(124, 92, 219, 0.15), 0 2px 8px rgba(124, 92, 219, 0.3)"
                        : "none",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* 軸ラベル */}
          <div className="flex justify-between mt-5 px-2">
            <span className="text-xs" style={{ color: "#B0ACC8" }}>強く左</span>
            <span className="text-xs" style={{ color: "#B0ACC8" }}>中立</span>
            <span className="text-xs" style={{ color: "#B0ACC8" }}>強く右</span>
          </div>
        </div>

        {/* ヒントテキスト */}
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
