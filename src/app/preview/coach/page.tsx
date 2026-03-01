"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const INITIAL_MESSAGES = [
  { role: "assistant", content: "こんにちは。今日はどんな状態ですか？\n何でも話してください。評価も比較もしません。" },
  { role: "user", content: "タスクが全然進まなくて、焦ってきた" },
  { role: "assistant", content: "今、焦りを感じているのですね。\n\nそれは、あなたが前に進もうとしている証拠です。コンフォートゾーンを出ようとした直前には、必ずそのサインが現れます。\n\n少し聞かせてください。今日、「絶対やる」と決めていたことは何でしたか？" },
];

export default function PreviewCoach() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [
      ...prev,
      { role: "user", content: msg },
      { role: "assistant", content: "なるほど。その「" + msg + "」という感覚、よく分かります。\n\nでは次の2分でできることを一つだけ決めてみましょう。どんな小さなことでも構いません。何が思い浮かびますか？" },
    ]);
  }

  return (
    <div className="flex flex-col max-w-[390px] mx-auto h-screen bg-az-bg">
      {/* ヘッダー */}
      <div className="bg-az-surface/95 backdrop-blur-xl border-b border-az-border px-4 py-4 pt-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-az-glow to-az-mystic flex items-center justify-center"
               style={{ boxShadow: "0 0 20px rgba(96,96,240,0.4)", animation: "pulse 2s infinite" }}>
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h1 className="text-az-text font-bold">AZコーチ</h1>
            <p className="text-az-subtle text-xs">静寂を守る賢者のコーチ</p>
          </div>
        </div>
      </div>

      {/* メッセージ */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-az-glow to-az-mystic flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
            )}
            <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line
              ${msg.role === "user" ? "bg-az-glow text-white rounded-tr-sm" : "bg-az-surface border border-az-border text-az-text rounded-tl-sm"}`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* 提案プロンプト（初回のみ） */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-az-subtle text-xs ml-11">よく使われる問いかけ</p>
            {["今日やるべきことが手につかない","最近モヤモヤしてる","目標に向かって進んでいるか不安"].map(p => (
              <button key={p} onClick={() => handleSend(p)}
                className="ml-11 px-3 py-2 text-xs rounded-xl border border-az-border bg-az-muted text-az-subtle hover:border-az-glow/40 hover:text-az-text transition-all block">
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 入力 */}
      <div className="bg-az-surface/95 border-t border-az-border px-4 py-4 pb-24">
        <div className="flex gap-3 items-end">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="何でも話して..."
            className="flex-1 bg-az-muted border border-az-border rounded-2xl px-4 py-3 text-az-text placeholder-az-subtle/50 focus:outline-none focus:border-az-glow text-sm" />
          <button onClick={() => handleSend()}
            className="w-11 h-11 rounded-full bg-az-glow flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
