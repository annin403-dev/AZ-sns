"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Step = "idle" | "situation" | "emotion" | "thought" | "alternative" | "action" | "done";

export default function PreviewStuck() {
  const [step, setStep] = useState<Step>("idle");

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-az-bg relative">
      {/* ホームの背景（フィード画面のプレビュー） */}
      <div className="px-4 pt-16 space-y-4 opacity-30 pointer-events-none">
        <div className="h-4 bg-az-surface rounded w-3/4" />
        <div className="h-24 bg-az-surface rounded-2xl border border-az-border" />
        <div className="h-20 bg-az-surface rounded-2xl border border-az-border" />
        <div className="h-32 bg-az-surface rounded-2xl border border-az-border" />
      </div>

      {/* 詰まりボタン */}
      <button onClick={() => setStep("situation")}
        className="fixed right-4 bottom-24 z-40 w-16 h-16 rounded-full flex flex-col items-center justify-center"
        style={{ background: "rgba(240,96,64,0.9)", boxShadow: "0 0 25px rgba(240,96,64,0.6)" }}>
        <span className="text-2xl">🆘</span>
        <span className="text-white text-[9px] font-bold mt-0.5">詰まり</span>
      </button>

      {/* ボトムナビ */}
      <div className="fixed bottom-0 left-0 right-0 bg-az-surface/95 border-t border-az-border py-3 z-30">
        <div className="flex justify-around max-w-[390px] mx-auto">
          {["🏠","🔍","＋","👤","💬"].map((icon, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className={`text-xl ${i === 0 ? "" : "opacity-30"}`}>{icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* シートモーダル */}
      {step !== "idle" && (
        <motion.div className="fixed inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setStep("idle")} />
          <motion.div className="relative w-full max-h-[80vh] bg-az-surface rounded-t-3xl border-t border-az-border overflow-y-auto"
            initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 25 }}>
            <div className="p-6 space-y-5">
              <div className="w-10 h-1 bg-az-border rounded-full mx-auto" />

              {/* 進捗バー */}
              <div className="flex gap-1">
                {["situation","emotion","thought","alternative","action"].map((s, i) => {
                  const steps = ["situation","emotion","thought","alternative","action","done"];
                  const current = steps.indexOf(step);
                  return (
                    <div key={s} className={`h-1 flex-1 rounded-full ${current > i ? "bg-az-aurora" : current === i ? "bg-az-flame" : "bg-az-muted"}`} />
                  );
                })}
              </div>

              {step === "situation" && (
                <>
                  <div>
                    <h2 className="text-az-text font-bold text-lg flex items-center gap-2"><span>🆘</span>今、何が起きてる？</h2>
                    <p className="text-az-subtle text-sm">状況を選んでください</p>
                  </div>
                  <div className="space-y-2">
                    {["タスクに手が付かない","SNSを見て気分が下がった","気力が湧かない","何から始めればいいかわからない","失敗した・うまくいかなかった"].map(s => (
                      <button key={s} onClick={() => setStep("emotion")}
                        className="w-full text-left px-4 py-3 rounded-xl border border-az-border bg-az-muted text-az-text text-sm hover:border-az-glow/40 transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "emotion" && (
                <>
                  <div>
                    <h2 className="text-az-text font-bold text-lg">そのとき、どんな感情？</h2>
                    <p className="text-az-subtle text-sm">正直に選んで</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[["😔","落ち込み"],["😰","不安"],["😤","イライラ"],["😶","無気力"],["😕","モヤモヤ"],["😞","後悔"]].map(([emoji, label]) => (
                      <button key={label} onClick={() => setStep("thought")}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border border-az-border bg-az-muted hover:border-az-flame/40 transition-all">
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs text-az-subtle">{label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "thought" && (
                <>
                  <div>
                    <h2 className="text-az-text font-bold text-lg">頭に浮かんだ考えは？</h2>
                    <p className="text-az-subtle text-sm">自動的に出てきた言葉</p>
                  </div>
                  <div className="space-y-2">
                    {["自分はダメだ","また失敗した","どうせうまくいかない","他の人はできているのに","疲れた・もう無理"].map(t => (
                      <button key={t} onClick={() => setStep("alternative")}
                        className="w-full text-left px-4 py-3 rounded-xl border border-az-border bg-az-muted text-az-text text-sm">
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "alternative" && (
                <>
                  <div>
                    <h2 className="text-az-text font-bold text-lg">別の見方はどれ？</h2>
                    <p className="text-az-subtle text-sm">AIが3つ提案します</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      "止まったのは次のステップを考えている証拠",
                      "完璧を求めることへの気づきが生まれている",
                      "コンフォートゾーンを出た直前の自然な反応",
                    ].map(v => (
                      <button key={v} onClick={() => setStep("action")}
                        className="w-full text-left px-4 py-3 rounded-xl border border-az-border bg-az-muted text-az-text text-sm">
                        💡 {v}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "action" && (
                <>
                  <div>
                    <h2 className="text-az-text font-bold text-lg">次の2分でできることは？</h2>
                    <p className="text-az-subtle text-sm">小さくていい</p>
                  </div>
                  <div className="space-y-2">
                    {["1分だけ深呼吸する","タスクを1つだけ開く","水を飲む","5分間散歩する","今日できたことを1つ思い出す"].map(a => (
                      <button key={a} onClick={() => setStep("done")}
                        className="w-full text-left px-4 py-3 rounded-xl border border-az-border bg-az-muted text-az-text text-sm">
                        ▶ {a}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "done" && (
                <div className="text-center py-6 space-y-4">
                  <div className="text-6xl">🌟</div>
                  <p className="text-az-text font-semibold">詰まりを乗り越えた証拠が<br />記録されました</p>
                  <p className="text-az-subtle text-sm">次の行動：<span className="text-az-aurora font-medium">1分だけ深呼吸する</span></p>
                  <button onClick={() => setStep("idle")} className="w-full py-3 rounded-xl bg-az-glow text-white font-semibold">
                    閉じる
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
