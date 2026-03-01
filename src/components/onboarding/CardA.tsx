"use client";

import { useState } from "react";
import { CardAData } from "@/types/database.types";

/** エネルギーが増える行為の選択肢 */
const ENERGY_SOURCE_OPTIONS = [
  { id: "create", label: "🎨 何かを作る・表現する", emoji: "🎨" },
  { id: "learn", label: "📚 新しいことを学ぶ", emoji: "📚" },
  { id: "help", label: "🤝 誰かを助ける", emoji: "🤝" },
  { id: "solo", label: "🧘 一人で静かに過ごす", emoji: "🧘" },
  { id: "social", label: "💬 人と話す・繋がる", emoji: "💬" },
  { id: "move", label: "🏃 体を動かす", emoji: "🏃" },
  { id: "organize", label: "📋 整理・計画を立てる", emoji: "📋" },
  { id: "nature", label: "🌿 自然の中にいる", emoji: "🌿" },
];

/** エネルギーが消耗する行為の選択肢 */
const ENERGY_DRAIN_OPTIONS = [
  { id: "routine", label: "🔄 同じことの繰り返し", emoji: "🔄" },
  { id: "crowd", label: "👥 大人数の場", emoji: "👥" },
  { id: "urgent", label: "⚡ 突然の割り込み・急かし", emoji: "⚡" },
  { id: "conflict", label: "💥 対立・摩擦", emoji: "💥" },
  { id: "unclear", label: "❓ 曖昧・不明確な指示", emoji: "❓" },
  { id: "compare", label: "📊 他人と比べられる", emoji: "📊" },
  { id: "admin", label: "📝 事務・書類仕事", emoji: "📝" },
  { id: "wait", label: "⏳ 待つ・決まらない", emoji: "⏳" },
];

interface CardAProps {
  onComplete: (data: CardAData) => void;
  initialData: CardAData | null;
}

/**
 * Card A：エネルギー棚卸し
 * エネルギーが増える行為・消耗する行為を複数選択
 */
export default function CardA({ onComplete, initialData }: CardAProps) {
  const [energySources, setEnergySources] = useState<string[]>(
    initialData?.energy_sources ?? []
  );
  const [energyDrains, setEnergyDrains] = useState<string[]>(
    initialData?.energy_drains ?? []
  );
  const [step, setStep] = useState<"sources" | "drains">("sources");

  function toggleSource(id: string) {
    setEnergySources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleDrain(id: string) {
    setEnergyDrains((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function handleNext() {
    if (step === "sources") {
      setStep("drains");
    } else {
      onComplete({ energy_sources: energySources, energy_drains: energyDrains });
    }
  }

  const canProceed =
    step === "sources" ? energySources.length > 0 : energyDrains.length > 0;

  return (
    <div className="py-4 space-y-6">
      {/* ステップ表示 */}
      <div className="flex gap-2">
        <div className={`h-1 flex-1 rounded-full ${step === "sources" ? "bg-az-glow" : "bg-az-aurora"}`} />
        <div className={`h-1 flex-1 rounded-full ${step === "drains" ? "bg-az-flame" : "bg-az-muted"}`} />
      </div>

      {/* 見出し */}
      <div>
        <div className="inline-block px-3 py-1 rounded-full bg-az-glow/20 text-az-glow text-xs mb-3">
          Card A · エネルギー棚卸し
        </div>
        {step === "sources" ? (
          <>
            <h2 className="text-xl font-bold text-az-text mb-2">
              やった後に<span className="text-az-aurora">エネルギーが増える</span>
              <br />行為はどれ？
            </h2>
            <p className="text-az-subtle text-sm">複数選択OK</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-az-text mb-2">
              やる前から<span className="text-az-flame">気が重い</span>
              <br />行為はどれ？
            </h2>
            <p className="text-az-subtle text-sm">複数選択OK・正直に選んで</p>
          </>
        )}
      </div>

      {/* 選択肢グリッド */}
      <div className="grid grid-cols-2 gap-3">
        {(step === "sources" ? ENERGY_SOURCE_OPTIONS : ENERGY_DRAIN_OPTIONS).map(
          (option) => {
            const isSelected =
              step === "sources"
                ? energySources.includes(option.id)
                : energyDrains.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() =>
                  step === "sources"
                    ? toggleSource(option.id)
                    : toggleDrain(option.id)
                }
                className={`choice-btn text-sm ${isSelected ? "selected" : ""}`}
              >
                {option.label}
              </button>
            );
          }
        )}
      </div>

      {/* 次へボタン */}
      <button
        onClick={handleNext}
        disabled={!canProceed}
        className="w-full py-4 rounded-xl font-semibold text-white
                   bg-az-glow btn-glow disabled:opacity-30 disabled:cursor-not-allowed
                   disabled:transform-none"
      >
        {step === "sources" ? "次へ →" : "完了 ✓"}
      </button>
    </div>
  );
}
