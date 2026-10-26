import { AZ_SELF_PERSONA, callClaudeJSON } from "./client";
import { BRAKE_INFO, type BrakeType } from "@/lib/brake/data";

/**
 * 90日ロードマップ（マイクロステップ化）
 * 3フェーズ × 各4週 = 12週（約90日）
 */

export interface RoadmapWeek {
  week: number;
  step: string;
  minutes: number;
}

export interface RoadmapPhase {
  name: string;
  theme: string;
  weeks: RoadmapWeek[];
}

export interface RoadmapPlan {
  vision: string;
  phases: RoadmapPhase[];
  if_then: { trigger: string; action: string };
  first_step: string;
}

export interface RoadmapInput {
  goal: string;
  current: string;
  brake: BrakeType | null;
  minutesPerDay: number;
}

export async function generateRoadmap(input: RoadmapInput): Promise<RoadmapPlan> {
  const brake = input.brake ? BRAKE_INFO[input.brake] : null;

  const prompt = `ユーザー専用の「90日ロードマップ」を作ってください。

【ゴール】${input.goal}
【現在地】${input.current || "（未記入）"}
【1日に使える時間】${input.minutesPerDay}分
【ブレーキ】${brake ? `${brake.name}（${brake.stepStyle}）` : "未診断"}

設計ルール：
- 3フェーズ（Day1-30 / Day31-60 / Day61-90）、各フェーズ4週、合計12週
- 各週に「毎日くり返す超・小さなステップ」を1つ。失敗しようがないサイズにする
- 第1週は1〜2分で終わる行動から。週を追うごとに少しずつ大きくする（ただし1日の時間を超えない）
- ブレーキの特性を踏まないように設計する
- 「調べる」ではなく「〇〇を1つ開く」レベルの具体的な動詞で書く
- if_then は日常の既存習慣をきっかけにした「もし〜したら、〜する」

次のJSONのみで返してください：
{
  "vision": "90日後のありたい姿（1〜2文、肯定的に）",
  "phases": [
    {"name": "フェーズ名（例：芽吹き期）", "theme": "このフェーズの狙い（1文）",
     "weeks": [{"week": 1, "step": "毎日のステップ（30文字以内）", "minutes": 2}, ...4週分]},
    ...3フェーズ
  ],
  "if_then": {"trigger": "きっかけ（例：朝コーヒーを淹れたら）", "action": "行動（例：起業ノートを1ページ開く）"},
  "first_step": "今日いますぐできる最初の一歩（30文字以内）"
}`;

  const plan = await callClaudeJSON<RoadmapPlan>({
    system: AZ_SELF_PERSONA + "\nあなたは行動科学に基づく習慣設計の専門家でもあります。必ずJSONのみで返してください。",
    prompt,
    maxTokens: 8000,
  });

  if (!Array.isArray(plan.phases) || plan.phases.length === 0) {
    throw new Error("ロードマップの形式が不正です");
  }
  return plan;
}

/**
 * AIが使えないとき用のテンプレートロードマップ
 * ゴール文を埋め込んで、段階的に負荷を上げる
 */
export function fallbackRoadmap(input: RoadmapInput): RoadmapPlan {
  const g = input.goal;
  const m = Math.max(5, input.minutesPerDay);
  const step = (week: number, text: string, minutes: number): RoadmapWeek => ({
    week,
    step: text,
    minutes: Math.min(minutes, m),
  });

  return {
    vision: `90日後、「${g}」に向けて毎日自然に手が動いている自分になっている。`,
    phases: [
      {
        name: "芽吹き期",
        theme: "脳に「これは安全だ」と覚えてもらう",
        weeks: [
          step(1, "ノートを開いてゴールを1行書く", 1),
          step(2, "ゴールに関係するページを1つ開く", 2),
          step(3, "気づいたことを1行メモする", 3),
          step(4, "次にやりたいことを3つ書き出す", 5),
        ],
      },
      {
        name: "根を張る期",
        theme: "小さな行動を毎日の回路にする",
        weeks: [
          step(5, "3つのうち1つに5分だけ取り組む", 5),
          step(6, "昨日の続きを5分だけやる", 5),
          step(7, "10分タイマーで集中する", 10),
          step(8, "1週間の積み上げを振り返る", 10),
        ],
      },
      {
        name: "花ひらく期",
        theme: "積み上げを形にして、自信を確かなものにする",
        weeks: [
          step(9, "成果物の下書きを10分つくる", 10),
          step(10, "下書きを15分だけ磨く", 15),
          step(11, "誰か1人に見せる準備をする", 15),
          step(12, "90日の自分をねぎらい、次の目標を書く", 15),
        ],
      },
    ],
    if_then: { trigger: "朝の飲み物を用意したら", action: `「${g}」のノートを開く` },
    first_step: "ノートを開いてゴールを1行書く",
  };
}

/** 開始日から今日が何週目か（1〜12、範囲外は端に丸める） */
export function currentWeek(startDate: string, today = new Date()): number {
  const start = new Date(startDate + "T00:00:00");
  const days = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.min(12, Math.max(1, Math.floor(days / 7) + 1));
}
