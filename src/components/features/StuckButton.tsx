"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAlternativeViews, saveStuckRecord } from "@/app/actions/ai-coach";

/** 状況の選択肢 */
const SITUATIONS = [
  "タスクに手が付かない",
  "SNSを見て気分が下がった",
  "気力が湧かない",
  "何から始めればいいかわからない",
  "失敗した・うまくいかなかった",
  "誰かにイライラしている",
];

/** 感情の選択肢 */
const EMOTIONS = [
  { emoji: "😔", label: "落ち込み" },
  { emoji: "😰", label: "不安" },
  { emoji: "😤", label: "イライラ" },
  { emoji: "😶", label: "無気力" },
  { emoji: "😕", label: "モヤモヤ" },
  { emoji: "😞", label: "後悔" },
];

/** 自動思考の選択肢 */
const AUTO_THOUGHTS = [
  "自分はダメだ",
  "また失敗した",
  "どうせうまくいかない",
  "他の人はできているのに",
  "もう遅い・手遅れだ",
  "疲れた・もう無理",
];

/** 次の行動の選択肢 */
const NEXT_ACTIONS = [
  "1分だけ深呼吸する",
  "タスクを1つだけ開く",
  "水を飲む",
  "5分間散歩する",
  "今日できたことを1つ思い出す",
  "誰かに「ありがとう」と言う",
];

type Step = "situation" | "emotion" | "auto_thought" | "alternative" | "action" | "done";

/**
 * 詰まりボタン（Thought Recordフロー）
 * 画面右下に常時表示。タップで5ステップのCBTフローが起動
 */
export default function StuckButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("situation");
  const [situation, setSituation] = useState("");
  const [emotion, setEmotion] = useState("");
  const [autoThought, setAutoThought] = useState("");
  const [alternativeViews, setAlternativeViews] = useState<string[]>([]);
  const [selectedView, setSelectedView] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [loading, setLoading] = useState(false);

  function resetFlow() {
    setStep("situation");
    setSituation("");
    setEmotion("");
    setAutoThought("");
    setAlternativeViews([]);
    setSelectedView("");
    setNextAction("");
    setIsOpen(false);
  }

  async function handleGetAlternatives() {
    setLoading(true);
    const result = await getAlternativeViews(situation, emotion, autoThought);
    if (result.views) {
      setAlternativeViews(result.views);
      setStep("alternative");
    }
    setLoading(false);
  }

  async function handleComplete() {
    await saveStuckRecord({
      situation,
      emotion,
      auto_thought: autoThought,
      alternative_view: selectedView,
      next_action: nextAction,
    });
    setStep("done");
  }

  const stepConfig: Record<Step, { title: string; subtitle: string }> = {
    situation: {
      title: "今、何が起きてる？",
      subtitle: "状況を選んでください",
    },
    emotion: {
      title: "そのとき、どんな感情？",
      subtitle: "正直に選んで",
    },
    auto_thought: {
      title: "頭に浮かんだ考えは？",
      subtitle: "自動的に出てきた言葉",
    },
    alternative: {
      title: "別の見方はどれ？",
      subtitle: "AIが3つ提案します",
    },
    action: {
      title: "次の2分でできることは？",
      subtitle: "小さくていい",
    },
    done: { title: "よくできました ✨", subtitle: "記録完了" },
  };

  const currentConfig = stepConfig[step];

  return (
    <>
      {/* 詰まりボタン（右下固定） */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-24 z-40 w-14 h-14 rounded-full
                   bg-az-flame/90 backdrop-blur-sm shadow-lg
                   flex items-center justify-center
                   hover:bg-az-flame active:scale-95 transition-all duration-200"
        style={{ boxShadow: "0 0 20px rgba(240, 96, 64, 0.5)" }}
        aria-label="詰まりボタン"
      >
        <span className="text-xl">🆘</span>
      </button>

      {/* モーダル */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* オーバーレイ */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={resetFlow}
            />

            {/* シート */}
            <motion.div
              className="relative w-full max-h-[85vh] bg-az-surface rounded-t-3xl
                         border-t border-az-border overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6 space-y-5">
                {/* ハンドル */}
                <div className="w-10 h-1 bg-az-border rounded-full mx-auto" />

                {/* ヘッダー */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-az-flame text-lg">🆘</span>
                    <h2 className="text-az-text font-bold text-lg">
                      {currentConfig.title}
                    </h2>
                  </div>
                  <p className="text-az-subtle text-sm">{currentConfig.subtitle}</p>
                </div>

                {/* ステップ進捗 */}
                <div className="flex gap-1">
                  {(["situation", "emotion", "auto_thought", "alternative", "action"] as Step[]).map(
                    (s, i) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          step === "done" ||
                          ["situation", "emotion", "auto_thought", "alternative", "action"].indexOf(step) > i
                            ? "bg-az-aurora"
                            : step === s
                            ? "bg-az-flame"
                            : "bg-az-muted"
                        }`}
                      />
                    )
                  )}
                </div>

                {/* ステップコンテンツ */}
                {step === "situation" && (
                  <div className="space-y-2">
                    {SITUATIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSituation(s);
                          setStep("emotion");
                        }}
                        className="choice-btn text-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {step === "emotion" && (
                  <div className="grid grid-cols-3 gap-2">
                    {EMOTIONS.map((e) => (
                      <button
                        key={e.label}
                        onClick={() => {
                          setEmotion(e.label);
                          setStep("auto_thought");
                        }}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl
                                   border border-az-border bg-az-muted
                                   hover:border-az-flame/40 active:scale-95 transition-all"
                      >
                        <span className="text-2xl">{e.emoji}</span>
                        <span className="text-xs text-az-subtle">{e.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {step === "auto_thought" && (
                  <div className="space-y-2">
                    {AUTO_THOUGHTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setAutoThought(t);
                          handleGetAlternatives();
                        }}
                        className="choice-btn text-sm"
                      >
                        {t}
                      </button>
                    ))}
                    {loading && (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-az-glow border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}

                {step === "alternative" && (
                  <div className="space-y-2">
                    {alternativeViews.map((view) => (
                      <button
                        key={view}
                        onClick={() => {
                          setSelectedView(view);
                          setStep("action");
                        }}
                        className="choice-btn text-sm"
                      >
                        💡 {view}
                      </button>
                    ))}
                  </div>
                )}

                {step === "action" && (
                  <div className="space-y-2">
                    {NEXT_ACTIONS.map((action) => (
                      <button
                        key={action}
                        onClick={() => {
                          setNextAction(action);
                          handleComplete();
                        }}
                        className="choice-btn text-sm"
                      >
                        ▶ {action}
                      </button>
                    ))}
                  </div>
                )}

                {step === "done" && (
                  <div className="text-center py-6 space-y-4">
                    <div className="text-6xl">🌟</div>
                    <p className="text-az-text font-semibold">
                      詰まりを乗り越えた証拠が<br />記録されました
                    </p>
                    <p className="text-az-subtle text-sm">
                      次の行動：<span className="text-az-aurora font-medium">{nextAction}</span>
                    </p>
                    <button
                      onClick={resetFlow}
                      className="w-full py-3 rounded-xl bg-az-glow text-white font-semibold btn-glow"
                    >
                      閉じる
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
