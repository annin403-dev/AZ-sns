"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toggleQuest } from "@/app/actions/quests";
import TaskCompletionEffect from "./TaskCompletionEffect";

interface Quest {
  id: string;
  title: string;
  is_done: boolean;
  luck_xp_reward: number;
}

/**
 * 今日のクエスト（タップで完了 → 光と音の演出）
 * どんなに小さな行動でも、完了の瞬間を「ご褒美」にする
 */
export default function QuestList({ quests: initial }: { quests: Quest[] }) {
  const router = useRouter();
  const [quests, setQuests] = useState(initial);
  const [effectXp, setEffectXp] = useState<number | null>(null);
  const closeEffect = useCallback(() => setEffectXp(null), []);

  const doneCount = quests.filter((q) => q.is_done).length;

  async function handleToggle(quest: Quest) {
    const next = !quest.is_done;
    // 楽観的更新：押した瞬間に気持ちよく反応させる
    setQuests((prev) => prev.map((q) => (q.id === quest.id ? { ...q, is_done: next } : q)));
    if (next) setEffectXp(quest.luck_xp_reward);

    const res = await toggleQuest(quest.id, next);
    if (res.error) {
      setQuests((prev) => prev.map((q) => (q.id === quest.id ? { ...q, is_done: !next } : q)));
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <AnimatePresence>
        {effectXp !== null && <TaskCompletionEffect xpGained={effectXp} onComplete={closeEffect} />}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold" style={{ color: "#1C1A2E" }}>
          今日のクエスト
        </h2>
        <Link
          href="/quests/new"
          className="text-sm font-medium px-3 py-1 rounded-lg no-tap-highlight"
          style={{ color: "#7C5CDB", background: "#EDE9F9" }}
        >
          + 追加
        </Link>
      </div>

      {quests.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: "#B0ACC8" }}>
            今日のクエストがまだありません
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <Link href="/roadmap" className="text-sm font-medium no-tap-highlight" style={{ color: "#7C5CDB" }}>
              ロードマップから選ぶ →
            </Link>
            <Link href="/quests/new" className="text-sm font-medium no-tap-highlight" style={{ color: "#7C5CDB" }}>
              自分で決める →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {quests.map((quest) => (
            <button
              key={quest.id}
              onClick={() => handleToggle(quest)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left active:scale-[0.98] transition-all no-tap-highlight"
              style={{
                background: quest.is_done ? "#F0EAFC" : "#F8F7FF",
                border: `1.5px solid ${quest.is_done ? "#C8BEF0" : "#E8E4F8"}`,
              }}
            >
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: quest.is_done ? "#7C5CDB" : "#FFFFFF",
                  border: `2px solid ${quest.is_done ? "#7C5CDB" : "#D0CAE8"}`,
                }}
              >
                {quest.is_done && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className="flex-1 text-sm"
                style={{
                  color: quest.is_done ? "#7B78A0" : "#1C1A2E",
                  textDecoration: quest.is_done ? "line-through" : "none",
                }}
              >
                {quest.title}
              </span>
              <span className="text-xs" style={{ color: "#F5A623" }}>
                +{quest.luck_xp_reward}
              </span>
            </button>
          ))}
          <p className="text-xs text-right mt-1" style={{ color: "#7B78A0" }}>
            {doneCount}/{quests.length} 完了
          </p>
        </div>
      )}
    </div>
  );
}
