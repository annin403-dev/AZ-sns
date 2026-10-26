"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BRAKE_INFO,
  BRAKE_QUESTIONS,
  BRAKE_SCALE,
  scoreBrake,
  type BrakeResult,
  type BrakeType,
} from "@/lib/brake/data";
import { saveBrakeResult } from "@/app/actions/brake";

/**
 * ブレーキ診断（メンタルブロック診断）
 *
 * 8問で「なぜ今動けないのか？」を4つのブレーキで可視化する
 * 登録なしでも受けられる。ログイン済みなら結果を保存してロードマップに使う
 */
export default function BrakeDiagnosisPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<BrakeResult | null>(null);
  const [saved, setSaved] = useState(false);

  const question = BRAKE_QUESTIONS[index];
  const progress = (index / BRAKE_QUESTIONS.length) * 100;

  async function handleAnswer(value: number) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);

    if (index < BRAKE_QUESTIONS.length - 1) {
      setIndex(index + 1);
      return;
    }

    const scored = scoreBrake(next);
    setResult(scored);
    // 未ログイン・保存失敗でも結果はそのまま見せる
    const res = await saveBrakeResult(scored).catch(() => ({ saved: false }));
    setSaved(res.saved);
  }

  if (result) {
    return <BrakeResultView result={result} saved={saved} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold mb-1" style={{ color: "#7C5CDB" }}>
          🧠 ブレーキ診断
        </p>
        <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
          いま、何があなたを止めている？
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          正解はありません。直感で選んでね（8問・1分）
        </p>
        <div className="w-full h-1.5 rounded-full mt-4" style={{ background: "#E8E4F8" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#7C5CDB" }}
          />
        </div>
      </header>

      <main className="flex-1 px-5 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs mb-2" style={{ color: "#B0ACC8" }}>
              Q{index + 1} / {BRAKE_QUESTIONS.length}
            </p>
            <div className="card-lg mb-6">
              <p className="text-lg font-bold leading-relaxed" style={{ color: "#1C1A2E" }}>
                {question.text}
              </p>
            </div>
            <div className="space-y-3">
              {BRAKE_SCALE.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full py-4 rounded-2xl text-base font-semibold active:scale-95 transition-all no-tap-highlight"
                  style={{
                    background: "#FFFFFF",
                    border: "1.5px solid #E8E4F8",
                    color: "#1C1A2E",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {index > 0 && (
              <button
                onClick={() => setIndex(index - 1)}
                className="btn-ghost mt-4 w-full no-tap-highlight"
              >
                ← ひとつ戻る
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function BrakeResultView({ result, saved }: { result: BrakeResult; saved: boolean }) {
  const info = BRAKE_INFO[result.primary];
  const second = result.secondary ? BRAKE_INFO[result.secondary] : null;
  const maxScore = 6; // 1ブレーキあたり2問 × 最大3点

  return (
    <div className="min-h-screen pb-16" style={{ background: "#FAF9FF" }}>
      <main className="px-5 pt-12 space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl p-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${info.colorLight}, #FFFFFF)`,
            border: `1.5px solid ${info.color}40`,
          }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: info.color }}>
            あなたのいまのブレーキ
          </p>
          <div className="text-5xl mb-2">{info.emoji}</div>
          <h1 className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
            {info.nickname}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
            {info.name}
            {second && ` ＋ ${second.name}`}
          </p>
        </motion.div>

        {/* 安全基地メッセージ */}
        <div className="card">
          <p className="text-xs font-semibold mb-2" style={{ color: "#7C5CDB" }}>
            ✨ AZより
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#1C1A2E" }}>
            {info.safeMessage}
          </p>
        </div>

        {/* 脳科学の説明 */}
        <div className="card">
          <p className="text-sm font-bold mb-2" style={{ color: "#1C1A2E" }}>
            🧠 脳の中で起きていること
          </p>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#4A4766" }}>
            {info.brainNote}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#4A4766" }}>
            脳には「いつも通り」を守ろうとする現状維持本能（ステータスクオ・バイアス）があります。
            動けないのは、あなたがダメだからではなく、脳が必死にあなたを守ろうとしているだけ。
          </p>
        </div>

        {/* スコア */}
        <div className="card">
          <p className="text-sm font-bold mb-3" style={{ color: "#1C1A2E" }}>
            ブレーキの強さ
          </p>
          <div className="space-y-2">
            {(Object.keys(BRAKE_INFO) as BrakeType[]).map((type) => {
              const b = BRAKE_INFO[type];
              const pct = (result.scores[type] / maxScore) * 100;
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#1C1A2E" }}>
                      {b.emoji} {b.name}
                    </span>
                    <span style={{ color: "#7B78A0" }}>
                      {result.scores[type]}/{maxScore}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: "#F3F1FC" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, background: b.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 進み方 */}
        <div className="card">
          <p className="text-sm font-bold mb-2" style={{ color: "#1C1A2E" }}>
            🌱 あなたに合う一歩の作り方
          </p>
          <p className="text-sm mb-3" style={{ color: "#4A4766" }}>
            {info.stepStyle}
          </p>
          <div className="space-y-2">
            {info.sampleSteps.map((s) => (
              <div
                key={s}
                className="px-3 py-2 rounded-xl text-sm"
                style={{ background: info.colorLight, color: "#1C1A2E" }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {saved ? (
          <Link
            href={`/roadmap?brake=${result.primary}`}
            className="btn-primary block text-center no-tap-highlight"
          >
            このブレーキに合わせて90日ロードマップを作る →
          </Link>
        ) : (
          <Link href="/register" className="btn-primary block text-center no-tap-highlight">
            登録して、あなた専用のロードマップを作る →
          </Link>
        )}
        <Link href="/home" className="btn-ghost block text-center no-tap-highlight">
          ホームへ
        </Link>
      </main>
    </div>
  );
}
