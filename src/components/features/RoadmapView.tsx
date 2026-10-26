"use client";

import { useState } from "react";
import Link from "next/link";
import { addStepToToday } from "@/app/actions/roadmap";
import type { RoadmapPlan } from "@/lib/ai/roadmap";

/**
 * 90日ロードマップ表示
 * 今週のステップを大きく見せ、ワンタップで今日のクエストにできる
 */
export default function RoadmapView({
  goal,
  plan,
  week,
  startDate,
}: {
  goal: string;
  plan: RoadmapPlan;
  week: number;
  startDate: string;
}) {
  const [added, setAdded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const allWeeks = plan.phases.flatMap((phase) =>
    phase.weeks.map((w) => ({ ...w, phase: phase.name }))
  );
  const thisWeek = allWeeks.find((w) => w.week === week) ?? allWeeks[0];
  const dayNumber = Math.min(
    90,
    Math.floor((Date.now() - new Date(startDate + "T00:00:00").getTime()) / 86400000) + 1
  );

  async function handleAdd(step: string) {
    setBusy(true);
    const res = await addStepToToday(step);
    setBusy(false);
    if (!res.error) setAdded(step);
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold" style={{ color: "#7C5CDB" }}>
            🗺 90日ロードマップ
          </p>
          <Link href="/roadmap?new=1" className="text-xs no-tap-highlight" style={{ color: "#7B78A0" }}>
            作り直す
          </Link>
        </div>
        <h1 className="text-xl font-bold mt-1" style={{ color: "#1C1A2E" }}>
          {goal}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          {plan.vision}
        </p>
      </header>

      <main className="px-5 space-y-4">
        {/* 進捗 */}
        <div className="card">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: "#7C5CDB" }}>Day {dayNumber} / 90</span>
            <span style={{ color: "#7B78A0" }}>第{week}週 · {thisWeek.phase}</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: "#E8E4F8" }}>
            <div
              className="h-2 rounded-full"
              style={{
                width: `${(dayNumber / 90) * 100}%`,
                background: "linear-gradient(90deg, #7C5CDB, #9B72E6)",
              }}
            />
          </div>
        </div>

        {/* 今週のステップ */}
        <div
          className="rounded-3xl p-5"
          style={{ background: "linear-gradient(135deg, #FFFBF0, #FEF5E4)", border: "1.5px solid #F5D98B" }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "#C98B0A" }}>
            今週、毎日やること（{thisWeek.minutes}分）
          </p>
          <p className="text-lg font-bold mb-4" style={{ color: "#1C1A2E" }}>
            {thisWeek.step}
          </p>
          {added === thisWeek.step ? (
            <Link href="/home" className="btn-secondary block text-center no-tap-highlight">
              ✅ 今日のクエストに追加しました → ホームへ
            </Link>
          ) : (
            <button
              onClick={() => handleAdd(thisWeek.step)}
              disabled={busy}
              className="btn-primary no-tap-highlight"
            >
              今日のクエストにする
            </button>
          )}
        </div>

        {/* If-Then */}
        <div className="card">
          <p className="text-sm font-bold mb-2" style={{ color: "#1C1A2E" }}>
            🔁 あなたのIf-Thenプラン
          </p>
          <p className="text-sm" style={{ color: "#4A4766" }}>
            もし <b style={{ color: "#7C5CDB" }}>{plan.if_then.trigger}</b>、
            <b style={{ color: "#7C5CDB" }}>{plan.if_then.action}</b>。
          </p>
          <Link href="/ifthen" className="text-xs mt-2 inline-block no-tap-highlight" style={{ color: "#7C5CDB" }}>
            If-Thenを管理する →
          </Link>
        </div>

        {/* 全体の道のり */}
        {plan.phases.map((phase) => (
          <div key={phase.name} className="card">
            <p className="text-sm font-bold" style={{ color: "#1C1A2E" }}>
              {phase.name}
            </p>
            <p className="text-xs mb-3" style={{ color: "#7B78A0" }}>
              {phase.theme}
            </p>
            <div className="space-y-2">
              {phase.weeks.map((w) => {
                const isNow = w.week === week;
                const isPast = w.week < week;
                return (
                  <div
                    key={w.week}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{
                      background: isNow ? "#EDE9F9" : "#F8F7FF",
                      border: `1.5px solid ${isNow ? "#7C5CDB" : "#E8E4F8"}`,
                      opacity: isPast ? 0.6 : 1,
                    }}
                  >
                    <span className="text-xs font-bold w-10 flex-shrink-0" style={{ color: "#7C5CDB" }}>
                      {isPast ? "✓" : `W${w.week}`}
                    </span>
                    <span className="flex-1 text-sm" style={{ color: "#1C1A2E" }}>
                      {w.step}
                    </span>
                    <span className="text-xs" style={{ color: "#B0ACC8" }}>
                      {w.minutes}分
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
