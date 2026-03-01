import Anthropic from "@anthropic-ai/sdk";
import { CardAData, CardBData, CardCData, CardDData } from "@/types/database.types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * AZコーチのシステムプロンプト
 */
const AZ_COACH_SYSTEM_PROMPT = `あなたはユーザーの「内なる声を引き出す伴走者」であり、自己成長型SNS「AZ〜アズ〜」のAIコーチです。

【絶対に守るルール】
1. 評価しない・比較しない・責めない
2. 「すべき」「しなければ」は絶対に使わない
3. 質問は1回に1つだけ
4. ネガティブな感情を受け取ったら、まず受容→次にポジティブ変換
5. 最終的に必ず「次の2分でできること」に着地させる
6. 常に日本語で話す
7. 温かく、少し神秘的な口調で話す（「〜ですね」より「〜なのですね」のような余韻を大切に）

【ホメオスタシス対応フロー（不安・無理と感じているユーザーへ）】
Step 1: 感情を受け取る「今、〇〇を感じているのですね」
Step 2: 再定義「それはコンフォートゾーンを出た直前に必ず起きる『おめでとう』のサインです」
Step 3: 客観視「自分から少し離れて、空から見下ろすように状況を眺めてみてください」
Step 4: 禁止「絶対に自分を責めないでください。今のネガティブな思考は単なる安全装置です」
Step 5: 最小行動「次の2分でできることは何ですか？」

【応答の長さ】
- 通常のチャット：3〜5文で簡潔に
- 詳しい分析が必要な場合：最大10文まで`;

/**
 * オンボーディング診断結果からソウルタイプを生成する
 */
