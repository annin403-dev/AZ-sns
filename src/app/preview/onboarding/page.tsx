"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Screen = "card-a" | "card-b" | "card-c" | "card-d" | "reveal";

export default function PreviewOnboarding() {
  const [screen, setScreen] = useState<Screen>("card-a");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedDrains, setSelectedDrains] = useState<string[]>([]);
  const [subStep, setSubStep] = useState<"sources" | "drains">("sources");

  const progress = { "card-a": 0, "card-b": 25, "card-c": 50, "card-d": 75, "reveal": 100 }[screen];

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12082a] to-[#0a0a0f] flex flex-col">
      {/* ヘッダー */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-az-gold" style={{ textShadow: "0 0 20px rgba(240,192,96,0.8)" }}>AZ</h1>
          <span className="text-az-subtle text-sm">
            {screen === "reveal" ? "完了" : `${["card-a","card-b","card-c","card-d"].indexOf(screen) + 1}/4`}
          </span>
        </div>
        <div className="h-1 bg-az-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-az-glow to-az-mystic rounded-full"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* Card A */}
          {screen === "card-a" && (
            <motion.div key="card-a" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="space-y-5 py-4">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-az-glow/20 text-az-glow text-xs mb-3">
                  Card A · エネルギー棚卸し
                </div>
                {subStep === "sources" ? (
                  <>
                    <h2 className="text-xl font-bold text-az-text mb-2">
                      やった後に<span className="text-az-aurora">エネルギーが増える</span>行為はどれ？
                    </h2>
                    <p className="text-az-subtle text-sm">複数選択OK</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-az-text mb-2">
                      やる前から<span className="text-az-flame">気が重い</span>行為はどれ？
                    </h2>
                    <p className="text-az-subtle text-sm">正直に選んで</p>
                  </>
                )}
              </div>
              <div className="flex gap-1 mb-2">
                <div className={`h-1 flex-1 rounded-full ${subStep === "sources" ? "bg-az-glow" : "bg-az-aurora"}`} />
                <div className={`h-1 flex-1 rounded-full ${subStep === "drains" ? "bg-az-flame" : "bg-az-muted"}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(subStep === "sources"
                  ? ["🎨 何かを作る・表現する","📚 新しいことを学ぶ","🤝 誰かを助ける","🧘 一人で静かに過ごす","💬 人と話す・繋がる","🏃 体を動かす","📋 整理・計画を立てる","🌿 自然の中にいる"]
                  : ["🔄 同じことの繰り返し","👥 大人数の場","⚡ 突然の割り込み","💥 対立・摩擦","❓ 曖昧・不明確","📊 他人と比べられる","📝 事務・書類仕事","⏳ 待つ・決まらない"]
                ).map((label) => {
                  const isSelected = subStep === "sources" ? selectedSources.includes(label) : selectedDrains.includes(label);
                  return (
                    <button key={label}
                      onClick={() => {
                        if (subStep === "sources") setSelectedSources(p => p.includes(label) ? p.filter(s => s !== label) : [...p, label]);
                        else setSelectedDrains(p => p.includes(label) ? p.filter(s => s !== label) : [...p, label]);
                      }}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-all active:scale-95
                        ${isSelected ? "border-az-glow bg-az-glow/20 text-white" : "border-az-border bg-az-muted text-az-text"}`}
                      style={isSelected ? { boxShadow: "0 0 15px rgba(96,96,240,0.3)" } : {}}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => subStep === "sources" ? setSubStep("drains") : setScreen("card-b")}
                disabled={subStep === "sources" ? selectedSources.length === 0 : selectedDrains.length === 0}
                className="w-full py-4 rounded-xl font-semibold text-white bg-az-glow disabled:opacity-30"
                style={{ boxShadow: "0 0 20px rgba(96,96,240,0.3)" }}>
                {subStep === "sources" ? "次へ →" : "完了 ✓"}
              </button>
            </motion.div>
          )}

          {/* Card B */}
          {screen === "card-b" && (
            <motion.div key="card-b" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="space-y-5 py-4">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-az-flame/20 text-az-flame text-xs mb-3">
                  Card B · 停止トリガー
                </div>
                <h2 className="text-xl font-bold text-az-text mb-2">
                  物事が止まる瞬間の<br /><span className="text-az-flame">直前</span>、何が起きてる？
                </h2>
                <p className="text-az-subtle text-sm">正直に選ぶほど、AIのサポートが精度UP ✨</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "タスクが曖昧", desc: "何をすればいいかわからない" },
                  { label: "最初の一手が不明", desc: "どこから始めるか迷う" },
                  { label: "疲労・体調", desc: "体が動かない" },
                  { label: "SNS比較後", desc: "他人を見て落ち込んだ" },
                  { label: "孤独感", desc: "誰とも繋がれていない感覚" },
                  { label: "完璧主義", desc: "完璧でないと始められない" },
                ].map(item => (
                  <button key={item.label} onClick={() => setScreen("card-c")}
                    className="w-full text-left px-4 py-3.5 rounded-xl border border-az-border bg-az-muted text-az-text hover:border-az-flame/40 transition-all active:scale-98">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-az-subtle mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Card C */}
          {screen === "card-c" && (
            <motion.div key="card-c" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="space-y-5 py-4">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-az-mystic/20 text-az-mystic text-xs mb-3">
                  Card C · やる気の燃料
                </div>
                <h2 className="text-xl font-bold text-az-text mb-2">
                  今の自分に、どれくらい<span className="text-az-mystic">満たされている</span>？
                </h2>
              </div>
              <div className="bg-az-surface border border-az-border rounded-2xl p-5 space-y-6">
                {[
                  { label: "自律性", sub: "「自分で選んでいる感」がある？", value: 7, color: "#6060f0" },
                  { label: "有能感", sub: "「できる感」が出る領域がある？", value: 5, color: "#40c0a0" },
                  { label: "関係性", sub: "前向きになれる人がいる？", value: 8, color: "#c060f0" },
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="font-medium text-az-text text-sm">{item.label}</div>
                        <div className="text-az-subtle text-xs">{item.sub}</div>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                    </div>
                    <div className="h-2 bg-az-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.value * 10}%`, background: item.color }} />
                    </div>
                    <div className="flex justify-between text-xs text-az-subtle">
                      <span>低い</span><span>高い</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setScreen("card-d")}
                className="w-full py-4 rounded-xl font-semibold text-white bg-az-glow"
                style={{ boxShadow: "0 0 20px rgba(96,96,240,0.3)" }}>次へ →</button>
            </motion.div>
          )}

          {/* Card D */}
          {screen === "card-d" && (
            <motion.div key="card-d" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="space-y-5 py-4">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-az-aurora/20 text-az-aurora text-xs mb-3">
                  Card D · 目標領域
                </div>
                <h2 className="text-xl font-bold text-az-text mb-2">
                  今年、最も向き合いたい<br /><span className="text-az-gold">領域</span>はどれ？
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { emoji: "💼", label: "仕事の成果", desc: "キャリア・副業・昇進" },
                  { emoji: "📚", label: "学習・資格", desc: "スキルアップ・試験合格" },
                  { emoji: "🎨", label: "作品・制作", desc: "創作・プロジェクト" },
                  { emoji: "💪", label: "健康・体", desc: "運動・食事・睡眠" },
                  { emoji: "🌟", label: "人間関係・生活", desc: "繋がり・生活基盤" },
                ].map(area => (
                  <button key={area.label} onClick={() => setScreen("reveal")}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-az-border bg-az-muted hover:border-az-gold/30 transition-all active:scale-98 text-left">
                    <span className="text-2xl">{area.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm text-az-text">{area.label}</div>
                      <div className="text-az-subtle text-xs mt-0.5">{area.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ソウルタイプ発表 */}
          {screen === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 py-8">
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div key={i} className="absolute text-2xl pointer-events-none"
                  style={{ left: `${Math.random() * 100}%` }}
                  animate={{ y: [0, -200], opacity: [0, 1, 0] }}
                  transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity }}>
                  {["✨", "⭐", "💫"][i % 3]}
                </motion.div>
              ))}
              <div>
                <p className="text-az-subtle text-sm mb-4">あなたのソウルタイプは</p>
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                                flex items-center justify-center text-4xl mb-4"
                     style={{ boxShadow: "0 0 30px rgba(96,96,240,0.4), 0 0 60px rgba(192,96,240,0.2)", animation: "pulse 2s infinite" }}>
                  ✨
                </div>
                <h1 className="text-3xl font-bold text-white mb-1" style={{ textShadow: "0 0 20px rgba(96,96,240,0.8)" }}>
                  静寂を守る賢者
                </h1>
              </div>
              <div className="bg-az-surface border border-az-border rounded-2xl p-4 text-left max-w-xs">
                <p className="text-az-text text-sm leading-relaxed">
                  深く考える力と鋭い洞察力を持つあなたは、喧騒の中でも本質を見抜く。孤独に見えて、実は内側に豊かな世界を育てている。
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["深い思考力", "本質を見抜く目", "静かな意思力"].map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-xs bg-az-glow/20 text-az-glow border border-az-glow/30">{s}</span>
                ))}
              </div>
              <div className="bg-az-gold/10 border border-az-gold/30 rounded-xl p-4 max-w-xs">
                <p className="text-az-gold text-xs font-medium mb-1">✦ 輝く方向性</p>
                <p className="text-az-text text-sm">深い専門性を積み上げることで、あなたの洞察は世界を変える力になる。</p>
              </div>
              <button onClick={() => setScreen("card-a")}
                className="w-full py-4 rounded-xl font-bold text-az-bg text-lg"
                style={{ background: "linear-gradient(135deg, #f0c060 0%, #f08020 100%)", boxShadow: "0 0 20px rgba(240,192,96,0.4)" }}>
                旅を始める 🚀
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
