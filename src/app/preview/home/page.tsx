"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// モックデータ
const MOCK_TASKS = [
  { id: "1", title: "今日の学習ページを1つ開く", description: "ブックマークのURLを1つタップするだけ", estimated_minutes: 2, is_completed: false, xp_reward: 10 },
  { id: "2", title: "感謝を1つ書く", description: "今日うまくいったことを一文メモ", estimated_minutes: 2, is_completed: true, xp_reward: 10 },
  { id: "3", title: "次のタスクを確認する", description: "明日やることを一つ決める", estimated_minutes: 2, is_completed: false, xp_reward: 10 },
];

const MOCK_POSTS = [
  { id: "1", content: "今日、タスクを小さく分けたら意外とすぐできた。「完璧にやろう」という思考が一番の敵だった。", post_type: "insight", username: "hikaru_soar", timeAgo: "2分前", reactions: { empathy: 12, helpful: 8, cheer: 5 } },
  { id: "2", content: "⚡ 光のタスク完了！「今日の学習ページを1つ開く」を達成しました", post_type: "task_complete", username: "morning_walker", timeAgo: "15分前", reactions: { empathy: 4, helpful: 2, cheer: 18 } },
  { id: "3", content: "詰まりボタンを使ったら「完璧主義→今できる最小の一歩」という視点になれた。自分の停止トリガーを知るのって大事ですね。", post_type: "insight", username: "deep_thinker", timeAgo: "1時間前", reactions: { empathy: 23, helpful: 15, cheer: 9 } },
];

const POST_TYPE_CONFIG: Record<string, { label: string; emoji: string }> = {
  insight: { label: "気づき", emoji: "💡" },
  progress: { label: "進捗", emoji: "📈" },
  task_complete: { label: "達成", emoji: "⚡" },
  emotion: { label: "感情", emoji: "🌊" },
};