export async function generateSoulType(
  cardA: CardAData,
  cardB: CardBData,
  cardC: CardCData,
  cardD: CardDData
): Promise<{
  type_name: string;
  type_description: string;
  strengths: string[];
  growth_direction: string;
}> {
  const prompt = `以下のユーザーの診断データをもとに、「オリジナルソウルタイプ」を生成してください。

【エネルギー源（Card A）】
回復する行為: ${cardA.energy_sources.join("、")}
消耗する行為: ${cardA.energy_drains.join("、")}

【停止トリガー（Card B）】
物事が止まる原因: ${cardB.stop_triggers.join("、")}

【やる気の燃料（Card C）】
自律性スコア: ${cardC.autonomy_score}/10
有能感スコア: ${cardC.competence_score}/10
関係性スコア: ${cardC.relatedness_score}/10

【目標領域（Card D）】
領域: ${cardD.goal_area}
${cardD.goal_text ? `目標: ${cardD.goal_text}` : ""}

以下のJSON形式で返してください（他のテキストは一切含めない）：
{
  "type_name": "神話・自然・宇宙・ファンタジーの世界観からの命名（例：「光を運ぶ開拓者」「静寂を守る賢者」「嵐を呼ぶ革命児」）",
  "type_description": "このタイプの本質的な説明（3〜4文。弱みを強みに変換する視点で。肯定的・カッコよく）",
  "strengths": ["強み1（10文字以内）", "強み2（10文字以内）", "強み3（10文字以内）"],
  "growth_direction": "このタイプが輝く成長の方向性（2文）"
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    system:
      "あなたはユーザーの内なる才能を引き出す命名の達人です。神話・自然・宇宙・ファンタジーの世界観から、その人だけの「ソウルタイプ」を命名します。必ずJSON形式のみで返してください。",
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("AIからの応答が不正です");
  }

  try {
    const result = JSON.parse(content.text);
    return result;
  } catch {
    throw new Error("AIからの応答をパースできませんでした");
  }
}

/**
 * 今日の光のタスク（3つ）を生成する
 */
export async function generateDailyTasks(
  energySources: string[],
  stopTriggers: string[],
  goalArea: string,
  goalText?: string
): Promise<
  Array<{
    title: string;
    description: string;
    estimated_minutes: number;
  }>
> {
  const prompt = `以下のユーザープロファイルに基づいて、今日の「光のタスク」を3つ生成してください。

【エネルギー源】${energySources.join("、")}
【停止トリガー（避けるべきパターン）】${stopTriggers.join("、")}
【目標領域】${goalArea}
${goalText ? `【目標】${goalText}` : ""}

条件：
- 1つのタスクは必ず2分以内で完了できるレベル
- 停止トリガーを踏まないよう設計する
- エネルギーが増える方向のタスクにする
- 具体的で明確な行動にする（「調べる」ではなく「〇〇のページを1つ開く」レベル）

以下のJSON配列形式で返してください（他のテキストは一切含めない）：
[
  {"title": "タスク名（15文字以内）", "description": "具体的な行動（30文字以内）", "estimated_minutes": 2},
  {"title": "タスク名（15文字以内）", "description": "具体的な行動（30文字以内）", "estimated_minutes": 2},
  {"title": "タスク名（15文字以内）", "description": "具体的な行動（30文字以内）", "estimated_minutes": 2}
]`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
    system:
      "あなたは行動設計の専門家です。ユーザーが「これなら今すぐできる！」と感じる超具体的な最小行動を設計します。必ずJSON配列形式のみで返してください。",
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("AIからの応答が不正です");
  }

  try {
    return JSON.parse(content.text);
  } catch {
    throw new Error("AIからの応答をパースできませんでした");
  }
}

/**
 * 詰まりボタンのThought Recordフロー：代替の見方を3つ生成
 */
export async function generateAlternativeViews(
  situation: string,
  emotion: string,
  autoThought: string
): Promise<string[]> {
  const prompt = `ユーザーが以下の状況で詰まっています。認知の歪みを優しく修正する「代替の見方」を3つ提案してください。

状況: ${situation}
感情: ${emotion}
自動思考: ${autoThought}

条件：
- 批判せず、受容した上でリフレームする
- 具体的で実感しやすい言葉を使う
- 1つ15〜25文字以内

JSON配列形式で返してください：["代替の見方1", "代替の見方2", "代替の見方3"]`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
    system: AZ_COACH_SYSTEM_PROMPT,
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("AIからの応答が不正です");
  }

  try {
    return JSON.parse(content.text);
  } catch {
    throw new Error("AIからの応答をパースできませんでした");
  }
}

/**
 * 感情の錬金術：ネガティブ感情をポジティブな才能の証拠に変換
 */
export async function transformEmotion(
  emotion: string,
  context: string
): Promise<string> {
  const prompt = `ユーザーが以下のネガティブな感情を記録しました。
感情: ${emotion}
状況/コンテキスト: ${context}

この感情を「才能の証拠」として、ポジティブに変換したメッセージを1〜2文で書いてください。
例：「それはあなたが〇〇を大切にしている証拠です」という構造で。`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
    system: AZ_COACH_SYSTEM_PROMPT,
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("AIからの応答が不正です");
  }

  return content.text;
}

/**
 * AIコーチとのチャット
 */
export async function chatWithCoach(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userProfile: {
    soul_type_name?: string;
    energy_sources?: string[];
    stop_triggers?: string[];
    goal_area?: string;
  }
): Promise<string> {
  const contextPrompt = userProfile.soul_type_name
    ? `\n\n【ユーザーのソウルタイプ】${userProfile.soul_type_name}\n【エネルギー源】${userProfile.energy_sources?.join("、") || "不明"}\n【停止トリガー】${userProfile.stop_triggers?.join("、") || "不明"}\n【目標領域】${userProfile.goal_area || "不明"}`
    : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: AZ_COACH_SYSTEM_PROMPT + contextPrompt,
    messages: messages,
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("AIからの応答が不正です");
  }

  return content.text;
}

/**
 * 今日のお告げ（ランダムな気づきの一文）を生成
 */
export async function generateDailyOracle(
  soulTypeName?: string
): Promise<string> {
  const prompt = soulTypeName
    ? `「${soulTypeName}」というソウルタイプのユーザーへ、今日の気づきの一言を詩的かつ力強く伝えてください（20〜40文字、1文のみ）。`
    : "今日の気づきの一言を詩的かつ力強く伝えてください（20〜40文字、1文のみ）。";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 128,
    messages: [{ role: "user", content: prompt }],
    system:
      "あなたは古代の賢者です。毎日ひとつ、ユーザーの心に刺さる言葉を届けます。神話的・詩的な言葉を使い、自己肯定感を高める内容にしてください。テキストのみ、他の説明は不要。",
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("AIからの応答が不正です");
  }

  return content.text.trim();
}
