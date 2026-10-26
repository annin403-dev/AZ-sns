"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { submitBrainDump } from "@/app/actions/braindump";
import { addStepToToday } from "@/app/actions/roadmap";
import type { BrainDumpResult } from "@/lib/ai/braindump";

/**
 * ブレインダンプ（ネガティブの浄化）
 * モヤモヤをそのまま吐き出す → AZが「事実・気持ち・心配」に整理 → 次の1分へ
 */
export default function BrainDump() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrainDumpResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const res = await submitBrainDump(text).catch(() => ({ error: "通信に失敗しました" }));
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("result" in res && res.result) setResult(res.result);
  }

  async function handleAdd() {
    if (!result) return;
    const res = await addStepToToday(result.next_step);
    if (!res.error) setAdded(true);
  }

  function reset() {
    setText("");
    setResult(null);
    setAdded(false);
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold mb-1" style={{ color: "#7C5CDB" }}>
          🌀 ブレインダンプ
        </p>
        <h1 className="text-xl font-bold" style={{ color: "#1C1A2E" }}>
          頭の中、ぜんぶ出していいよ
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          誰にも見えません。まとまっていなくて大丈夫
        </p>
      </header>

      <main className="px-5 space-y-4">
        {!result ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="例：今日も何もできなかった。やらなきゃいけないことは分かってるのに、スマホばっかり見てしまう。このままでいいのかな…"
              className="w-full px-4 py-4 rounded-2xl text-base outline-none resize-none leading-relaxed"
              style={{ background: "#FFFFFF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
              disabled={loading}
            />
            {error && (
              <p className="text-sm" style={{ color: "#F05252" }}>
                {error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              className="btn-primary no-tap-highlight"
              style={{ opacity: loading || !text.trim() ? 0.6 : 1 }}
            >
              {loading ? "AZが受け止めています…" : "AZに預ける"}
            </button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="card">
              <p className="text-xs font-semibold mb-2" style={{ color: "#7C5CDB" }}>
                ✨ AZより
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#1C1A2E" }}>
                {result.acceptance}
              </p>
            </div>

            <div className="grid gap-3">
              <SortedBox title="📌 事実" items={result.facts} color="#4090E0" bg="#E8F2FD" />
              <SortedBox title="💗 気持ち" items={result.feelings} color="#F05252" bg="#FEE8E8" />
              <SortedBox
                title="☁️ まだ起きていない心配"
                items={result.worries}
                color="#7B78A0"
                bg="#F3F1FC"
              />
            </div>

            <div className="card">
              <p className="text-sm font-bold mb-1" style={{ color: "#1C1A2E" }}>
                📍 いまのあなたの現在地
              </p>
              <p className="text-sm" style={{ color: "#4A4766" }}>
                {result.position}
              </p>
            </div>

            <div
              className="rounded-3xl p-5"
              style={{ background: "linear-gradient(135deg, #FFFBF0, #FEF5E4)", border: "1.5px solid #F5D98B" }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#C98B0A" }}>
                次の1分でやること
              </p>
              <p className="text-lg font-bold mb-4" style={{ color: "#1C1A2E" }}>
                {result.next_step}
              </p>
              {added ? (
                <Link href="/home" className="btn-secondary block text-center no-tap-highlight">
                  ✅ クエストに追加しました → ホームへ
                </Link>
              ) : (
                <button onClick={handleAdd} className="btn-primary no-tap-highlight">
                  今日のクエストにする
                </button>
              )}
            </div>

            <button onClick={reset} className="btn-ghost w-full no-tap-highlight">
              もう一度書く
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function SortedBox({
  title,
  items,
  color,
  bg,
}: {
  title: string;
  items: string[];
  color: string;
  bg: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl p-4" style={{ background: bg }}>
      <p className="text-xs font-bold mb-2" style={{ color }}>
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm" style={{ color: "#1C1A2E" }}>
            ・{item}
          </li>
        ))}
      </ul>
    </div>
  );
}