export default function PreviewHome() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [showEffect, setShowEffect] = useState(false);

  function handleComplete(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: true } : t));
    setShowEffect(true);
    setTimeout(() => setShowEffect(false), 2500);
  }

  const completedCount = tasks.filter(t => t.is_completed).length;

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-az-bg relative overflow-hidden">
      {/* タスク完了エフェクト */}
      <AnimatePresence>
        {showEffect && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-az-glow/10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div key={i} className="absolute text-2xl pointer-events-none"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], y: [0, -80 - Math.random() * 100] }}
                transition={{ duration: 1.5, delay: Math.random() * 0.5 }}
              >
                {["✨", "⭐", "💫", "🌟", "✦"][i % 5]}
              </motion.div>
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} className="text-center">
              <div className="text-6xl font-black text-az-gold" style={{ textShadow: "0 0 40px rgba(240,192,96,0.8)" }}>
                +10<span className="text-3xl ml-1">XP</span>
              </div>
              <p className="text-white text-xl font-bold mt-3">素晴らしい！✨ 光が灯った</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <div className="sticky top-0 bg-az-bg/95 backdrop-blur-xl z-40 px-4 pt-4 pb-3 border-b border-az-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-az-gold" style={{ textShadow: "0 0 20px rgba(240,192,96,0.8)" }}>AZ</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-az-glow/10 border border-az-glow/30">
            <span className="text-az-gold text-xs font-bold">✦</span>
            <span className="text-az-text text-xs font-semibold">240 XP</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 pt-4 pb-28">
        {/* 今日のお告げ */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-az-glow/10 to-az-mystic/10 border border-az-glow/20 text-center">
          <p className="text-xs text-az-subtle mb-2">✦ 今日のお告げ</p>
          <p className="text-az-text text-sm leading-relaxed font-medium italic">
            「止まることは、より深く跳ぶための助走だ。」
          </p>
        </div>

        {/* ソウルタイプ */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-az-surface border border-az-border">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-az-glow to-az-mystic flex items-center justify-center flex-shrink-0 text-lg"
               style={{ boxShadow: "0 0 20px rgba(96,96,240,0.4)" }}>✨</div>
          <div>
            <p className="text-az-subtle text-xs">あなたのソウルタイプ</p>
            <p className="text-az-text font-semibold text-sm">静寂を守る賢者</p>
          </div>
        </div>

        {/* 光のタスク */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-az-text">⚡ 今日の光のタスク</h2>
            <span className="text-az-subtle text-xs">{completedCount}/{tasks.length} 完了</span>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <motion.div key={task.id} layout
                className={`p-4 rounded-xl border transition-all duration-300 ${task.is_completed ? "border-az-aurora/30 bg-az-aurora/5 opacity-60" : "border-az-border bg-az-surface"}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => !task.is_completed && handleComplete(task.id)}
                    className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                      ${task.is_completed ? "bg-az-aurora border-az-aurora" : "border-az-border hover:border-az-glow"}`}>
                    {task.is_completed && <span className="text-sm text-white">✓</span>}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${task.is_completed ? "line-through text-az-subtle" : "text-az-text"}`}>
                      {task.title}
                    </p>
                    <p className="text-az-subtle text-xs mt-0.5">{task.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-az-subtle text-xs">約{task.estimated_minutes}分</span>
                    <span className="text-az-gold text-xs font-semibold">+{task.xp_reward}XP</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 h-1.5 bg-az-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-az-aurora to-az-glow rounded-full"
              animate={{ width: `${(completedCount / tasks.length) * 100}%` }} />
          </div>
        </div>

        {/* 区切り */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-az-border" />
          <span className="text-az-subtle text-xs">みんなの気づき</span>
          <div className="flex-1 h-px bg-az-border" />
        </div>

        {/* 投稿フィード */}
        <div className="space-y-4">
          {MOCK_POSTS.map(post => {
            const config = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.insight;
            return (
              <div key={post.id} className="bg-az-surface border border-az-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-az-glow to-az-mystic flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {post.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-az-text text-sm">{post.username}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-az-muted border border-az-border text-az-subtle">
                        {config.emoji} {config.label}
                      </span>
                    </div>
                    <span className="text-az-subtle text-xs">{post.timeAgo}</span>
                  </div>
                </div>
                <p className="text-az-text text-sm leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-2">
                  {[
                    { type: "empathy", emoji: "🤝", label: "共感", count: post.reactions.empathy },
                    { type: "helpful", emoji: "💡", label: "参考", count: post.reactions.helpful },
                    { type: "cheer", emoji: "🌟", label: "応援", count: post.reactions.cheer },
                  ].map(r => (
                    <button key={r.type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-az-border bg-az-muted text-az-subtle hover:border-az-glow/40 active:scale-95 transition-all">
                      <span>{r.emoji}</span>
                      <span>{r.label}</span>
                      <span className="text-az-text font-medium">{r.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 詰まりボタン */}
      <button className="fixed right-4 bottom-24 z-40 w-14 h-14 rounded-full bg-az-flame/90 flex items-center justify-center"
        style={{ boxShadow: "0 0 20px rgba(240,96,64,0.5)" }}>
        <span className="text-xl">🆘</span>
      </button>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-az-surface/95 backdrop-blur-xl border-t border-az-border z-50">
        <div className="flex items-center justify-around px-2 py-2 max-w-[390px] mx-auto">
          {[
            { icon: "🏠", label: "ホーム", active: true },
            { icon: "🔍", label: "探す", active: false },
            { icon: "＋", label: "投稿", active: false, isCenter: true },
            { icon: "👤", label: "自分", active: false },
            { icon: "💬", label: "AZコーチ", active: false },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 min-w-0 flex-1 py-1">
              {item.isCenter ? (
                <div className="w-12 h-12 rounded-full bg-az-glow -mt-3 flex items-center justify-center"
                     style={{ boxShadow: "0 0 20px rgba(96,96,240,0.5)" }}>
                  <span className="text-white font-bold text-xl">+</span>
                </div>
              ) : (
                <span className={`text-xl ${item.active ? "" : "opacity-40"}`}>{item.icon}</span>
              )}
              <span className={`text-xs ${item.active ? "text-az-gold font-medium" : "text-az-subtle"} ${item.isCenter ? "sr-only" : ""}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
