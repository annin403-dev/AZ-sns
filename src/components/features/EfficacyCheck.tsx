"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordEfficacy } from "@/app/actions/growth";

/**
 * 今日の自己効力感（1〜10）をワンタップで記録する
 */
export default function EfficacyCheck({ todayScore }: { todayScore: number | null }) {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(todayScore);
  const [saving, setSaving] = useState(false);

  async function handleSelect(value: number) {
    setScore(value);
    setSaving(true);
    await recordEfficacy(value);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl p-3" style={{ background: "#F8F7FF" }}>
      <p className="text-xs font-semibold mb-2" style={{ color: "#1C1A2E" }}>
        今日の「自分ならできる」度は？ {saving && <span style={{ color: "#B0ACC8" }}>保存中…</span>}
      </p>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
          <button
            key={v}
            onClick={() => handleSelect(v)}
            className="py-2 rounded-lg text-xs font-bold no-tap-highlight"
            style={{
              background: score === v ? "#7C5CDB" : "#FFFFFF",
              color: score === v ? "#FFFFFF" : "#7B78A0",
              border: "1px solid #E8E4F8",
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
