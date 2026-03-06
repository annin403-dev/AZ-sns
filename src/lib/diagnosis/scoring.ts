/**
 * AZタイプ診断 - スコアリングロジック
 *
 * 入力：12問の回答（各問でa/b/c/dのどれかを選択）
 * 出力：職業タイプ（8種） × オーラ（5種）の組み合わせ = 40タイプのうち1つ
 *
 * 計算方法：
 *   1. 各回答の jobType・auraType をカウント
 *   2. 最多のものが結果になる
 *   3. 同点の場合は後述の優先順位で決定
 */

import {
  DIAGNOSIS_QUESTIONS,
  type JobType,
  type AuraType,
} from "./questions";

// ─── 型定義 ──────────────────────────────────────────────────

/** 診断の回答（質問ID → 選択肢ID） */
export type DiagnosisAnswers = Record<number, string>;

/** 診断スコア集計 */
export interface DiagnosisScore {
  jobScores: Record<JobType, number>;
  auraScores: Record<AuraType, number>;
}

/** 診断結果 */
export interface DiagnosisResult {
  jobType: JobType;
  auraType: AuraType;
  /** 職業タイプの得点（確信度として使用） */
  jobScore: number;
  /** オーラの得点（確信度として使用） */
  auraScore: number;
  /** 全回答数（=12） */
  totalAnswers: number;
  /** 職業タイプ別スコア（参考表示用） */
  allJobScores: Record<JobType, number>;
  /** オーラ別スコア（参考表示用） */
  allAuraScores: Record<AuraType, number>;
}

// ─── 同点時の優先順位（タイプのデフォルト） ───────────────────

/** 職業タイプの優先順位（同点時の決め手） */
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

/** オーラの優先順位（同点時の決め手） */
const AURA_TYPE_PRIORITY: AuraType[] = [
  "創造",
  "挑戦",
  "奉仕",
  "探究",
  "安定",
];

// ─── スコア計算 ───────────────────────────────────────────────

/**
 * 初期スコアオブジェクトを作成（全タイプを0で初期化）
 */
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

/**
 * 回答からスコアを計算する
 */
export function calculateScores(answers: DiagnosisAnswers): DiagnosisScore {
  const scores = initScores();

  for (const question of DIAGNOSIS_QUESTIONS) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue; // 未回答はスキップ

    const selectedOption = question.options.find(
      (opt) => opt.id === selectedOptionId
    );
    if (!selectedOption) continue;

    // 職業タイプとオーラのスコアを加算
    scores.jobScores[selectedOption.jobType] += 1;
    scores.auraScores[selectedOption.auraType] += 1;
  }

  return scores;
}

/**
 * スコアから最終的な診断結果を決定する
 *
 * 同点の場合：優先順位リストの上位を選ぶ
 */
export function determineResult(scores: DiagnosisScore): DiagnosisResult {
  // 職業タイプの最高スコアを見つける
  let maxJobScore = 0;
  let bestJobType: JobType = "Pioneer";

  for (const jobType of JOB_TYPE_PRIORITY) {
    const score = scores.jobScores[jobType];
    if (score > maxJobScore) {
      maxJobScore = score;
      bestJobType = jobType;
    }
  }

  // オーラの最高スコアを見つける
  let maxAuraScore = 0;
  let bestAuraType: AuraType = "創造";

  for (const auraType of AURA_TYPE_PRIORITY) {
    const score = scores.auraScores[auraType];
    if (score > maxAuraScore) {
      maxAuraScore = score;
      bestAuraType = auraType;
    }
  }

  return {
    jobType: bestJobType,
    auraType: bestAuraType,
    jobScore: maxJobScore,
    auraScore: maxAuraScore,
    totalAnswers: Object.keys(scores.jobScores).reduce(
      (sum, key) => sum + scores.jobScores[key as JobType],
      0
    ),
    allJobScores: scores.jobScores,
    allAuraScores: scores.auraScores,
  };
}

/**
 * 回答から診断結果を一括計算する（メイン関数）
 */
export function runDiagnosis(answers: DiagnosisAnswers): DiagnosisResult {
  const scores = calculateScores(answers);
  return determineResult(scores);
}
