/**
 * AZタイプ診断 - スコアリングロジック（3フォーマット混合）
 *
 * Part 1 バイポーラ（1〜5）
 *   pos 1 → 左極 +2
 *   pos 2 → 左極 +1
 *   pos 3 → 両極 +1（中立）
 *   pos 4 → 右極 +1
 *   pos 5 → 右極 +2
 *
 * Part 2 シナリオ4択
 *   選択した選択肢の jobType / auraType に +2
 *
 * Part 3 共感度（1〜5）
 *   pos 1 → +0.0  (全くそう思わない)
 *   pos 2 → +0.5
 *   pos 3 → +1.0  (どちらでもない)
 *   pos 4 → +1.5
 *   pos 5 → +2.0  (とても当てはまる)
 *
 * 最終判定：各タイプの「最大可能スコアに対する正規化スコア」で比較
 * （質問ごとの出現数の偏りを補正する）
 */

import {
  MIXED_QUESTIONS,
  type JobType,
  type AuraType,
  type DiagnosisQuestion,
} from "./questions";

// ─── 型定義 ──────────────────────────────────────────────────

/**
 * 回答データ
 *   - バイポーラ / 共感度：数値 1〜5
 *   - シナリオ：文字列 "a"|"b"|"c"|"d"
 */
export type MixedAnswers = Record<number, number | string>;

/** 診断スコア集計 */
export interface DiagnosisScore {
  jobScores:  Record<JobType,  number>;
  auraScores: Record<AuraType, number>;
}

/** 診断結果 */
export interface DiagnosisResult {
  jobType:       JobType;
  auraType:      AuraType;
  jobScore:      number;
  auraScore:     number;
  totalAnswers:  number;
  allJobScores:  Record<JobType,  number>;
  allAuraScores: Record<AuraType, number>;
}

// ─── 同点時の優先順位 ─────────────────────────────────────────

const JOB_PRIORITY: JobType[] = [
  "Pioneer", "Creator", "Connector", "Healer",
  "Architect", "Storyteller", "Strategist", "Scholar",
];

const AURA_PRIORITY: AuraType[] = [
  "創造", "挑戦", "奉仕", "探究", "安定",
];

// ─── スコア初期化 ─────────────────────────────────────────────

function initScores(): DiagnosisScore {
  return {
    jobScores: {
      Pioneer: 0, Architect: 0, Creator: 0, Strategist: 0,
      Healer: 0, Connector: 0, Scholar: 0, Storyteller: 0,
    },
    auraScores: { 挑戦: 0, 安定: 0, 創造: 0, 探究: 0, 奉仕: 0 },
  };
}

// ─── 最大スコア計算（正規化用） ──────────────────────────────
//
// 各質問タイプ別に「その質問で特定タイプが得られる最大スコア」を積算する
// バイポーラ：左 or 右どちらかで +2（片方しか取れないので max = 2）
// シナリオ：選んだ選択肢で +2（1問1選択なので max = 2/question）
// 共感度：pos 5 で +2

function calculateMaxScores(questions: DiagnosisQuestion[]): DiagnosisScore {
  const max = initScores();

  for (const q of questions) {
    if (q.type === "bipolar") {
      max.jobScores[q.leftPole.jobType]   += 2;
      max.auraScores[q.leftPole.auraType] += 2;
      max.jobScores[q.rightPole.jobType]   += 2;
      max.auraScores[q.rightPole.auraType] += 2;
    } else if (q.type === "scenario") {
      // 各選択肢は排他的なので、各タイプへの最大貢献は
      // 「その質問でそのタイプに対応する選択肢が存在するか」× 2
      const seenJob  = new Set<JobType>();
      const seenAura = new Set<AuraType>();
      for (const opt of q.options) {
        if (!seenJob.has(opt.jobType))  { max.jobScores[opt.jobType]   += 2; seenJob.add(opt.jobType); }
        if (!seenAura.has(opt.auraType)){ max.auraScores[opt.auraType] += 2; seenAura.add(opt.auraType); }
      }
    } else if (q.type === "agreement") {
      max.jobScores[q.targetJobType]   += 2;
      max.auraScores[q.targetAuraType] += 2;
    }
  }

  return max;
}

// ─── スコア計算 ───────────────────────────────────────────────

export function calculateMixedScores(answers: MixedAnswers): DiagnosisScore {
  const scores = initScores();

  for (const q of MIXED_QUESTIONS) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null) continue;

    if (q.type === "bipolar") {
      const pos = raw as number;
      let lw = 0, rw = 0;
      if      (pos === 1) { lw = 2; }
      else if (pos === 2) { lw = 1; }
      else if (pos === 3) { lw = 1; rw = 1; }
      else if (pos === 4) { rw = 1; }
      else if (pos === 5) { rw = 2; }
      scores.jobScores[q.leftPole.jobType]   += lw;
      scores.auraScores[q.leftPole.auraType] += lw;
      scores.jobScores[q.rightPole.jobType]   += rw;
      scores.auraScores[q.rightPole.auraType] += rw;

    } else if (q.type === "scenario") {
      const chosen = raw as string;
      const opt = q.options.find((o) => o.id === chosen);
      if (opt) {
        scores.jobScores[opt.jobType]   += 2;
        scores.auraScores[opt.auraType] += 2;
      }

    } else if (q.type === "agreement") {
      const pos = raw as number;
      const w = (pos - 1) * 0.5; // 1→0, 2→0.5, 3→1.0, 4→1.5, 5→2.0
      scores.jobScores[q.targetJobType]   += w;
      scores.auraScores[q.targetAuraType] += w;
    }
  }

  return scores;
}

// ─── 結果決定 ─────────────────────────────────────────────────

export function determineMixedResult(scores: DiagnosisScore, answers: MixedAnswers): DiagnosisResult {
  const maxScores = calculateMaxScores(MIXED_QUESTIONS);

  // 正規化スコア（0〜1）で最高タイプを選ぶ
  let bestJob: JobType = "Pioneer";
  let bestJobNorm = -1;
  for (const jt of JOB_PRIORITY) {
    const mx = maxScores.jobScores[jt];
    if (mx === 0) continue;
    const norm = scores.jobScores[jt] / mx;
    if (norm > bestJobNorm) { bestJobNorm = norm; bestJob = jt; }
  }

  let bestAura: AuraType = "創造";
  let bestAuraNorm = -1;
  for (const at of AURA_PRIORITY) {
    const mx = maxScores.auraScores[at];
    if (mx === 0) continue;
    const norm = scores.auraScores[at] / mx;
    if (norm > bestAuraNorm) { bestAuraNorm = norm; bestAura = at; }
  }

  return {
    jobType:      bestJob,
    auraType:     bestAura,
    jobScore:     scores.jobScores[bestJob],
    auraScore:    scores.auraScores[bestAura],
    totalAnswers: Object.values(answers).filter((v) => v !== undefined && v !== null).length,
    allJobScores:  scores.jobScores,
    allAuraScores: scores.auraScores,
  };
}

// ─── メイン関数 ───────────────────────────────────────────────

export function runMixedDiagnosis(answers: MixedAnswers): DiagnosisResult {
  const scores = calculateMixedScores(answers);
  return determineMixedResult(scores, answers);
}

