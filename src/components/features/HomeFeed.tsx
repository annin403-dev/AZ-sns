"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Profile, SoulType, Task, Post } from "@/types/database.types";
import { completeTask } from "@/app/actions/tasks";
import { getDailyOracle } from "@/app/actions/ai-coach";
import TaskCompletionEffect from "./TaskCompletionEffect";
import PostCard from "./PostCard";

interface HomeFeedProps {
  profile: (Profile & { soul_types: SoulType | null }) | null;
  todayTasks: Task[];
  posts: Post[];
  currentUserId: string;
}

/**
 * ホームフィード
 * 今日のお告げ、光のタスク、投稿フィードを表示
 */
export default function HomeFeed({
  profile,
  todayTasks,
  posts,
  currentUserId,
}: HomeFeedProps) {
  const [tasks, setTasks] = useState<Task[]>(todayTasks);
  const [oracle, setOracle] = useState<string>("");
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [showEffect, setShowEffect] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // 今日のお告げを取得
  useEffect(() => {
    getDailyOracle().then((result) => {
      if (result.oracle) setOracle(result.oracle);
    });
  }, []);

  // タスク完了ハンドラ
  async function handleCompleteTask(taskId: string) {
    setCompletingTask(taskId);
    const result = await completeTask(taskId);

    if (result.success) {
      setXpGained(result.xpGained || 10);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, is_completed: true } : t
        )
      );
      setShowEffect(true);
    }

    setCompletingTask(null);
  }

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const soulType = profile?.soul_types;

  return (
    <div className="max-w-md mx-auto">
      {/* タスク完了エフェクト */}
      <AnimatePresence>
        {showEffect && (
          <TaskCompletionEffect
            xpGained={xpGained}
            onComplete={() => setShowEffect(false)}
          />
        )}
      </AnimatePresence>

      {/* ヘッダー */}
      <div className="sticky top-0 bg-az-bg/95 backdrop-blur-xl z-40 px-4 pt-4 pb-3 border-b border-az-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-az-gold text-gold-glow">AZ</h1>
          <div className="flex items-center gap-3">
            {profile && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-az-glow/10 border border-az-glow/30">
                <span className="text-az-gold text-xs font-bold">✦</span>
                <span className="text-az-text text-xs font-semibold">
                  {profile.xp} XP
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 pt-4 pb-4">
        {/* 今日のお告げ */}
        {oracle && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-az-glow/10 to-az-mystic/10
                       border border-az-glow/20 text-center"
          >
            <p className="text-xs text-az-subtle mb-2">✦ 今日のお告げ</p>
            <p className="text-az-text text-sm leading-relaxed font-medium italic">
              「{oracle}」
            </p>
          </motion.div>
        )}

        {/* ソウルタイプバナー（初回のみ） */}
        {soulType && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-az-surface border border-az-border">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                            flex items-center justify-center flex-shrink-0 text-lg">
              ✨
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-az-subtle text-xs">あなたのソウルタイプ</p>
              <p className="text-az-text font-semibold text-sm truncate">
                {soulType.type_name}
              </p>
            </div>
          </div>
        )}

        {/* 光のタスク */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-az-text flex items-center gap-2">
              <span>⚡ 今日の光のタスク</span>
            </h2>
            <span className="text-az-subtle text-xs">
              {completedCount}/{tasks.length} 完了
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="card-surface p-6 text-center">
              <p className="text-az-subtle text-sm mb-3">
                まだタスクがありません
              </p>
              <p className="text-az-subtle text-xs">
                AIがあなたのために光のタスクを<br />準備します
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    task.is_completed
                      ? "border-az-aurora/30 bg-az-aurora/5 opacity-60"
                      : "border-az-border bg-az-surface hover:border-az-glow/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* チェックボタン */}
                    <button
                      onClick={() =>
                        !task.is_completed && handleCompleteTask(task.id)
                      }
                      disabled={task.is_completed || completingTask === task.id}
                      className={`w-7 h-7 rounded-full border-2 flex-shrink-0
                                  flex items-center justify-center transition-all duration-300
                        ${
                          task.is_completed
                            ? "bg-az-aurora border-az-aurora text-white"
                            : "border-az-border hover:border-az-glow active:scale-95"
                        }`}
                    >
                      {task.is_completed && (
                        <span className="text-sm text-white">✓</span>
                      )}
                      {completingTask === task.id && (
                        <div className="w-3 h-3 border border-az-glow border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>

                    {/* タスク内容 */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          task.is_completed
                            ? "line-through text-az-subtle"
                            : "text-az-text"
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-az-subtle text-xs mt-0.5 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* 所要時間・XP */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-az-subtle text-xs">
                        約{task.estimated_minutes}分
                      </span>
                      <span className="text-az-gold text-xs font-semibold">
                        +{task.xp_reward}XP
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 進捗バー */}
          {tasks.length > 0 && (
            <div className="mt-3 h-1.5 bg-az-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-az-aurora to-az-glow rounded-full"
                animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        {/* 区切り */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-az-border" />
          <span className="text-az-subtle text-xs">みんなの気づき</span>
          <div className="flex-1 h-px bg-az-border" />
        </div>

        {/* 投稿フィード */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-az-subtle text-sm">
              まだ投稿がありません
            </p>
            <p className="text-az-subtle text-xs mt-1">
              最初の気づきを投稿してみよう ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
