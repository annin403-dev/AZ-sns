"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SoulType } from "@/types/database.types";

interface SoulTypeRevealProps {
  soulType: Partial<SoulType>;
  isGuest?: boolean;
}

/**
 * ソウルタイプ発表画面
 * 全画面の光演出でユーザーのソウルタイプを表示する
 */
export default function SoulTypeReveal({ soulType, isGuest = false }: SoulTypeRevealProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"flash" | "reveal" | "details">("flash");

  useEffect(() => {
    // フラッシュ → 表示 → 詳細のアニメーションシーケンス
    const timer1 = setTimeout(() => setPhase("reveal"), 800);
    const timer2 = setTimeout(() => setPhase("details"), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-az-bg flex flex-col items-center justify-center overflow-hidden">
      {/* 背景パーティクル */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: "110vh",
              opacity: 0,
            }}
            animate={{
              y: "-10vh",
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
          >
            {["✨", "⭐", "💫", "🌟", "✦"][i % 5]}
          </motion.div>
        ))}
      </div>

      {/* フラッシュ演出 */}
      {phase === "flash" && (
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* メインコンテンツ */}
      <div className="relative z-10 px-6 text-center max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: phase !== "flash" ? 1 : 0,
            scale: phase !== "flash" ? 1 : 0.5,
          }}
          transition={{ duration: 0.6, type: "spring" }}
          className="space-y-6"
        >
          {/* タイトル */}
          <div>
            <p className="text-az-subtle text-sm mb-2">あなたのソウルタイプは</p>
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                            flex items-center justify-center soul-glow mb-4 animate-glow-pulse">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-white text-glow leading-tight">
              {soulType.type_name || "光の探求者"}
            </h1>
          </div>

          {/* 詳細（animatePhase: details以降） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === "details" ? 1 : 0, y: phase === "details" ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {/* タイプ説明 */}
            <div className="card-surface p-4 text-left">
              <p className="text-az-text text-sm leading-relaxed">
                {soulType.type_description}
              </p>
            </div>

            {/* 強み */}
            {soulType.strengths && soulType.strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-az-subtle text-xs text-left">✦ あなたの強み</p>
                <div className="flex flex-wrap gap-2">
                  {soulType.strengths.map((strength, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-medium
                                 bg-az-glow/20 text-az-glow border border-az-glow/30"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 成長の方向性 */}
            {soulType.growth_direction && (
              <div className="achievement-shine p-4 rounded-xl">
                <p className="text-az-gold text-xs font-medium mb-1">
                  ✦ 輝く方向性
                </p>
                <p className="text-az-text text-sm">{soulType.growth_direction}</p>
              </div>
            )}

            {/* ボタン */}
            {isGuest ? (
              <div className="space-y-3">
                <p className="text-az-subtle text-xs text-center">
                  診断結果を保存・活用するには無料登録
                </p>
                <button
                  onClick={() => router.push("/register")}
                  className="w-full py-4 rounded-xl font-bold text-az-bg
                             bg-gradient-gold btn-glow text-lg"
                >
                  診断を保存して旅を始める ✨
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="w-full py-3 rounded-xl font-semibold
                             border border-az-glow/40 text-az-glow text-sm"
                >
                  結果を共有する（無料登録）
                </button>
                <p className="text-center">
                  <button
                    onClick={() => router.push("/login")}
                    className="text-az-subtle text-xs underline"
                  >
                    すでにアカウントがある方はログイン
                  </button>
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => router.push("/home")}
                  className="w-full py-4 rounded-xl font-bold text-az-bg
                             bg-gradient-gold btn-glow text-lg"
                >
                  旅を始める 🚀
                </button>
                <p className="text-az-subtle text-xs text-center">
                  タイプはいつでも「自分」ページから確認できます
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
