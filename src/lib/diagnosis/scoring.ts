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
export function determineResult(
  scores: DiagnosisScore,
  answers: DiagnosisAnswers = {}
): DiagnosisResult {
  // 選択肢に登場する回数がタイプごとに違う（Pioneerは毎問ある等）ので、
  // 「選べた回数のうち何回選んだか」に直して比べる。これで出やすさの偏りをなくす
  const jobAppear = countAppearances("jobType");
  const auraAppear = countAppearances("auraType");
  const seed = answerSeed(answers);

  const bestJobType = pickBest(JOB_TYPE_PRIORITY, scores.jobScores, jobAppear, seed);
  const bestAuraType = pickBest(AURA_TYPE_PRIORITY, scores.auraScores, auraAppear, seed + 7);

  return {
    jobType: bestJobType,
    auraType: bestAuraType,
    jobScore: scores.jobScores[bestJobType],
    auraScore: scores.auraScores[bestAuraType],
    totalAnswers: Object.keys(scores.jobScores).reduce(
      (sum, key) => sum + scores.jobScores[key as JobType],
      0
    ),
    allJobScores: scores.jobScores,
    allAuraScores: scores.auraScores,
  };
}

/** タイプごとに、全問の選択肢の中で何回登場するか */
function countAppearances(key: "jobType" | "auraType"): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of DIAGNOSIS_QUESTIONS) {
    for (const opt of q.options) {
      counts[opt[key]] = (counts[opt[key]] || 0) + 1;
    }
  }
  return counts;
}

/**
 * 登場回数で割ったスコアが最大のタイプを選ぶ
 * 同点のときは固定の順番ではなく、回答内容から決まる値で選ぶ
 * （同じ回答なら毎回同じ結果、違う回答なら偏らない）
 */
function pickBest<T extends string>(
  types: T[],
  raw: Record<T, number>,
  appear: Record<string, number>,
  seed: number
): T {
  const rate = (t: T) => raw[t] / (appear[t] || 1);
  const max = Math.max(...types.map(rate));
  const tied = types.filter((t) => Math.abs(rate(t) - max) < 1e-9);
  return tied[seed % tied.length];
}

/** 回答の組み合わせから決まる数値（同点の決め手に使う） */
function answerSeed(answers: DiagnosisAnswers): number {
  let h = 0;
  for (const id of Object.keys(answers).sort((a, b) => Number(a) - Number(b))) {
    for (const ch of `${id}${answers[Number(id)]}`) {
      h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    }
  }
  return h;
}

/**
 * 回答から診断結果を一括計算する（メイン関数）
 */
export function runDiagnosis(answers: DiagnosisAnswers): DiagnosisResult {
  const scores = calculateScores(answers);
  return determineResult(scores, answers);
}
