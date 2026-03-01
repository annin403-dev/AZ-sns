"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToCoach } from "@/app/actions/ai-coach";
import { AiConversation } from "@/types/database.types";

interface CoachChatProps {
  history: AiConversation[];
  soulTypeName?: string;
}

/** 推奨の問いかけ */
const SUGGESTED_PROMPTS = [
  "今日やるべきことが手につかない",
  "最近モヤモヤしてる",
  "目標に向かって進んでいるか不安",
  "今日うまくいったことを話したい",
];

/**
 * AIコーチとのチャット画面
 */
export default function CoachChat({ history, soulTypeName }: CoachChatProps) {
  const [messages, setMessages] = useState(history);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // メッセージ追加時に最下部へスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput("");
    setLoading(true);

    // 楽観的更新
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        user_id: "",
        role: "user",
        content: messageText,
        created_at: new Date().toISOString(),
      },
    ]);

    const result = await sendMessageToCoach(messageText);

    if (result.response) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: "",
          role: "assistant",
          content: result.response!,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-screen bg-az-bg">
      {/* ヘッダー */}
      <div className="bg-az-surface/95 backdrop-blur-xl border-b border-az-border px-4 py-4 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                          flex items-center justify-center soul-glow animate-glow-pulse">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h1 className="text-az-text font-bold">AZコーチ</h1>
            {soulTypeName && (
              <p className="text-az-subtle text-xs">{soulTypeName}のコーチ</p>
            )}
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 初回挨拶 */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                              flex items-center justify-center flex-shrink-0 text-sm">
                🤖
              </div>
              <div className="bg-az-surface border border-az-border rounded-2xl rounded-tl-sm
                              px-4 py-3 max-w-xs">
                <p className="text-az-text text-sm leading-relaxed">
                  こんにちは。今日はどんな状態ですか？
                  <br />
                  何でも話してください。
                  評価も比較もしません。
                </p>
              </div>
            </div>

            {/* 推奨プロンプト */}
            <div className="space-y-2">
              <p className="text-az-subtle text-xs ml-11">よく使われる問いかけ</p>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="ml-11 px-3 py-2 text-xs rounded-xl border border-az-border
                             bg-az-muted text-az-subtle hover:border-az-glow/40
                             hover:text-az-text active:scale-95 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 会話履歴 */}
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                              flex items-center justify-center flex-shrink-0 text-sm">
                🤖
              </div>
            )}
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-az-glow text-white rounded-tr-sm"
                  : "bg-az-surface border border-az-border text-az-text rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* ローディング */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                            flex items-center justify-center flex-shrink-0 text-sm">
              🤖
            </div>
            <div className="bg-az-surface border border-az-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-az-glow rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div className="bg-az-surface/95 backdrop-blur-xl border-t border-az-border px-4 py-4 pb-24">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="何でも話して..."
            rows={1}
            className="flex-1 bg-az-muted border border-az-border rounded-2xl px-4 py-3
                       text-az-text placeholder-az-subtle/50 focus:outline-none
                       focus:border-az-glow resize-none text-sm"
            style={{ maxHeight: "100px" }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full bg-az-glow flex items-center justify-center
                       disabled:opacity-40 flex-shrink-0 hover:bg-az-mystic active:scale-95
                       transition-all duration-200"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
