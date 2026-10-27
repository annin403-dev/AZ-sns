"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveEmotionLog } from "@/app/actions/emotion-log";

const MOODS = [
  { id: "great", emoji: "😄", label: "最高" },
  { id: "good", emoji: "🙂", label: "いい感じ" },
  { id: "neutral", emoji: "😐", label: "ふつう" },
  { id: "tired", emoji: "😴", label: "疲れた" },
  { id: "rough", emoji: "😔", label: "しんどい" },
];

/**
 * 今日の気分を記録するボタン＋入力シート
 * 気分・HP/MP・ひとこと・Three Good Things（任意）を1画面で記録する
 */
export default function EmotionLogButton({ hasLog }: { hasLog: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState("neutral");
  const [hp, setHp] = useState(7);
  const [mp, setMp] = useState(7);
  const [memo, setMemo] = useState("");
  const [goods, setGoods] = useState(["", "", ""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const fd = new FormData();
    fd.append("mood", mood);
    fd.append("hp", String(hp));
    fd.append("mp", String(mp));
    fd.append("memo", memo);
    goods.forEach((g, i) => fd.append(`good${i + 1}`, g));
    const res = await saveEmotionLog(fd).catch(() => ({ error: "通信に失敗しました" }));
    setSaving(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    setOpen(false);
    setMemo("");
    setGoods(["", "", ""]);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl text-sm font-medium no-tap-highlight"
        style={{
          background: hasLog ? "#F3F1FC" : "#7C5CDB",
          color: hasLog ? "#7C5CDB" : "#FFFFFF",
        }}
      >
        {hasLog ? "更新" : "記録する"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0" style={{ background: "rgba(28,26,46,0.40)" }} onClick={() => setOpen(false)} />
          <div
            className="relative w-full rounded-t-3xl p-6 animate-slide-up space-y-5"
            style={{
              background: "#FFFFFF",
              maxHeight: "88vh",
              overflowY: "auto",
              paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="w-10 h-1.5 rounded-full mx-auto" style={{ background: "#E8E4F8" }} />
            <h2 className="text-lg font-bold" style={{ color: "#1C1A2E" }}>
              今日の気分は？
            </h2>

            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className="flex flex-col items-center gap-1 py-2 rounded-2xl no-tap-highlight"
                  style={{
                    background: mood === m.id ? "#EDE9F9" : "#F8F7FF",
                    border: `1.5px solid ${mood === m.id ? "#7C5CDB" : "#E8E4F8"}`,
                  }}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs" style={{ color: "#7B78A0" }}>{m.label}</span>
                </button>
              ))}
            </div>

            <Slider label="HP（行動体力）" value={hp} onChange={setHp} color="#F05252" />
            <Slider label="MP（精神エネルギー）" value={mp} onChange={setMp} color="#9060E0" />

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#1C1A2E" }}>ひとこと（任意）</p>
              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="例：午前中は眠かったけど、夕方から元気になった"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#F8F7FF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#1C1A2E" }}>
                今日よかったこと（任意・1つでもOK）
              </p>
              <div className="space-y-2">
                {goods.map((g, i) => (
                  <input
                    key={i}
                    value={g}
                    onChange={(e) => setGoods((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                    placeholder={`${i + 1}. 例：コーヒーがおいしかった`}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#F8F7FF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm" style={{ color: "#F05252" }}>{error}</p>}

            <button onClick={handleSave} disabled={saving} className="btn-primary no-tap-highlight">
              {saving ? "保存中…" : "記録する ✨"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Slider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <p className="text-sm font-semibold" style={{ color: "#1C1A2E" }}>{label}</p>
        <p className="text-sm font-bold" style={{ color }}>{value}/10</p>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}
