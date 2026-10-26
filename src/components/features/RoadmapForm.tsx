"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createRoadmap } from "@/app/actions/roadmap";
import { BRAKE_INFO, type BrakeType } from "@/lib/brake/data";

const MINUTE_OPTIONS = [2, 5, 10, 15, 30];

const GOAL_EXAMPLES = [
  "副業で月3万円を稼ぐ",
  "自己肯定感を取り戻す",
  "朝型の生活リズムにする",
  "発信を始めてフォロワー100人",
];

/**
 * 90日ロードマップ作成フォーム
 * ゴール・現在地・1日に使える時間を聞いて、AIがマイクロステップに分解する
 */
export default function RoadmapForm({
  brake,
  hasExisting,
}: {
  brake: BrakeType | null;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [current, setCurrent] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brakeInfo = brake ? BRAKE_INFO[brake] : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) {
      setError("ゴールを入れてね（ざっくりでOK）");
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("goal", goal);
    fd.append("current", current);
    fd.append("minutes_per_day", String(minutes));
    if (brake) fd.append("brake", brake);

    const result = await createRoadmap(fd).catch(() => ({ error: "通信に失敗しました" }));
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/roadmap");
    router.refresh();
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ background: "#FAF9FF" }}
      >
        <div className="text-5xl mb-6 animate-pulse">🗺</div>
        <p className="text-lg font-bold mb-2" style={{ color: "#1C1A2E" }}>
          AZがあなた専用の道をえがいています…
        </p>
        <p className="text-sm" style={{ color: "#7B78A0" }}>
          失敗しようがないサイズまで、ステップを小さくしています
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold mb-1" style={{ color: "#7C5CDB" }}>
          🗺 90日ロードマップ
        </p>
        <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
          {hasExisting ? "新しい道をつくる" : "何をすればいいか、もう迷わない"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          ゴールと現在地から、毎日の「超・小さな一歩」を自動で設計します
        </p>
      </header>

      <main className="px-5">
        {/* ブレーキ表示 */}
        {brakeInfo ? (
          <div
            className="rounded-2xl p-4 mb-5"
            style={{ background: brakeInfo.colorLight, border: `1.5px solid ${brakeInfo.color}40` }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: brakeInfo.color }}>
              {brakeInfo.emoji} {brakeInfo.nickname} に合わせて設計します
            </p>
            <p className="text-sm" style={{ color: "#1C1A2E" }}>
              {brakeInfo.stepStyle}
            </p>
          </div>
        ) : (
          <Link href="/brake" className="block rounded-2xl p-4 mb-5" style={{ background: "#F3F1FC", border: "1.5px solid #C8BEF0" }}>
            <p className="text-sm font-semibold" style={{ color: "#7C5CDB" }}>
              🧠 先にブレーキ診断をすると、もっとあなたに合う道になります →
            </p>
          </Link>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1C1A2E" }}>
              90日後、どうなっていたい？
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="例：副業で月3万円を稼ぐ"
              className="w-full px-4 py-3 rounded-xl text-base outline-none"
              style={{ background: "#FFFFFF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {GOAL_EXAMPLES.map((ex) => (
                <button
                  type="button"
                  key={ex}
                  onClick={() => setGoal(ex)}
                  className="text-xs px-3 py-1.5 rounded-full no-tap-highlight"
                  style={{ background: "#EDE9F9", color: "#7C5CDB" }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1C1A2E" }}>
              いまの現在地は？（任意）
            </label>
            <textarea
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              rows={3}
              placeholder="例：興味はあるけど、何から始めればいいかわからない。平日は疲れて動けない"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: "#FFFFFF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1C1A2E" }}>
              1日に使えそうな時間
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MINUTE_OPTIONS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMinutes(m)}
                  className="py-3 rounded-xl text-sm font-semibold no-tap-highlight"
                  style={{
                    background: minutes === m ? "#7C5CDB" : "#FFFFFF",
                    color: minutes === m ? "#FFFFFF" : "#1C1A2E",
                    border: `1.5px solid ${minutes === m ? "#7C5CDB" : "#E8E4F8"}`,
                  }}
                >
                  {m}分
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#F05252" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary no-tap-highlight">
            ロードマップを作る ✨
          </button>
        </form>
      </main>
    </div>
  );
}
