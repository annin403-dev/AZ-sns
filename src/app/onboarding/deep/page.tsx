"use client";

/**
 * AZ Deep 登録直後フロー
 *
 * 設計書 PART 2「登録直後フロー」に準拠:
 *   Step 0: 幸せの優先順位（5本柱を並べ替え）
 *   Step 1: 幸せトリガー（チェックボックス複数選択）
 *   Step 2: 人生理念（生き方の軸）
 *   Step 3: 夢・人生ビジョン
 *   Step 4: 目標設定（領域 + タイトル + 期限）
 *   Step 5: 完了 → ホームへ
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── 幸せの5本柱 ─────────────────────────────────────────────────
const HAPPINESS_PILLARS = [
  { id: "health",    emoji: "🧘", label: "心と体が健康" },
  { id: "love",      emoji: "💗", label: "愛を感じられる" },
  { id: "efficacy",  emoji: "💪", label: "自分はできると実感" },
  { id: "autonomy",  emoji: "🧭", label: "やりたいことを自分で決める" },
  { id: "enjoy",     emoji: "✨", label: "毎日を楽しめる" },
];

// ─── 幸せトリガー候補 ────────────────────────────────────────────
const HAPPINESS_TRIGGERS = [
  "新しい知識を得た時",
  "誰かに感謝された時",
  "目標を達成した時",
  "好きな人と一緒にいる時",
  "自然の中にいる時",
  "美味しいものを食べた時",
  "1人でゆっくりできた時",
  "何かを作り終えた時",
  "体を動かした後",
  "褒められた時",
  "誰かの役に立てた時",
  "好きなことに没頭している時",
  "新しい場所に行った時",
  "チームで何かを成し遂げた時",
  "自分で決断できた時",
];

// ─── 目標領域 ────────────────────────────────────────────────────
const GOAL_AREAS = [
  { id: "work",    emoji: "💼", label: "仕事・キャリア", desc: "昇進・副業・転職" },
  { id: "learn",   emoji: "📚", label: "学習・スキル",   desc: "資格・勉強・成長" },
  { id: "create",  emoji: "🎨", label: "作品・創作",     desc: "制作・プロジェクト" },
  { id: "health",  emoji: "💪", label: "健康・体",       desc: "運動・食事・睡眠" },
  { id: "connect", emoji: "🌟", label: "人・生活",       desc: "人間関係・環境" },
];

const TOTAL_STEPS = 5;

// ─── ヘッダーコンポーネント ──────────────────────────────────────
function StepHeader({
  step, title, sub,
}: { step: number; title: string; sub: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 rounded-full" style={{ background: "#E8E4F8" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${(step / TOTAL_STEPS) * 100}%`,
              background: "linear-gradient(90deg, #7C5CDB, #9B72E6)",
            }}
          />
        </div>
        <span className="text-xs font-medium flex-shrink-0" style={{ color: "#7B78A0" }}>
          {step}/{TOTAL_STEPS}
        </span>
      </div>
      <h2 className="text-2xl font-bold mb-1" style={{ color: "#1C1A2E" }}>{title}</h2>
      <p className="text-sm" style={{ color: "#7B78A0" }}>{sub}</p>
    </div>
  );
}

// ─── テキストエリア ──────────────────────────────────────────────
function DeepTextArea({
  value, onChange, placeholder, rows = 3,
}: { value: string; onChange: (v: string) => void; placeholder: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl text-base outline-none resize-none"
      style={{
        background: "#F3F1FC",
        border: "1.5px solid #E8E4F8",
        color: "#1C1A2E",
        lineHeight: 1.7,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#7C5CDB";
        e.target.style.boxShadow = "0 0 0 3px rgba(124,92,219,0.12)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#E8E4F8";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

// ─── テキスト入力（1行） ─────────────────────────────────────────
function DeepTextInput({
  value, onChange, placeholder, label,
}: { value: string; onChange: (v: string) => void; placeholder: string; label?: string }) {
  return (
    <div>
      {label && (
        <p className="text-sm font-medium mb-1.5" style={{ color: "#7B78A0" }}>{label}</p>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-xl text-base outline-none"
        style={{ background: "#F3F1FC", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
        onFocus={(e) => {
          e.target.style.borderColor = "#7C5CDB";
          e.target.style.boxShadow = "0 0 0 3px rgba(124,92,219,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E8E4F8";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

// ─── メインコンポーネント ────────────────────────────────────────
export default function DeepOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 0: 幸せ優先順位（並べ替え）
  const [pillarOrder, setPillarOrder] = useState(
    HAPPINESS_PILLARS.map((p) => p.id)
  );
  const [dragging, setDragging] = useState<string | null>(null);

  // Step 1: 幸せトリガー
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  // Step 2: 人生理念
  const [lifePhilosophy, setLifePhilosophy] = useState("");

  // Step 3: 夢・ビジョン
  const [dreamVision, setDreamVision] = useState("");
  const [dreamTimeline, setDreamTimeline] = useState("");

  // Step 4: 目標
  const [goalArea, setGoalArea] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  function nextStep() { setStep((s) => Math.min(s + 1, TOTAL_STEPS)); }
  function prevStep() { setStep((s) => Math.max(s - 1, 1)); }

  // 幸せトリガーのトグル
  function toggleTrigger(trigger: string) {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  }

  // 並べ替え（上下ボタン）
  function movePillar(id: string, dir: -1 | 1) {
    const arr = [...pillarOrder];
    const idx = arr.indexOf(id);
    const next = idx + dir;
    if (next < 0 || next >= arr.length) return;
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setPillarOrder(arr);
  }

  async function handleComplete() {
    setSaving(true);
    const data = {
      pillarOrder,
      selectedTriggers,
      lifePhilosophy,
      dreamVision,
      dreamTimeline,
      goalArea,
      goalTitle,
      goalDeadline,
    };
    localStorage.setItem("az_deep_onboarding", JSON.stringify(data));
    router.push("/home");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF9FF" }}>
      {/* ヘッダー */}
      <header className="px-5 pt-10 pb-2 flex items-center justify-between">
        <span className="text-xl font-bold" style={{ color: "#7C5CDB" }}>AZ Deep</span>
        {step > 1 && (
          <button onClick={prevStep} className="text-sm no-tap-highlight" style={{ color: "#7B78A0" }}>
            ← 戻る
          </button>
        )}
      </header>

      <main className="flex-1 px-5 py-4 overflow-y-auto pb-28">

        {/* ══════════════════════════════════
            Step 1: 幸せの優先順位
        ══════════════════════════════════ */}
        {step === 1 && (
          <div>
            <StepHeader
              step={1}
              title="あなたにとって「幸せ」って？"
              sub="5つの中から、今のあなたが特に大切にしたい順に並べてみて"
            />

            <div className="space-y-2">
              {pillarOrder.map((id, idx) => {
                const pillar = HAPPINESS_PILLARS.find((p) => p.id === id)!;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                    style={{
                      background: idx === 0 ? "#F0EAFC" : "#FFFFFF",
                      border: `1.5px solid ${idx === 0 ? "#7C5CDB" : "#E8E4F8"}`,
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: idx === 0 ? "#7C5CDB" : "#F3F1FC",
                        color: idx === 0 ? "#FFFFFF" : "#7B78A0",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xl">{pillar.emoji}</span>
                    <span
                      className="flex-1 text-sm font-medium"
                      style={{ color: idx === 0 ? "#7C5CDB" : "#1C1A2E" }}
                    >
                      {pillar.label}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => movePillar(id, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded no-tap-highlight"
                        style={{ color: idx === 0 ? "#E8E4F8" : "#7B78A0" }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button
                        onClick={() => movePillar(id, 1)}
                        disabled={idx === pillarOrder.length - 1}
                        className="p-1 rounded no-tap-highlight"
                        style={{ color: idx === pillarOrder.length - 1 ? "#E8E4F8" : "#7B78A0" }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs mt-4" style={{ color: "#B0ACC8" }}>
              ↑↓ ボタンで順番を変えられます。1位が今のあなたにとって最も大切なこと。
            </p>
          </div>
        )}

        {/* ══════════════════════════════════
            Step 2: 幸せトリガー
        ══════════════════════════════════ */}
        {step === 2 && (
          <div>
            <StepHeader
              step={2}
              title="どんな時に幸せを感じる？"
              sub="当てはまるものを全部選んでね"
            />

            <div className="flex flex-wrap gap-2">
              {HAPPINESS_TRIGGERS.map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger);
                return (
                  <button
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className="px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-95 no-tap-highlight"
                    style={{
                      background: isSelected ? "#7C5CDB" : "#F3F1FC",
                      color: isSelected ? "#FFFFFF" : "#7B78A0",
                      border: `1.5px solid ${isSelected ? "#7C5CDB" : "#E8E4F8"}`,
                    }}
                  >
                    {isSelected && "✓ "}{trigger}
                  </button>
                );
              })}
            </div>

            {selectedTriggers.length > 0 && (
              <div
                className="mt-4 rounded-2xl px-4 py-3"
                style={{ background: "#F0EAFC" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#7C5CDB" }}>
                  ✨ {selectedTriggers.length}個選択中
                </p>
                <p className="text-xs mt-1" style={{ color: "#7B78A0" }}>
                  これがあなたの「幸せトリガー」。タスク生成に使います。
                </p>
              </div>
            )}
            <p className="text-xs mt-3" style={{ color: "#B0ACC8" }}>
              1つでもOK。後からいつでも変えられます。
            </p>
          </div>
        )}

        {/* ══════════════════════════════════
            Step 3: 人生理念
        ══════════════════════════════════ */}
        {step === 3 && (
          <div>
            <StepHeader
              step={3}
              title="あなたの人生理念"
              sub="「自分はこう生きたい」という軸を言葉にしよう"
            />

            <div className="space-y-4">
              <div
                className="rounded-2xl px-4 py-3 mb-2"
                style={{ background: "#FEF5E4", border: "1.5px solid #F5D98B" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#C98B0A" }}>
                  💡 ヒント：こんな問いを参考に
                </p>
                <ul className="text-xs mt-1 space-y-1" style={{ color: "#7B78A0" }}>
                  <li>・どんな人として見られたいか？</li>
                  <li>・自分の人生で絶対に大切にしたいことは？</li>
                  <li>・「これだけは曲げたくない」という価値観は？</li>
                </ul>
              </div>
              <DeepTextArea
                value={lifePhilosophy}
                onChange={setLifePhilosophy}
                placeholder="例：私は、関わる人が自分の可能性を信じられるよう、正直で温かい関わりを大切にして生きる。"
                rows={4}
              />
              <p className="text-xs" style={{ color: "#B0ACC8" }}>
                完璧でなくてOK。今の感覚で書いてみて。空欄でも次へ進めます。
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            Step 4: 夢・ビジョン
        ══════════════════════════════════ */}
        {step === 4 && (
          <div>
            <StepHeader
              step={4}
              title="あなたの夢・ビジョン"
              sub="「こんな未来にいたい」を言葉にしよう"
            />

            <div className="space-y-4">
              <DeepTextArea
                value={dreamVision}
                onChange={setDreamVision}
                placeholder="例：ダンス教室を全国に展開して、体を動かす喜びを多くの人に届けたい。"
                rows={4}
              />

              <DeepTextInput
                label="⏰ それはいつ頃のイメージ？"
                value={dreamTimeline}
                onChange={setDreamTimeline}
                placeholder="例：5年後、2030年まで、死ぬまでに…"
              />

              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: "#F0EAFC" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#7C5CDB" }}>
                  🔮 夢は「大きく」書いていいです
                </p>
                <p className="text-xs mt-1" style={{ color: "#7B78A0" }}>
                  今すぐ実現できるかどうかは関係ない。「心が動く未来」を書くだけでOK。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            Step 5: 目標設定
        ══════════════════════════════════ */}
        {step === 5 && (
          <div>
            <StepHeader
              step={5}
              title="まず向き合う目標"
              sub="夢に向かう最初の1歩を決めよう"
            />

            <div className="space-y-3 mb-4">
              {GOAL_AREAS.map((area) => {
                const isSelected = goalArea === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() => setGoalArea(area.id)}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-200 active:scale-98 no-tap-highlight"
                    style={{
                      border: `1.5px solid ${isSelected ? "#7C5CDB" : "#E8E4F8"}`,
                      background: isSelected ? "#F0EAFC" : "#FFFFFF",
                    }}
                  >
                    <span className="text-2xl">{area.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: isSelected ? "#7C5CDB" : "#1C1A2E" }}>
                        {area.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#7B78A0" }}>{area.desc}</div>
                    </div>
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#7C5CDB" }}
                      >
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {goalArea && (
              <div className="space-y-3">
                <DeepTextInput
                  label="🎯 目標タイトル"
                  value={goalTitle}
                  onChange={setGoalTitle}
                  placeholder="例：ダンス教室の第1号を開く"
                />
                <DeepTextInput
                  label="📅 いつまでに？（任意）"
                  value={goalDeadline}
                  onChange={setGoalDeadline}
                  placeholder="例：2025年3月末、今年中、半年以内…"
                />
              </div>
            )}

            <p className="text-xs mt-3" style={{ color: "#B0ACC8" }}>
              後からいつでも変えられます。まずはおおざっぱでOK。
            </p>
          </div>
        )}

        {/* ── ナビゲーションボタン ── */}
        <div className="mt-8">
          {step < TOTAL_STEPS && (
            <button onClick={nextStep} className="btn-primary no-tap-highlight">
              次へ →
            </button>
          )}
          {step === TOTAL_STEPS && (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="btn-primary no-tap-highlight"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "準備中…" : "スタート！毎日を積み上げよう →"}
            </button>
          )}
          {step < TOTAL_STEPS && (
            <button
              onClick={nextStep}
              className="w-full text-center py-3 text-sm mt-2 no-tap-highlight"
              style={{ color: "#B0ACC8" }}
            >
              スキップ
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
