"use client";

import { useState, useEffect, useRef } from "react";
import { completeDeepDiagnosis } from "@/app/actions/onboarding";
import type { DeepDiagnosisData } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";

/**
 * オンボーディングフロー（6カード＋目標設定）
 *
 * Card A: エネルギー棚卸し（増える・減る）
 * Card B: 得意の正体（早く終わること・褒められること・再現手順）
 * Card C: 苦手の正体（止まる状況・詰まる状態・消耗トリガー）
 * Card D: やる気の燃料（SDT: 自律性・有能感・関係性）
 * Card E: 勝てる環境（時間帯・場所・相手・負けやすい条件）
 * Card F: 自己定義＋やらないこと
 * → 目標設定（今年向き合いたい領域）
 * → 成果物3枚プレビュー
 * → 完了
 */

const TOTAL_STEPS = 6; // カードA〜Fの6枚

const GOAL_AREAS = [
  { id: "work",         label: "仕事・キャリア", emoji: "💼", desc: "昇進・副業・転職" },
  { id: "learning",    label: "学習・スキル",   emoji: "📚", desc: "資格・勉強・成長" },
  { id: "creation",    label: "作品・創作",     emoji: "🎨", desc: "制作・プロジェクト" },
  { id: "health",      label: "健康・体",       emoji: "💪", desc: "運動・食事・睡眠" },
  { id: "relationship",label: "人・生活",       emoji: "🌟", desc: "人間関係・環境" },
];

// ─── 共通ヘッダー ────────────────────────────────────────────
function CardHeader({
  step, title, sub,
}: { step: number; title: string; sub: string }) {
  return (
    <div className="mb-6">
      {/* 進捗バー（カードA〜Fのみ） */}
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
      {/* タイトル */}
      <p className="text-xs font-semibold tracking-wide mb-1" style={{ color: "#7C5CDB" }}>
        CARD {String.fromCharCode(64 + step)}
      </p>
      <h2 className="text-2xl font-bold mb-1" style={{ color: "#1C1A2E" }}>{title}</h2>
      <p className="text-sm" style={{ color: "#7B78A0" }}>{sub}</p>
    </div>
  );
}

