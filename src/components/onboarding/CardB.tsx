"use client";

import { useState } from "react";
import { CardBData } from "@/types/database.types";

/** 停止トリガーの選択肢 */
const STOP_TRIGGER_OPTIONS = [
  { id: "vague_task", label: "タスクが曖昧", desc: "何をすればいいかわからない" },
  { id: "first_step", label: "最初の一手が不明", desc: "どこから始めるか迷う" },
  { id: "fatigue", label: "疲労・体調", desc: "体が動かない" },
  { id: "sns_compare", label: "SNS比較後", desc: "他人を見て落ち込んだ" },
  { id: "loneliness", label: "孤独感", desc: "誰とも繋がれていない感覚" },
  { id: "no_praise", label: "褒められない", desc: "頑張っても評価されない" },
  { id: "perfectionism", label: "完璧主義", desc: "完璧でないと始められない" },
  { id: "distraction", label: "気が散る", desc: "他のことが気になってしまう" },
];

interface CardBProps {
  onComplete: (data: CardBData) => void;
  initialData: CardBData | null;
}

/**
 * Card B：停止トリガーの特定
 * 物事が止まる瞬間の原因を複数選択
 */
export default function CardB({ onComplete, initialData }: CardBProps) {
  const [stopTriggers, setStopTriggers] = useState<string[]>(
    initialData?.stop_triggers ?? []
  );

  function toggleTrigger(id: string) {
    setStopTriggers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* 見出し */}
      <div>
        <div className="inline-block px-3 py-1 rounded-full bg-az-flame/20 text-az-flame text-xs mb-3">
          Card B · 停止トリガー
        </div>
        <h2 className="text-xl font-bold text-az-text mb-2">
          物事が止まる瞬間の<br />
          <span className="text-az-flame">直前</span>、何が起きてる？
        </h2>
        <p className="text-az-subtle text-sm">
          正直に選ぶほど、AIのサポートが精度UP ✨
        </p>
      </div>

      {/* 選択肢リスト */}
      <div className="space-y-2">
        {STOP_TRIGGER_OPTIONS.map((option) => {
          const isSelected = stopTriggers.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => toggleTrigger(option.id)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 active:scale-98
                ${isSelected
                  ? "border-az-flame bg-az-flame/10 text-white"
                  : "border-az-border bg-az-muted text-az-text hover:border-az-flame/40"
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-az-subtle mt-0.5">{option.desc}</div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-az-flame flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 次へボタン */}
      <button
        onClick={() => onComplete({ stop_triggers: stopTriggers })}
        disabled={stopTriggers.length === 0}
        className="w-full py-4 rounded-xl font-semibold text-white
                   bg-az-glow btn-glow disabled:opacity-30 disabled:cursor-not-allowed
                   disabled:transform-none"
      >
        次へ →
      </button>
    </div>
  );
}
