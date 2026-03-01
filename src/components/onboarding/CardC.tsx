"use client";

import { useState } from "react";
import { CardCData } from "@/types/database.types";

interface SliderProps {
  label: string;
  sublabel: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}

/** スライダーコンポーネント */
function Slider({ label, sublabel, value, onChange, color }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <div className="font-medium text-az-text text-sm">{label}</div>
          <div className="text-az-subtle text-xs">{sublabel}</div>
        </div>
        <div
          className={`text-2xl font-bold ${
            color === "glow"
              ? "text-az-glow"
              : color === "aurora"
              ? "text-az-aurora"
              : "text-az-mystic"
          }`}
        >
          {value}
        </div>
      </div>

      {/* カスタムスライダー */}
      <div className="relative h-8 flex items-center">
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${
              color === "glow"
                ? "#6060f0"
                : color === "aurora"
                ? "#40c0a0"
                : "#c060f0"
            } ${value * 10}%, #2a2a3d ${value * 10}%)`,
          }}
        />
      </div>

      {/* ラベル */}
      <div className="flex justify-between text-xs text-az-subtle">
        <span>低い</span>
        <span>高い</span>
      </div>
    </div>
  );
}

interface CardCProps {
  onComplete: (data: CardCData) => void;
  initialData: CardCData | null;
}

/**
 * Card C：やる気の燃料タイプ
 * SDT（自己決定理論）に基づく3つのスコアを設定
 */
export default function CardC({ onComplete, initialData }: CardCProps) {
  const [autonomy, setAutonomy] = useState(initialData?.autonomy_score ?? 5);
  const [competence, setCompetence] = useState(
    initialData?.competence_score ?? 5
  );
  const [relatedness, setRelatedness] = useState(
    initialData?.relatedness_score ?? 5
  );

  return (
    <div className="py-4 space-y-6">
      {/* 見出し */}
      <div>
        <div className="inline-block px-3 py-1 rounded-full bg-az-mystic/20 text-az-mystic text-xs mb-3">
          Card C · やる気の燃料
        </div>
        <h2 className="text-xl font-bold text-az-text mb-2">
          今の自分に、どれくらい
          <span className="text-az-mystic">満たされている</span>？
        </h2>
        <p className="text-az-subtle text-sm">
          正直な数字が、AIのサポートを最適化します
        </p>
      </div>

      {/* スライダー群 */}
      <div className="card-surface p-5 space-y-6">
        <Slider
          label="自律性"
          sublabel="「自分で選んでいる感」がある？"
          value={autonomy}
          onChange={setAutonomy}
          color="glow"
        />
        <Slider
          label="有能感"
          sublabel="「できる感」が出る領域がある？"
          value={competence}
          onChange={setCompetence}
          color="aurora"
        />
        <Slider
          label="関係性"
          sublabel="前向きになれる人がいる？"
          value={relatedness}
          onChange={setRelatedness}
          color="mystic"
        />
      </div>

      {/* 欠乏ヒント */}
      <div className="p-4 rounded-xl bg-az-glow/5 border border-az-glow/20">
        <p className="text-az-subtle text-xs text-center">
          💡 スコアが低い領域ほど、AZが重点的にサポートします
        </p>
      </div>

      {/* 次へボタン */}
      <button
        onClick={() =>
          onComplete({
            autonomy_score: autonomy,
            competence_score: competence,
            relatedness_score: relatedness,
          })
        }
        className="w-full py-4 rounded-xl font-semibold text-white
                   bg-az-glow btn-glow"
      >
        次へ →
      </button>
    </div>
  );
}
