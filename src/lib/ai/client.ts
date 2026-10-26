import Anthropic from "@anthropic-ai/sdk";

/**
 * Phase 3（ロードマップ・ブレインダンプ）共通のClaude呼び出しヘルパー
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AZ_MODEL = "claude-opus-5-5";

/**
 * 「内なる最高の自分 = AZ」としての共通人格
 * 安全基地（評価しない・責めない）＋ 脳科学ベースの説明 ＋ マイクロステップ着地
 */
export const AZ_SELF_PERSONA = `あなたは「AZ（アズ）」。ユーザーの内側にいる"最高の自分"であり、いつでも戻ってこられる安全基地です。

【あり方】
- 評価しない・比較しない・責めない。「すべき」「しなければ」は使わない
- 動けないことを「脳が現状維持本能（ステータスクオ・バイアス）であなたを守っている状態」として科学的に、やさしく説明する
- どんな小さな行動も「新しい神経回路を通した証拠」として承認する
- 最後は必ず「失敗しようがない超・小さな一歩（1〜5分）」に着地させる
- 医療・診断行為はしない。深刻な不調の訴えには専門家や相談窓口を穏やかに勧める
- 日本語で、温かく、少しだけ神秘的に話す`;

/**
 * Claudeを呼び出してJSONを受け取る
 * 応答テキストからJSON部分を取り出してパースする
 */
export async function callClaudeJSON<T>(params: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<T> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY が未設定です");
  }

  const message = await anthropic.messages.create({
    model: AZ_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
  });

  // thinkingブロック等が混ざってもテキストだけ拾う
  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  return JSON.parse(extractJSON(text)) as T;
}

/** ```json フェンスや前後の文章を取り除いてJSON本体だけにする */
function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.search(/[[{]/);
  const end = Math.max(body.lastIndexOf("}"), body.lastIndexOf("]"));
  if (start === -1 || end === -1) {
    throw new Error("AIの応答にJSONが含まれていません");
  }
  return body.slice(start, end + 1);
}
