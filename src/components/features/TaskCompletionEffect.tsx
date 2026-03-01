"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface TaskCompletionEffectProps {
  xpGained: number;
  onComplete: () => void;
}

/** ランダムな称賛メッセージ */
const PRAISE_MESSAGES = [
  "素晴らしい！✨ 光が灯った",
  "やったね！🌟 一歩前進",
  "完璧！⭐ あなたの力が輝いてる",
  "見事！💫 小さな勝利が積み重なる",
  "最高！🎯 流れが変わる瞬間",
  "輝いてる！✦ この調子で",
];

/**
 * タスク完了時の全画面エフェクト
 * パーティクルと称賛メッセージでドーパミンを演出
 */
export default function TaskCompletionEffect({
  xpGained,
  onComplete,
}: TaskCompletionEffectProps) {
  const message =
    PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];

  // 2秒後に自動で閉じる
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onComplete}
    >
      {/* 背景の光 */}
      <motion.div
        className="absolute inset-0 bg-az-glow/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2.5 }}
      />

      {/* パーティクル群 */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            y: [0, -80 - Math.random() * 100],
            x: [(Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        >
          {["✨", "⭐", "💫", "🌟", "✦", "⚡"][i % 6]}
        </motion.div>
      ))}

      {/* メインコンテンツ */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* XP表示 */}
        <motion.div
          className="text-6xl font-black text-az-gold mb-4"
          style={{ textShadow: "0 0 40px rgba(240, 192, 96, 0.8)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          +{xpGained}
          <span className="text-3xl ml-1">XP</span>
        </motion.div>

        {/* 称賛メッセージ */}
        <motion.p
          className="text-white text-xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {message}
        </motion.p>

        <motion.p
          className="text-az-subtle text-sm mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          タップで閉じる
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
