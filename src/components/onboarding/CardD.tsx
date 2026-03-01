"use client";

import { useState } from "react";
import { CardDData } from "@/types/database.types";

/** 目標領域の選択肢 */
const GOAL_AREAS = [
  {
    id: "work",
    label: "仕事の成果",
    emoji: "💼",
    desc: "キャリア・副業・昇進",
  },
  {
    id: "learning",
    label: "学習・資格",
    emoji: "📚",
    desc: "スキルアップ・試験合格",
  },
  {
    id: "creation",
    label: "作品・制作",
    emoji: "🎨",
    desc: "創作・プロジェクト",
  },
  {
    id: "health",
    label: "健康・体",
    emoji: "💪",
    desc: "運動・食事・睡眠",
  },
  {
    id: "relationship",
    label: "人間関係・生活",
    emoji: "🌟",
    desc: "繋がり・生活基盤",
  },
];

interface CardDProps {
  onComplete: (data: CardDData) => void;
  initialData: CardDData | null;
}

/**
 * Card D：目標領域の選択
 * 今年中に向き合いたい領域を1つ選択
 */
export default function CardD({ onComplete, initialData }: CardDProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(
    initialData?.goal_area ?? null
  );
  const [goalText, setGoalText] = useState<string>(
    initialData?.goal_text ?? ""
  );

  return (
    <div className="py-4 space-y-6">
      {/* 見出し */}
      <div>
        <div className="inline-block px-3 py-1 rounded-full bg-az-aurora/20 text-az-aurora text-xs mb-3">
          Card D · 目標領域
        </div>
        <h2 className="text-xl font-bold text-az-text mb-2">
          今年、最も向き合いたい
          <br />
          <span className="text-az-gold">領域</span>はどれ？
        </h2>
        <p className="text-az-subtle text-sm">
          1つだけ選んで。後からいつでも変えられます
        </p>
      </div>

      {/* 領域選択 */}
      <div className="space-y-3">
        {GOAL_AREAS.map((area) => {
          const isSelected = selectedArea === area.id;
          return (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border
                          transition-all duration-200 active:scale-98 text-left
                ${isSelected
                  ? "border-az-gold bg-az-gold/10"
                  : "border-az-border bg-az-muted hover:border-az-gold/30"
                }`}
            >
              <span className="text-2xl">{area.emoji}</span>
              <div className="flex-1">
                <div
                  className={`font-semibold text-sm ${
                    isSelected ? "text-az-gold" : "text-az-text"
                  }`}
                >
                  {area.label}
                </div>
                <div className="text-az-subtle text-xs mt-0.5">{area.desc}</div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-az-gold flex items-center justify-center flex-shrink-0">
                  <span className="text-az-bg text-xs font-bold">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 任意：一言ゴール */}
      {selectedArea && (
        <div className="space-y-2">
          <label className="block text-sm text-az-subtle">
            今年中に達成したいことを一言で（任意）
          </label>
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            maxLength={50}
            className="w-full px-4 py-3 rounded-xl bg-az-muted border border-az-border
                       text-az-text placeholder-az-subtle/50 focus:outline-none
                       focus:border-az-gold/50 transition-all duration-200"
            placeholder="例：転職を成功させる"
          />
        </div>
      )}

      {/* 完了ボタン */}
      <button
        onClick={() =>
          onComplete({
            goal_area: selectedArea!,
            goal_text: goalText || undefined,
          })
        }
        disabled={!selectedArea}
        className="w-full py-4 rounded-xl font-semibold text-white
                   bg-gradient-gold btn-glow disabled:opacity-30 disabled:cursor-not-allowed
                   disabled:transform-none"
      >
        ✨ ソウルタイプを召喚する
      </button>
    </div>
  );
}
