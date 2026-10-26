"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { addIfThen, markIfThenDone, setIfThenActive } from "@/app/actions/if-then";
import TaskCompletionEffect from "./TaskCompletionEffect";

export interface IfThenPlan {
  id: string;
  trigger_text: string;
  action_text: string;
  is_active: boolean;
  done_count: number;
  last_done_date: string | null;
}

const TRIGGER_PRESETS = [
  "朝コーヒーを淹れたら",
  "歯みがきが終わったら",
  "電車に乗ったら",
  "パソコンを開いたら",
  "お風呂から出たら",
  "ベッドに入ったら",
];

const ACTION_PRESETS = [
  "ノートを1ページ開く",
  "今日やることを1つ書く",
  "深呼吸を3回する",
  "今日できたことを1つ思い出す",
];

/**
 * If-Thenプランの一覧・追加・実行記録
 */
export default function IfThenManager({ plans }: { plans: IfThenPlan[] }) {
  const router = useRouter();
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showEffect, setShowEffect] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const closeEffect = useCallback(() => setShowEffect(false), []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("trigger", trigger);
    fd.append("action", action);
    const res = await addIfThen(fd);
    if (res.error) {
      setError(res.error);
      return;
    }
    setTrigger("");
    setAction("");
    setError(null);
    router.refresh();
  }

  async function handleDone(id: string) {
    const res = await markIfThenDone(id);
    if (!res.error && !res.already) setShowEffect(true);
    router.refresh();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await setIfThenActive(id, isActive);
    router.refresh();
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <AnimatePresence>
        {showEffect && <TaskCompletionEffect xpGained={5} onComplete={closeEffect} />}
      </AnimatePresence>

      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold mb-1" style={{ color: "#7C5CDB" }}>
          🔁 If-Thenプラン
        </p>
        <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
          意志の力に頼らない仕組み
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          いつもの習慣を「きっかけ」にすると、脳は迷わず動けます
        </p>
      </header>

      <main className="px-5 space-y-4">
        {/* 一覧 */}
        {plans.length > 0 && (
          <div className="space-y-3">
            {plans.map((plan) => {
              const doneToday = plan.last_done_date === today;
              return (
                <div
                  key={plan.id}
                  className="card"
                  style={{ opacity: plan.is_active ? 1 : 0.5 }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: "#1C1A2E" }}>
                    もし <b style={{ color: "#7C5CDB" }}>{plan.trigger_text}</b>、
                    <b style={{ color: "#7C5CDB" }}>{plan.action_text}</b>
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs" style={{ color: "#7B78A0" }}>
                      🔥 これまで {plan.done_count} 回
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(plan.id, !plan.is_active)}
                        className="text-xs px-3 py-1.5 rounded-lg no-tap-highlight"
                        style={{ background: "#F3F1FC", color: "#7B78A0" }}
                      >
                        {plan.is_active ? "お休み" : "再開"}
                      </button>
                      {plan.is_active && (
                        <button
                          onClick={() => handleDone(plan.id)}
                          disabled={doneToday}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold no-tap-highlight"
                          style={{
                            background: doneToday ? "#E8F9EF" : "#7C5CDB",
                            color: doneToday ? "#38C074" : "#FFFFFF",
                          }}
                        >
                          {doneToday ? "✓ 今日できた" : "やった！"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 追加フォーム */}
        <form onSubmit={handleAdd} className="card space-y-4">
          <p className="text-sm font-bold" style={{ color: "#1C1A2E" }}>
            ＋ 新しいIf-Thenをつくる
          </p>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#7B78A0" }}>
              もし（いつもの習慣）
            </label>
            <input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="朝コーヒーを淹れたら"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#F8F7FF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TRIGGER_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setTrigger(p)}
                  className="text-xs px-2.5 py-1 rounded-full no-tap-highlight"
                  style={{ background: "#EDE9F9", color: "#7C5CDB" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#7B78A0" }}>
              そのとき（超・小さな行動）
            </label>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="起業ノートを1ページ開く"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#F8F7FF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ACTION_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setAction(p)}
                  className="text-xs px-2.5 py-1 rounded-full no-tap-highlight"
                  style={{ background: "#EDE9F9", color: "#7C5CDB" }}
                >
                  {p}
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
            登録する
          </button>
        </form>
      </main>
    </div>
  );
}
