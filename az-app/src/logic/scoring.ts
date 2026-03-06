export type JobType =
  | 'pioneer'
  | 'architect'
  | 'creator'
  | 'strategist'
  | 'healer'
  | 'connector'
  | 'scholar'
  | 'storyteller';

export type AuraType =
  | 'challenge'
  | 'stability'
  | 'creation'
  | 'exploration'
  | 'service';

export interface DiagnosisResult {
  jobType: JobType;
  auraType: AuraType;
  typeName: string;
  population: number;
  hp: number;
  mp: number;
  scores: Record<string, number>;
}

export function calculateResult(answers: number[]): DiagnosisResult {
  const q1 = answers[0];
  const q2 = answers[1];
  const q3 = answers[2];
  const q4 = answers[3];
  const q5 = answers[4];
  const q6 = answers[5];
  const q7 = answers[6];
  const q8 = answers[7];
  const q9 = answers[8];
  const q10 = answers[9];
  const q11 = answers[10];
  const q12 = answers[11];
  const q13 = answers[12];
  const q14 = answers[13];
  const q15 = answers[14];
  const q16 = answers[15];

  const jobScores: Record<JobType, number> = {
    pioneer:     q1 * 2 + q5 * 2 + (6 - q6),
    architect:   q6 * 2 + q4 * 2 + (6 - q1),
    creator:     q3 * 2 + q8 * 2 + q11,
    strategist:  (6 - q1) * 2 + q4 * 2 + q6,
    healer:      q2 * 2 + q7 + (6 - q5),
    connector:   q7 * 2 + q2 + q5,
    scholar:     (6 - q1) * 2 + q14 + q12,
    storyteller: q8 * 2 + q2 + q3,
  };

  const auraScores: Record<AuraType, number> = {
    challenge:   q9 * 2 + q5,
    stability:   q10 * 2 + (6 - q5),
    creation:    q11 * 2 + q3,
    exploration: q12 * 2 + q14,
    service:     q2 * 2 + q7 + (6 - q9),
  };

  const jobType = (Object.entries(jobScores) as [JobType, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  const auraType = (Object.entries(auraScores) as [AuraType, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  const hp = Math.round(40 + q13 * 8 + q16 * 4);
  const mp = Math.round(40 + q14 * 8 + (6 - q15) * 4);

  const auraNames: Record<AuraType, string> = {
    challenge: '挑戦',
    stability: '安定',
    creation: '創造',
    exploration: '探究',
    service: '奉仕',
  };

  const jobNames: Record<JobType, string> = {
    pioneer: 'パイオニア',
    architect: 'アーキテクト',
    creator: 'クリエイター',
    strategist: 'ストラテジスト',
    healer: 'ヒーラー',
    connector: 'コネクター',
    scholar: 'スカラー',
    storyteller: 'ストーリーテラー',
  };

  const typeName = `${auraNames[auraType]}${jobNames[jobType]}`;

  const populationMap: Partial<Record<string, number>> = {
    '挑戦パイオニア': 8, '安定パイオニア': 6, '創造パイオニア': 7,
    '探究パイオニア': 5, '奉仕パイオニア': 4,
    '挑戦アーキテクト': 7, '安定アーキテクト': 9, '創造アーキテクト': 5,
    '探究アーキテクト': 6, '奉仕アーキテクト': 4,
    '挑戦クリエイター': 6, '安定クリエイター': 5, '創造クリエイター': 8,
    '探究クリエイター': 4, '奉仕クリエイター': 5,
    '挑戦ストラテジスト': 5, '安定ストラテジスト': 7, '創造ストラテジスト': 4,
    '探究ストラテジスト': 6, '奉仕ストラテジスト': 3,
    '挑戦ヒーラー': 4, '安定ヒーラー': 6, '創造ヒーラー': 4,
    '探究ヒーラー': 3, '奉仕ヒーラー': 7,
    '挑戦コネクター': 5, '安定コネクター': 6, '創造コネクター': 4,
    '探究コネクター': 3, '奉仕コネクター': 5,
    '挑戦スカラー': 3, '安定スカラー': 5, '創造スカラー': 4,
    '探究スカラー': 6, '奉仕スカラー': 4,
    '挑戦ストーリーテラー': 4, '安定ストーリーテラー': 5, '創造ストーリーテラー': 6,
    '探究ストーリーテラー': 4, '奉仕ストーリーテラー': 5,
  };

  const population = populationMap[typeName] ?? 5;

  return {
    jobType,
    auraType,
    typeName,
    population,
    hp: Math.min(100, Math.max(40, hp)),
    mp: Math.min(100, Math.max(40, mp)),
    scores: { ...jobScores, ...auraScores },
  };
}
