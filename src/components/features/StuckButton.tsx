"use client";

import { useState } from "react";
import { saveStuckRecord } from "@/app/actions/ai-coach";

/**
 * 詰まりボタン（CBT 5ステップフロー）
 * ライトテーマ版 - 画面右下に常時表示
 *
 * ステップ：
 * 1. 今何が起きてる？（状況選択）
 * 2. どんな感情？（感情選択）
 * 3. 頭に浮かんだ考えは？（自動思考選択）
 * 4. 別の見方は？（認知の書き換え選択）
 * 5. 次の最小行動は？（行動選択）
 */

const SITUATIONS = [
  "タスクに手が付かない",
  "SNSを見て気分が下がった",
  "気力が湧かない",
  "何から始めればいいかわからない",
  "失敗した・うまくいかなかった",
  "誰かにイライラしている",
];

const EMOTIONS = [
  { emoji: "😔", label: "落ち込み" },
  { emoji: "😰", label: "不安" },
  { emoji: "😤", label: "イライラ" },
  { emoji: "😶", label: "無気力" },
  { emoji: "😕", label: "モヤモヤ" },
  { emoji: "😞", label: "後悔" },
];

const AUTO_THOUGHTS = [
  "自分はダメだ",
  "また失敗した",
  "どうせうまくいかない",
  "他の人はできているのに",
  "もう遅い・手遅れだ",
  "疲れた・もう無理",
];

const ALTERNATIVE_VIEWS = [
  "今は充電が必要な時期かもしれない",
  "完璧じゃなくても、進めば十分",
  "うまくいかないことも、情報のひとつ",
  "誰でも止まる日がある",
  "小さく試せばリスクは小さい",
  "今日できたことを1つ見つけてみよう",
];

const NEXT_ACTIONS = [
  "1分だけ深呼吸する",
  "タスクを1つだけ開く",
  "水を飲む",
  "5分間散歩する",
  "今日できたことを1つ思い出す",
  "誰かに「ありがとう」と言う",
];

type Step = "situation" | "emotion" | "thought" | "reframe" | "action" | "done";

const STEP_CONFIG: Record<Step, { title: string; sub: string }> = {
  situation: { title: "今、何が起きてる？",     sub: "近いものを選んで" },
  emotion:   { title: "そのとき、どんな感情？", sub: "正直に選んでね" },
  thought:   { title: "頭に浮かんだ考えは？",   sub: "自動的に出てきた言葉" },
  reframe:   { title: "別の見方はどれ？",       sub: "ちょっと違う角度から見てみよう" },
  action:    { title: "次の2分でできることは？", sub: "小さくていい" },
  done:      { title: "よくできました ✨",       sub: "記録完了" },
};

const STEPS: Step[] = ["situation", "emotion", "thought", "reframe", "action"];

export default function StuckButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep]     = useState<Step>("situation");
  const [situation, setSituation]   = useState("");
  const [emotion, setEmotion]       = useState("");
  const [thought, setThought]       = useState("");
  const [reframe, setReframe]       = useState("");
  const [nextAction, setNextAction] = useState("");

  function reset() {
    setStep("situation"); setSituation(""); setEmotion("");
    setThought(""); setReframe(""); setNextAction(""); setIsOpen(false);
  }

  async function handleAction(action: string) {
    setNextAction(action);
    await saveStuckRecord({
      situation, emotion,
      auto_thought: thought,
      alternative_view: reframe,
      next_action: action,
    });
    setStep("done");
  }

  const progress = STEPS.indexOf(step) / STEPS.length;
  const config   = STEP_CONFIG[step];

  return (
    <>
      {/* ─── 詰まりボタン（右下固定） ─── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-24 z-40 w-14 h-14 rounded-full
                   flex items-center justify-center shadow-lg no-tap-highlight
                   transition-all duration-200 active:scale-95"
        style={{
          background: "#F05252",
          boxShadow: "0 4px 16px rgba(240,82,82,0.40)",
        }}
        aria-label="詰まりボタン"
      >
        <span className="text-xl">🆘</span>
      </button>

      {/* ─── モーダル ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(28,26,46,0.40)" }}
            onClick={reset}
          />

          {/* シート（下から） */}
          <div
            className="relative w-full rounded-t-3xl p-6 pb-10 animate-slide-up"
            style={{
              background: "#FFFFFF",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            {/* ハンドル */}
            <div className="w-10 h-1.5 rounded-full mx-auto mb-5" style={{ background: "#E8E4F8" }} />

            {/* ヘッダー */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🆘</span>
                <h2 className="text-lg font-bold" style={{ color: "#1C1A2E" }}>{config.title}</h2>
              </div>
              <p className="text-sm" style={{ color: "#7B78A0" }}>{config.sub}</p>
            </div>

            {/* 進捗バー */}
            {step !== "done" && (
              <div className="w-full h-1.5 rounded-full mb-5" style={{ background: "#E8E4F8" }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress * 100}%`, background: "#F05252" }}
                />
              </div>
            )}

            {/* ── ステップ1：状況 ── */}
            {step === "situation" && (
              <div className="space-y-2">
                {SITUATIONS.map((s) => (
                  <button key={s} onClick={() => { setSituation(s); setStep("emotion"); }}
                    className="choice-btn text-sm">{s}</button>
                ))}
              </div>
            )}

            {/* ── ステップ2：感情 ── */}
            {step === "emotion" && (
              <div className="grid grid-cols-3 gap-2">
                {EMOTIONS.map((e) => (
                  <button key={e.label}
                    onClick={() => { setEmotion(e.label); setStep("thought"); }}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl no-tap-highlight active:scale-95 transition-all"
                    style={{ background: "#F3F1FC", border: "1.5px solid #E8E4F8" }}>
                    <span className="text-2xl">{e.emoji}</span>
                    <span className="text-xs font-medium" style={{ color: "#7B78A0" }}>{e.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── ステップ3：自動思考 ── */}
            {step === "thought" && (
              <div className="space-y-2">
                {AUTO_THOUGHTS.map((t) => (
                  <button key={t} onClick={() => { setThought(t); setStep("reframe"); }}
                    className="choice-btn text-sm">{t}</button>
                ))}
              </div>
            )}

            {/* ── ステップ4：リフレーム ── */}
            {step === "reframe" && (
              <div className="space-y-2">
                {ALTERNATIVE_VIEWS.map((v) => (
                  <button key={v} onClick={() => { setReframe(v); setStep("action"); }}
                    className="choice-btn text-sm">💡 {v}</button>
                ))}
              </div>
            )}

            {/* ── ステップ5：次の行動 ── */}
            {step === "action" && (
              <div className="space-y-2">
                {NEXT_ACTIONS.map((a) => (
                  <button key={a} onClick={() => handleAction(a)}
                    className="choice-btn text-sm">▶ {a}</button>
                ))}
              </div>
            )}

            {/* ── 完了 ── */}
            {step === "done" && (
              <div className="text-center py-6 space-y-4">
                <div className="text-5xl">🌟</div>
                <p className="text-base font-semibold" style={{ color: "#1C1A2E" }}>
                  詰まりを乗り越えた記録が<br />残りました
                </p>
                <div className="rounded-2xl p-4" style={{ background: "#F3F1FC" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#7B78A0" }}>次の行動</p>
                  <p className="font-medium" style={{ color: "#7C5CDB" }}>{nextAction}</p>
                </div>
                <button onClick={reset} className="btn-primary no-tap-highlight">閉じる</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
