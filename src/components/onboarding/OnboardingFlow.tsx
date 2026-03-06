"use client";

import { useState } from "react";
import { completeDeepDiagnosis } from "@/app/actions/onboarding";
import type { DeepDiagnosisData } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";

/**
 * オンボーディングフロー（6カード）
 *
 * Card A: エネルギー棚卸し
 * Card B: 得意の正体
 * Card C: 苦手の正体
 * Card D: やる気の燃料（SDT）
 * Card E: 勝てる環境
 * Card F: 自己定義＋やらないこと
 * → 成果物3枚プレビュー
 * → 完了
 */

const TOTAL_STEPS = 6;

// ─── 共通ヘッダー ────────────────────────────────────────────
function CardHeader({
  step, title, sub,
}: { step: number; title: string; sub: string }) {
  return (
    <div className="mb-6">
      {/* 進捗バー */}
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

// ─── メインコンポーネント ────────────────────────────────────

interface OnboardingFlowProps {
  initialProgress: unknown;
  isGuest: boolean;
}

export default function OnboardingFlow({ isGuest }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep]   = useState(1);
  const [saving, setSaving] = useState(false);

  // 各カードのデータ
  const [energize, setEnergize]     = useState("");
  const [drains, setDrains]         = useState("");
  const [strengths, setStrengths]   = useState(["", "", ""]);
  const [weaknesses, setWeaknesses] = useState(["", "", ""]);
  const [autonomy, setAutonomy]     = useState(3);
  const [competence, setCompetence] = useState(3);
  const [relatedness, setRelatedness] = useState(3);
  const [winContext, setWinContext]  = useState("");
  const [selfDef, setSelfDef]       = useState("");
  const [noList, setNoList]         = useState(["", "", ""]);

  function nextStep() { setStep((s) => s + 1); }
  function prevStep() { setStep((s) => Math.max(1, s - 1)); }

  async function handleComplete() {
    setSaving(true);
    const data: DeepDiagnosisData = {
      energize, drains, strengths, weaknesses,
      autonomy, competence, relatedness,
      winContext, selfDef, noList,
    };

    if (isGuest) {
      // ゲストはlocalStorageに保存してログイン画面へ
      localStorage.setItem("az_deep_diagnosis", JSON.stringify(data));
      router.push("/register");
      return;
    }

    try {
      await completeDeepDiagnosis(data);
    } catch {
      // redirect()はエラーをthrowするのでcatchして正常処理
    }
  }

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

      <main className="flex-1 px-5 py-4 overflow-y-auto pb-24">

        {/* ── Card A: エネルギー棚卸し ── */}
        {step === 1 && (
          <div>
            <CardHeader step={1} title="エネルギー棚卸し" sub="あなたの「動くエネルギー源」を探ろう" />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#1C1A2E" }}>
                  ⚡ 最近、時間を忘れて没頭できたことは？
                </p>
                <TextArea
                  value={energize}
                  onChange={setEnergize}
                  placeholder="例: コードを書いているとき、人と話しているとき…"
                  rows={3}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#1C1A2E" }}>
                  🌪 ついつい後回しにしてしまうことは？
                </p>
                <TextArea
                  value={drains}
                  onChange={setDrains}
                  placeholder="例: 細かい書類仕事、長時間の会議…"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Card B: 得意の正体 ── */}
        {step === 2 && (
          <div>
            <CardHeader step={2} title="得意の正体" sub="「自然とできること」を3つ言葉にしよう" />
            <div className="space-y-3">
              {strengths.map((s, i) => (
                <TextInput
                  key={i}
                  label={`得意なこと ${i + 1}`}
                  value={s}
                  onChange={(v) => {
                    const next = [...strengths]; next[i] = v; setStrengths(next);
                  }}
                  placeholder={["例: 話を引き出すこと", "例: 複雑な問題をシンプルにすること", "例: 細かい部分に気づくこと"][i]}
                />
              ))}
              <p className="text-xs" style={{ color: "#B0ACC8" }}>
                「よく褒められること」「人に頼まれること」を考えると見つかりやすいです
              </p>
            </div>
          </div>
        )}

        {/* ── Card C: 苦手の正体 ── */}
        {step === 3 && (
          <div>
            <CardHeader step={3} title="苦手の正体" sub="消耗することを正直に書こう（弱点じゃなく特性）" />
            <div className="space-y-3">
              {weaknesses.map((w, i) => (
                <TextInput
                  key={i}
                  label={`消耗すること ${i + 1}`}
                  value={w}
                  onChange={(v) => {
                    const next = [...weaknesses]; next[i] = v; setWeaknesses(next);
                  }}
                  placeholder={["例: 細かいルールへの対応", "例: 一人での長時間作業", "例: 急な予定変更"][i]}
                />
              ))}
              <p className="text-xs" style={{ color: "#B0ACC8" }}>
                苦手は「向いていないこと」ではなく「エネルギーを多く使うこと」です
              </p>
            </div>
          </div>
        )}

        {/* ── Card D: やる気の燃料（SDT） ── */}
        {step === 4 && (
          <div>
            <CardHeader step={4} title="やる気の燃料" sub="自己決定理論（SDT）で動機の傾向を確認しよう" />
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
              <p className="text-xs font-medium" style={{ color: "#7C5CDB" }}>あなたの優位な燃料</p>
              <p className="font-bold mt-1" style={{ color: "#1C1A2E" }}>
                {Math.max(autonomy, competence, relatedness) === autonomy && autonomy >= competence && autonomy >= relatedness
                  ? "⚡ 自律性型（自分で決めると燃える）"
                  : Math.max(autonomy, competence, relatedness) === competence
                  ? "✨ 有能感型（成長実感で燃える）"
                  : "🤝 関係性型（誰かと一緒で燃える）"}
              </p>
            </div>
          </div>
        )}

        {/* ── Card E: 勝てる環境 ── */}
        {step === 5 && (
          <div>
            <CardHeader step={5} title="勝てる環境" sub="どんな条件がそろうと、一番力を発揮できる？" />
            <div className="space-y-4">
              <TextArea
                value={winContext}
                onChange={setWinContext}
                placeholder="例：一人で静かな場所で、締め切りが明確で、自由に進め方を決められると力が出る"
                rows={4}
              />
              <div className="rounded-2xl p-4" style={{ background: "#E8F9EF", border: "1.5px solid #B8E8CC" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "#38C074" }}>ヒント（COM-Bモデル）</p>
                <p className="text-xs" style={{ color: "#1C1A2E" }}>
                  ・<b>能力</b>：何がある状態だとうまくいく？<br/>
                  ・<b>機会</b>：どんな環境・状況のとき？<br/>
                  ・<b>動機</b>：何があるとやりたくなる？
                </p>
              </div>
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
                <p className="text-xs mt-1" style={{ color: "#B0ACC8" }}>完璧じゃなくていい。今の自分の感覚でOK</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#1C1A2E" }}>
                  🚫 やらないこと（3つ）
                </p>
                <div className="space-y-2">
                  {noList.map((n, i) => (
                    <TextInput
                      key={i}
                      value={n}
                      onChange={(v) => {
                        const next = [...noList]; next[i] = v; setNoList(next);
                      }}
                      placeholder={["例：気が乗らない仕事を無理に引き受けない", "例：人の比較で自分を評価しない", "例：睡眠を削って働かない"][i]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 成果物プレビュー ── */}
        {step === 7 && (
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
                  SDT優位：{
                    autonomy >= competence && autonomy >= relatedness ? "自律性型"
                    : competence >= relatedness ? "有能感型"
                    : "関係性型"
                  }
                </p>
              </div>

              {/* 停止装置マップ */}
              <div className="rounded-2xl p-5" style={{ background: "#FEE8E8", border: "1.5px solid #F5BCBC" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#C0392B" }}>🛑 停止装置マップ</p>
                <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>
                  {drains || "（未入力）"}
                </p>
              </div>

              {/* 勝てる条件 */}
              <div className="rounded-2xl p-5" style={{ background: "#E8F9EF", border: "1.5px solid #B8E8CC" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#27A85F" }}>🏆 勝てる条件</p>
                <p className="text-sm font-medium" style={{ color: "#1C1A2E" }}>
                  {winContext || "（未入力）"}
                </p>
              </div>

              {/* 自己定義 */}
              {selfDef && (
                <div className="rounded-2xl p-5" style={{ background: "#F3F1FC", border: "1.5px solid #C8BEF0" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#7C5CDB" }}>📖 自己定義</p>
                  <p className="text-sm font-medium italic" style={{ color: "#1C1A2E" }}>「{selfDef}」</p>
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
              disabled={
                (step === 1 && !energize && !drains) ? false :
                false
              }
              className="btn-primary no-tap-highlight"
            >
              次へ →
            </button>
          )}
          {step === 6 && (
            <button onClick={nextStep} className="btn-primary no-tap-highlight">
              取扱説明書を見る ✨
            </button>
          )}
          {step === 7 && (
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