// ─── テキストエリア ──────────────────────────────────────────
function TextArea({
  value, onChange, placeholder, rows = 3,
}: { value: string; onChange: (v: string) => void; placeholder: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl text-base outline-none resize-none transition-all"
      style={{
        background: "#F3F1FC", border: "1.5px solid #E8E4F8", color: "#1C1A2E",
        lineHeight: 1.6,
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

// ─── テキスト入力（1行） ─────────────────────────────────────
function TextInput({
  value, onChange, placeholder, label,
}: { value: string; onChange: (v: string) => void; placeholder: string; label?: string }) {
  return (
    <div>
      {label && <p className="text-sm font-medium mb-1.5" style={{ color: "#7B78A0" }}>{label}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-xl text-base outline-none transition-all"
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

// ─── SDTスライダー ───────────────────────────────────────────
function SDTSlider({
  label, desc, value, onChange,
}: { label: string; desc: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="card mb-3">
      <p className="text-sm font-bold mb-0.5" style={{ color: "#1C1A2E" }}>{label}</p>
      <p className="text-xs mb-3" style={{ color: "#7B78A0" }}>{desc}</p>
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: "#B0ACC8" }}>あまり</span>
        <div className="flex-1 flex gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 no-tap-highlight"
              style={{
                background: value === v ? "#7C5CDB" : "#F3F1FC",
                color: value === v ? "#FFFFFF" : "#7B78A0",
                border: `1.5px solid ${value === v ? "#7C5CDB" : "#E8E4F8"}`,
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="text-xs" style={{ color: "#B0ACC8" }}>とても</span>
      </div>
    </div>
  );
}

// ─── SDT優位型の判定 ─────────────────────────────────────────
function getSdtType(autonomy: number, competence: number, relatedness: number): string {
  const max = Math.max(autonomy, competence, relatedness);
  if (autonomy === max && autonomy > competence && autonomy > relatedness) return "⚡ 自律性型（自分で決めると燃える）";
  if (competence === max && competence > autonomy && competence > relatedness) return "✨ 有能感型（成長実感で燃える）";
  if (relatedness === max && relatedness > autonomy && relatedness > competence) return "🤝 関係性型（誰かと一緒で燃える）";
  // 同点の場合は優先順位で決定
  if (autonomy === max) return "⚡ 自律性型（自分で決めると燃える）";
  if (competence === max) return "✨ 有能感型（成長実感で燃える）";
  return "🤝 関係性型（誰かと一緒で燃える）";
}

// ─── メインコンポーネント ────────────────────────────────────

interface OnboardingFlowProps {
  initialProgress: unknown;
  isGuest: boolean;
}

export default function OnboardingFlow({ isGuest }: OnboardingFlowProps) {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const [step, setStep]   = useState(1);
  const [saving, setSaving] = useState(false);

  // Card A: エネルギー棚卸し
  const [energize, setEnergize] = useState("");
  const [drains, setDrains]     = useState("");

  // Card B: 得意の正体（早く終わること・褒められること・再現手順）
  const [strengths, setStrengths] = useState(["", "", ""]);

  // Card C: 苦手の正体（止まる状況・詰まる状態・消耗トリガー）
  const [weaknesses, setWeaknesses] = useState(["", "", ""]);

  // Card D: やる気の燃料（SDT）
  const [autonomy, setAutonomy]       = useState(3);
  const [competence, setCompetence]   = useState(3);
  const [relatedness, setRelatedness] = useState(3);

  // Card E: 勝てる環境
  const [winTime, setWinTime]           = useState("");
  const [winPlace, setWinPlace]         = useState("");
  const [winPerson, setWinPerson]       = useState("");
  const [loseCondition, setLoseCondition] = useState("");

  // Card F: 自己定義
  const [selfDef, setSelfDef] = useState("");
  const [noList, setNoList]   = useState(["", "", ""]);

  // 目標設定（Step 7）
  const [goalArea, setGoalArea] = useState<string | null>(null);
  const [goalText, setGoalText] = useState("");

  // ステップ変更時にスクロールをトップへ
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  function nextStep() { setStep((s) => s + 1); }
  function prevStep() { setStep((s) => Math.max(1, s - 1)); }

  async function handleComplete() {
    setSaving(true);
    // Card E の4フィールドを1つのテキストにまとめて保存
    const winContext = [
      winTime      && `勝てる時間帯: ${winTime}`,
      winPlace     && `勝てる場所: ${winPlace}`,
      winPerson    && `勝てる相手: ${winPerson}`,
      loseCondition && `苦手な条件: ${loseCondition}`,
    ].filter(Boolean).join("\n");

    const data: DeepDiagnosisData = {
      energize, drains, strengths, weaknesses,
      autonomy, competence, relatedness,
      winContext, selfDef, noList,
      goalArea: goalArea ?? undefined,
      goalText: goalText || undefined,
    };

    if (isGuest) {
      localStorage.setItem("az_deep_diagnosis", JSON.stringify(data));
      router.push("/register");
      return;
    }

    try {
      await completeDeepDiagnosis(data);
    } catch {
      // redirect()はエラーをthrowするので正常処理
    }
  }

  const sdtType = getSdtType(autonomy, competence, relatedness);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF9FF" }}>
      {/* ヘッダー */}
      <header className="px-5 pt-10 pb-2 flex items-center justify-between">
        <span className="text-xl font-bold" style={{ color: "#7C5CDB" }}>AZ</span>
        {step > 1 && (
          <button onClick={prevStep} className="text-sm no-tap-highlight" style={{ color: "#7B78A0" }}>
            ← 戻る
          </button>
        )}
      </header>

      <main ref={mainRef} className="flex-1 px-5 py-4 overflow-y-auto pb-24">

        {/* ── Card A: エネルギー棚卸し ── */}
        {step === 1 && (
          <div>
            <CardHeader step={1} title="エネルギー棚卸し" sub="「動くエネルギー源」と「消耗するもの」を探ろう" />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#1C1A2E" }}>
                  ⚡ やった後にエネルギーが増えること・没頭できること
                </p>
                <TextArea
                  value={energize}
                  onChange={setEnergize}
                  placeholder="例：人と話す、コードを書く、企画を考える、料理する…"
                  rows={3}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#1C1A2E" }}>
                  🌪 やった後に疲れる・ついつい後回しにすること
                </p>
                <TextArea
                  value={drains}
                  onChange={setDrains}
                  placeholder="例：細かい書類仕事、長時間の会議、ルーティン作業…"
                  rows={3}
                />
              </div>
              <p className="text-xs" style={{ color: "#B0ACC8" }}>
                どちらか一方だけでもOK。正直に書くほど精度が上がります
              </p>
            </div>
          </div>
        )}

        {/* ── Card B: 得意の正体 ── */}
        {step === 2 && (
          <div>
            <CardHeader step={2} title="得意の正体" sub="「自然とできること」の核心を言葉にしよう" />
            <div className="space-y-3">
              <TextInput
                label="なぜか早く終わること・苦にならないこと"
                value={strengths[0]}
                onChange={(v) => { const next = [...strengths]; next[0] = v; setStrengths(next); }}
                placeholder="例：資料をまとめる、人の話を聞く、アイデアを出す"
              />
              <TextInput
                label="よく褒められること・頼まれること"
                value={strengths[1]}
                onChange={(v) => { const next = [...strengths]; next[1] = v; setStrengths(next); }}
                placeholder="例：わかりやすい説明、場の空気を読む、スピードが速い"
              />
              <TextInput
                label="それをどうやってやっている？（再現手順）"
                value={strengths[2]}
                onChange={(v) => { const next = [...strengths]; next[2] = v; setStrengths(next); }}
                placeholder="例：まず全体像を掴んでから、小さく分割して一つずつ"
              />
              <p className="text-xs" style={{ color: "#B0ACC8" }}>
                「当たり前」と思っていることが得意なことです。空欄でも次へ進めます
              </p>
            </div>
          </div>
        )}

        {/* ── Card C: 苦手の正体 ── */}
        {step === 3 && (
          <div>
            <CardHeader step={3} title="苦手の正体" sub="止まる条件を正直に書こう（弱点じゃなく特性）" />
            <div className="space-y-3">
              <TextInput
                label="こんな状況だと動けなくなる"
                value={weaknesses[0]}
                onChange={(v) => { const next = [...weaknesses]; next[0] = v; setWeaknesses(next); }}
                placeholder="例：ゴールが曖昧なとき、最初の一手がわからないとき"
              />
              <TextInput
                label="詰まる直前、どんな状態にある？"
                value={weaknesses[1]}
                onChange={(v) => { const next = [...weaknesses]; next[1] = v; setWeaknesses(next); }}
                placeholder="例：眠い・疲れている、SNSを見た後、一人で長時間いるとき"
              />
              <TextInput
                label="エネルギーが一番奪われること"
                value={weaknesses[2]}
                onChange={(v) => { const next = [...weaknesses]; next[2] = v; setWeaknesses(next); }}
                placeholder="例：細かいルール対応、比較される環境、急な予定変更"
              />
              <p className="text-xs" style={{ color: "#B0ACC8" }}>
                苦手は「向いていないこと」ではなく「エネルギーを多く使うこと」です
              </p>
            </div>
          </div>
        )}

        {/* ── Card D: やる気の燃料（SDT） ── */}
        {step === 4 && (
          <div>
            <CardHeader step={4} title="やる気の燃料" sub="自己決定理論（SDT）でモチベーションの傾向を確認しよう" />
            <SDTSlider
              label="自律性"
              desc="「自分で決めて動きたい」という気持ちはどのくらい強い？"
              value={autonomy} onChange={setAutonomy}
            />
            <SDTSlider
              label="有能感"
              desc="「成長した・うまくできた」という感覚がモチベーションになる？"
              value={competence} onChange={setCompetence}
            />
            <SDTSlider
              label="関係性"
              desc="「誰かと一緒に」「誰かのために」という感覚が大切？"
              value={relatedness} onChange={setRelatedness}
            />
            <div className="rounded-2xl p-4 mt-2" style={{ background: "#F3F1FC" }}>
              <p className="text-xs font-medium" style={{ color: "#7C5CDB" }}>あなたの優位な燃料タイプ</p>
              <p className="font-bold mt-1" style={{ color: "#1C1A2E" }}>{sdtType}</p>
            </div>
          </div>
        )}

        {/* ── Card E: 勝てる環境 ── */}
        {step === 5 && (
          <div>
            <CardHeader step={5} title="勝てる環境" sub="どんな条件がそろうと、一番力を発揮できる？" />
            <div className="space-y-3">
              <TextInput
                label="⏰ 勝てる時間帯"
                value={winTime}
                onChange={setWinTime}
                placeholder="例：午前中の2時間、夜の静かな時間"
              />
              <TextInput
                label="📍 勝てる場所"
                value={winPlace}
                onChange={setWinPlace}
                placeholder="例：静かなカフェ、自分の部屋、図書館"
              />
              <TextInput
                label="🤝 一緒にいると力が出る相手・状況"
                value={winPerson}
                onChange={setWinPerson}
                placeholder="例：信頼できる1人と作業、完全に一人、チームでワイワイ"
              />
              <TextInput
                label="⚠️ 負けやすい条件（避けたい状況）"
                value={loseCondition}
                onChange={setLoseCondition}
                placeholder="例：急な予定変更、指示が曖昧、ざわついた環境"
              />
            </div>
          </div>
        )}

        {/* ── Card F: 自己定義＋やらないこと ── */}
        {step === 6 && (
          <div>
            <CardHeader step={6} title="自己定義" sub="「自分とは何か」を一文と、やらないことで定義しよう" />
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#1C1A2E" }}>
                  📖 一文で自分を表すなら？
                </p>
                <TextArea
                  value={selfDef}
                  onChange={setSelfDef}
                  placeholder="例：私は、人が本来持っている力を引き出すことで、世界をより良くする人間だ"
                  rows={3}
                />
                <p className="text-xs mt-1" style={{ color: "#B0ACC8" }}>完璧じゃなくていい。今の自分の感覚でOK。空欄でも次へ進めます</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#1C1A2E" }}>
                  🚫 やらないこと（1〜3つ）
                </p>
                <div className="space-y-2">
                  {noList.map((n, i) => (
                    <TextInput
                      key={i}
                      value={n}
                      onChange={(v) => {
                        const next = [...noList]; next[i] = v; setNoList(next);
                      }}
                      placeholder={[
                        "例：気が乗らない仕事を無理に引き受けない",
                        "例：他人と比較して自分を評価しない",
                        "例：睡眠を削って働かない",
                      ][i]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 目標設定（Step 7）── */}
        {step === 7 && (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "#E8E4F8" }}>
                  <div className="h-1.5 rounded-full" style={{ width: "100%", background: "linear-gradient(90deg, #7C5CDB, #9B72E6)" }} />
                </div>
                <span className="text-xs font-medium flex-shrink-0" style={{ color: "#7C5CDB" }}>完了 ✓</span>
              </div>
              <p className="text-xs font-semibold tracking-wide mb-1" style={{ color: "#7C5CDB" }}>目標設定</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#1C1A2E" }}>今年、最も向き合いたい<br /><span style={{ color: "#F5A623" }}>領域</span>はどれ？</h2>
              <p className="text-sm" style={{ color: "#7B78A0" }}>1つだけ選んで。後からいつでも変えられます</p>
            </div>

            <div className="space-y-3">
              {GOAL_AREAS.map((area) => {
                const isSelected = goalArea === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() => setGoalArea(area.id)}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 active:scale-98 no-tap-highlight"
                    style={{
                      border: `1.5px solid ${isSelected ? "#F5A623" : "#E8E4F8"}`,
                      background: isSelected ? "rgba(245,166,35,0.08)" : "#FFFFFF",
                    }}
                  >
                    <span className="text-2xl">{area.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: isSelected ? "#C98B0A" : "#1C1A2E" }}>
                        {area.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#7B78A0" }}>{area.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#F5A623" }}>
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {goalArea && (
              <div className="mt-4 space-y-2">
                <label className="block text-sm" style={{ color: "#7B78A0" }}>
                  今年中に達成したいことを一言で（任意）
                </label>
                <TextInput
                  value={goalText}
                  onChange={setGoalText}
                  placeholder="例：副業で月5万円を達成する"
                />
              </div>
            )}

            <p className="text-xs mt-3" style={{ color: "#B0ACC8" }}>
              スキップして次へ進むこともできます
            </p>
          </div>
        )}

        {/* ── 成果物プレビュー（Step 8）── */}
        {step === 8 && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-wide mb-1" style={{ color: "#7C5CDB" }}>完成！</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#1C1A2E" }}>取扱説明書が<br />できました</h2>
              <p className="text-sm" style={{ color: "#7B78A0" }}>3枚の成果物を確認しよう</p>
            </div>

            <div className="space-y-4">
              {/* 推進剤マップ */}
              <div className="rounded-2xl p-5" style={{ background: "#FEF5E4", border: "1.5px solid #F5D98B" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#C98B0A" }}>⚡ 推進剤マップ</p>
                <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>
                  {energize || "（未入力）"}
                </p>
                <p className="text-xs mt-2" style={{ color: "#C98B0A" }}>
                  SDT優位：{sdtType.split("（")[0].replace(/^[^ ]+ /, "")}
                </p>
              </div>

              {/* 停止装置マップ */}
              <div className="rounded-2xl p-5" style={{ background: "#FEE8E8", border: "1.5px solid #F5BCBC" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#C0392B" }}>🛑 停止装置マップ</p>
                <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>
                  {weaknesses.filter(Boolean).join("、") || drains || "（未入力）"}
                </p>
              </div>

              {/* 勝てる条件マップ */}
              <div className="rounded-2xl p-5" style={{ background: "#E8F9EF", border: "1.5px solid #B8E8CC" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#27A85F" }}>🏆 勝てる条件マップ</p>
                <div className="space-y-1">
                  {winTime      && <p className="text-sm" style={{ color: "#1C1A2E" }}>⏰ {winTime}</p>}
                  {winPlace     && <p className="text-sm" style={{ color: "#1C1A2E" }}>📍 {winPlace}</p>}
                  {winPerson    && <p className="text-sm" style={{ color: "#1C1A2E" }}>🤝 {winPerson}</p>}
                  {loseCondition && <p className="text-sm" style={{ color: "#C0392B" }}>⚠️ {loseCondition}</p>}
                  {!winTime && !winPlace && !winPerson && !loseCondition && (
                    <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>（未入力）</p>
                  )}
                </div>
              </div>

              {/* 自己定義 */}
              {selfDef && (
                <div className="rounded-2xl p-5" style={{ background: "#F3F1FC", border: "1.5px solid #C8BEF0" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#7C5CDB" }}>📖 自己定義</p>
                  <p className="text-sm font-medium italic" style={{ color: "#1C1A2E" }}>「{selfDef}」</p>
                </div>
              )}

              {/* 今年の目標 */}
              {goalArea && (
                <div className="rounded-2xl p-5" style={{ background: "#FEF5E4", border: "1.5px solid #F5D98B" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#C98B0A" }}>🎯 今年の目標領域</p>
                  <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>
                    {GOAL_AREAS.find(a => a.id === goalArea)?.emoji} {GOAL_AREAS.find(a => a.id === goalArea)?.label}
                    {goalText && `：${goalText}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ナビゲーションボタン ── */}
        <div className="mt-8">
          {step < 6 && (
            <button
              onClick={nextStep}
              className="btn-primary no-tap-highlight"
            >
              次へ →
            </button>
          )}
          {step === 6 && (
            <button onClick={nextStep} className="btn-primary no-tap-highlight">
              目標設定へ →
            </button>
          )}
          {step === 7 && (
            <button onClick={nextStep} className="btn-primary no-tap-highlight">
              取扱説明書を見る ✨
            </button>
          )}
          {step === 8 && (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="btn-primary no-tap-highlight"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "保存中…" : isGuest ? "登録して保存する →" : "ホームへ進む →"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
