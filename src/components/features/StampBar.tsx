"use client";

import { useState } from "react";
import { toggleReaction } from "@/app/actions/posts";

export type StampType = "empathy" | "cheer" | "helpful";

const STAMPS: Array<{ type: StampType; emoji: string; label: string }> = [
  { type: "cheer", emoji: "✨", label: "ナイス一歩" },
  { type: "empathy", emoji: "🌱", label: "わかる" },
  { type: "helpful", emoji: "🙏", label: "勇気もらった" },
];

/**
 * 肯定スタンプだけのリアクション
 * 他人の投稿には数を出さず、比較を生まない。自分の投稿にだけ届いた数を見せる
 */
export default function StampBar({
  postId,
  mine,
  receivedCount,
}: {
  postId: string;
  mine: StampType[];
  receivedCount: number | null;
}) {
  const [selected, setSelected] = useState<StampType[]>(mine);

  async function handleTap(type: StampType) {
    const on = !selected.includes(type);
    setSelected((prev) => (on ? [...prev, type] : prev.filter((t) => t !== type)));
    const res = await toggleReaction(postId, type);
    if (res.error) {
      setSelected((prev) => (on ? prev.filter((t) => t !== type) : [...prev, type]));
    }
  }

  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      {receivedCount !== null ? (
        <p className="text-xs" style={{ color: "#7B78A0" }}>
          💌 {receivedCount}個の応援が届いています
        </p>
      ) : (
        STAMPS.map((stamp) => {
          const on = selected.includes(stamp.type);
          return (
            <button
              key={stamp.type}
              onClick={() => handleTap(stamp.type)}
              className="text-xs px-3 py-1.5 rounded-full active:scale-95 transition-all no-tap-highlight"
              style={{
                background: on ? "#EDE9F9" : "#F8F7FF",
                border: `1.5px solid ${on ? "#7C5CDB" : "#E8E4F8"}`,
                color: on ? "#7C5CDB" : "#7B78A0",
                fontWeight: on ? 600 : 400,
              }}
            >
              {stamp.emoji} {stamp.label}
            </button>
          );
        })
      )}
    </div>
  );
}
