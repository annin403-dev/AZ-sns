/**
 * AZタイプ診断 - スコアリングロジック（スライダー式）
 *
 * 入力：15問 × 5段階スペクトラム回答（1=左極, 5=右極, 3=中立）
 * 出力：職業タイプ（8種）× オーラ（5種）= 40タイプのうち1つ
 *
 * 計算方法：
 *   ポジション 1 → 左極 +2
 *   ポジション 2 → 左極 +1
 *   ポジション 3 → 両極 +1（中立）
 *   ポジション 4 → 右極 +1
 *   ポジション 5 → 右極 +2
 *
 *   最終スコアは最大スコアで正規化して比較（タイプごとの登場数の偏りを補正）
 */

import { SLIDER_QUESTIONS, type JobType, type AuraType } from "./questions";

// ─── 型定義 ──────────────────────────────────────────────────

/** スライダー回答（質問ID → ポジション 1〜5） */
export type SliderAnswers = Record<number, number>;

/** 診断スコア集計 */
export interface DiagnosisScore {
  jobScores: Record<JobType, number>;
  auraScores: Record<AuraType, number>;
}

/** 診断結果 */
export interface DiagnosisResult {
  jobType: JobType;
  auraType: AuraType;
  jobScore: number;
  auraScore: number;
  totalAnswers: number;
  allJobScores: Record<JobType, number>;
  allAuraScores: Record<AuraType, number>;
}

// ─── 同点時の優先順位 ─────────────────────────────────────────

const JOB_TYPE_PRIORITY: JobType[] = [
  "Pioneer",
  "Creator",
  "Connector",
  "Healer",
  "Architect",
  "Storyteller",
  "Strategist",
  "Scholar",
];

const AURA_TYPE_PRIORITY: AuraType[] = [
  "創造",
  "挑戦",
  "奉仕",
  "探究",
  "安定",
];

// ─── スコア初期化 ─────────────────────────────────────────────

function initScores(): DiagnosisScore {
  return {
    jobScores: {
      Pioneer: 0,
      Architect: 0,
      Creator: 0,
      Strategist: 0,
      Healer: 0,
      Connector: 0,
      Scholar: 0,
      Storyteller: 0,
    },
    auraScores: {
      挑戦: 0,
      安定: 0,
      創造: 0,
      探究: 0,
      奉仕: 0,
    },
  };
}

// ─── 最大スコア計算（正規化用） ──────────────────────────────

function calculateMaxScores(): DiagnosisScore {
  const max = initScores();
  for (const q of SLIDER_QUESTIONS) {
    max.jobScores[q.leftPole.jobType] += 2;
    max.auraScores[q.leftPole.auraType] += 2;
    max.jobScores[q.rightPole.jobType] += 2;
    max.auraScores[q.rightPole.auraType] += 2;
  }
  return max;
}

// ─── スライダースコア計算 ─────────────────────────────────────

/**
 * スライダー回答からスコアを計算する
 *
 * pos 1 → 左極 +2
 * pos 2 → 左極 +1
 * pos 3 → 両極 +1（中立）
 * pos 4 → 右極 +1
 * pos 5 → 右極 +2
 */
export function calculateSliderScores(answers: SliderAnswers): DiagnosisScore {
  const scores = initScores();

  for (const question of SLIDER_QUESTIONS) {
    const pos = answers[question.id];
    if (!pos) continue;

    let leftW = 0;
    let rightW = 0;
    if (pos === 1) { leftW = 2; rightW = 0; }
    else if (pos === 2) { leftW = 1; rightW = 0; }
    else if (pos === 3) { leftW = 1; rightW = 1; }
    else if (pos === 4) { leftW = 0; rightW = 1; }
    else if (pos === 5) { leftW = 0; rightW = 2; }

    scores.jobScores[question.leftPole.jobType] += leftW;
    scores.auraScores[question.leftPole.auraType] += leftW;
    scores.jobScores[question.rightPole.jobType] += rightW;
    scores.auraScores[question.rightPole.auraType] += rightW;
  }

  return scores;
}

// ─── 結果決定（正規化スコアで比較） ──────────────────────────

export function determineSliderResult(scores: DiagnosisScore): DiagnosisResult {
  const maxScores = calculateMaxScores();

  // 正規化スコアで最高の職業タイプを選ぶ
  let bestJobType: JobType = "Pioneer";
  let bestJobNorm = -1;

  for (const jobType of JOB_TYPE_PRIORITY) {
    const max = maxScores.jobScores[jobType];
    if (max === 0) continue;
    const norm = scores.jobScores[jobType] / max;
    if (norm > bestJobNorm) {
      bestJobNorm = norm;
      bestJobType = jobType;
    }
  }

  // 正規化スコアで最高のオーラタイプを選ぶ
  let bestAuraType: AuraType = "創造";
  let bestAuraNorm = -1;

  for (const auraType of AURA_TYPE_PRIORITY) {
    const max = maxScores.auraScores[auraType];
    if (max === 0) continue;
    const norm = scores.auraScores[auraType] / max;
    if (norm > bestAuraNorm) {
      bestAuraNorm = norm;
      bestAuraType = auraType;
    }
  }

  return {
    jobType: bestJobType,
    auraType: bestAuraType,
    jobScore: scores.jobScores[bestJobType],
    auraScore: scores.auraScores[bestAuraType],
    totalAnswers: Object.values(answers).filter(Boolean).length,
    allJobScores: scores.jobScores,
    allAuraScores: scores.auraScores,
  };
}

/**
 * スライダー回答から診断結果を一括計算（メイン関数）
 */
export function runSliderDiagnosis(answers: SliderAnswers): DiagnosisResult {
  const scores = calculateSliderScores(answers);
  return determineSliderResult(scores);
}
