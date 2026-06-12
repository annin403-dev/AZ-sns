/**
 * AZ Deep 診断 — スコアリングロジック
 *
 * 入力：29問の回答（各問でa/b/c/d(/e)のどれかを選択）
 * 出力：
 *   - メインタイプ（エンジン × 走行スタイル = 20種）
 *   - 7軸の全スコア
 *   - HP/MP
 */

import {
  AZ_DEEP_QUESTIONS,
  type EngineType,
  type RunningType,
  type BrakeType,
  type RechargeType,
  type CompassType,
  type DesireType,
} from "./az-deep-questions";

export type DeepAnswers = Record<number, string>;

export interface DeepScores {
  engine: Record<EngineType, number>;
  running: Record<RunningType, number>;
  brake: Record<BrakeType, number>;
  recharge: Record<RechargeType, number>;
  compass: Record<CompassType, number>;
  desire: Record<DesireType, number>;
}

export interface DeepResult {
  engineType: EngineType;
  runningType: RunningType;
  mainTypeKey: string;
  brakeType: BrakeType;
  rechargeType: RechargeType;
  compassType: CompassType;
  desireRanking: DesireType[];
  hp: number;
  mp: number;
  scores: DeepScores;
}

function initScores(): DeepScores {
  return {
    engine:   { 証明: 0, 探究: 0, 貢献: 0, 創造: 0, 自由: 0 },
    running:  { スプリンター: 0, マラソン: 0, サーファー: 0, マグネット: 0 },
    brake:    { 確定回避: 0, 評価恐怖: 0, 完璧準備: 0, 責任重圧: 0, 迷惑回避: 0, 軽微: 0 },
    recharge: { 承認: 0, 内省: 0, 達成: 0, 交流: 0, 体感: 0 },
    compass:  { 達成: 0, 安心: 0, 自由: 0, 絆: 0, 意義: 0 },
    desire:   { 生存: 0, 愛所属: 0, 力: 0, 自由: 0, 楽しみ: 0 },
  };
}

function getTopType<T extends string>(map: Record<T, number>, priority: T[]): T {
  let maxScore = -1;
  let result = priority[0];
  for (const type of priority) {
    if (map[type] > maxScore) {
      maxScore = map[type];
      result = type;
    }
  }
  return result;
}

function rankDesires(scores: Record<DesireType, number>): DesireType[] {
  return (Object.keys(scores) as DesireType[]).sort((a, b) => scores[b] - scores[a]);
}

function calcHPMP(scores: DeepScores): { hp: number; mp: number } {
  const engineMax  = Math.max(...Object.values(scores.engine));
  const brakeMax   = Math.max(...(Object.entries(scores.brake).filter(([k]) => k !== "軽微").map(([, v]) => v)));
  const rechargeMax = Math.max(...Object.values(scores.recharge));
  const compassMax  = Math.max(...Object.values(scores.compass));

  const hp = Math.min(10, Math.max(1, Math.round(
    3 + (engineMax / 5) * 5 + (1 - brakeMax / 5) * 2
  )));
  const mp = Math.min(10, Math.max(1, Math.round(
    2 + (rechargeMax / 5) * 4 + (compassMax / 5) * 4
  )));
  return { hp, mp };
}

const ENGINE_PRIORITY:   EngineType[]   = ["探究", "創造", "貢献", "証明", "自由"];
const RUNNING_PRIORITY:  RunningType[]  = ["マラソン", "スプリンター", "サーファー", "マグネット"];
const BRAKE_PRIORITY:    BrakeType[]    = ["確定回避", "評価恐怖", "完璧準備", "責任重圧", "迷惑回避", "軽微"];
const RECHARGE_PRIORITY: RechargeType[] = ["内省", "達成", "交流", "体感", "承認"];
const COMPASS_PRIORITY:  CompassType[]  = ["意義", "自由", "絆", "達成", "安心"];

export function calculateDeepScores(answers: DeepAnswers): DeepScores {
  const scores = initScores();

  for (const question of AZ_DEEP_QUESTIONS) {
    const selectedId = answers[question.id];
    if (!selectedId) continue;
    const option = question.options.find((o) => o.id === selectedId);
    if (!option) continue;

    switch (option.axis) {
      case "engine":   scores.engine[option.type as EngineType]     += 1; break;
      case "running":  scores.running[option.type as RunningType]    += 1; break;
      case "brake":    scores.brake[option.type as BrakeType]        += 1; break;
      case "recharge": scores.recharge[option.type as RechargeType]  += 1; break;
      case "compass":  scores.compass[option.type as CompassType]    += 1; break;
      case "desire":   scores.desire[option.type as DesireType]      += 1; break;
    }
  }
  return scores;
}

export function determineDeepResult(scores: DeepScores): DeepResult {
  const engineType  = getTopType(scores.engine,   ENGINE_PRIORITY);
  const runningType = getTopType(scores.running,  RUNNING_PRIORITY);

  const brakeNonLightMax = Math.max(
    ...Object.entries(scores.brake).filter(([k]) => k !== "軽微").map(([, v]) => v)
  );
  const brakeType = brakeNonLightMax === 0
    ? "軽微"
    : getTopType(scores.brake, BRAKE_PRIORITY);

  const rechargeType   = getTopType(scores.recharge, RECHARGE_PRIORITY);
  const compassType    = getTopType(scores.compass,  COMPASS_PRIORITY);
  const desireRanking  = rankDesires(scores.desire);
  const { hp, mp }     = calcHPMP(scores);

  return {
    engineType, runningType,
    mainTypeKey: `${engineType}_${runningType}`,
    brakeType, rechargeType, compassType,
    desireRanking, hp, mp, scores,
  };
}

export function runDeepDiagnosis(answers: DeepAnswers): DeepResult {
  return determineDeepResult(calculateDeepScores(answers));
}
