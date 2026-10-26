import { AZ_SELF_PERSONA, callClaudeJSON } from "./client";

/**
 * ブレインダンプ：モヤモヤを吐き出す → AZが整理して「次の1分」へナビゲートする
 */
export interface BrainDumpResult {
  acceptance: string;
  facts: string[];
  feelings: string[];
  worries: string[];
  position: string;
  next_step: string;
}

export async function organizeBrainDump(text: string): Promise<BrainDumpResult> {
  const prompt = `ユーザーが頭の中のモヤモヤをそのまま書き出しました。

---
${text}
---

AZとして、次のJSONのみで返してください：
{
  "acceptance": "まず受け止める言葉（1〜2文。書き出せたこと自体を承認する）",
  "facts": ["実際に起きている事実（短く。最大3つ）"],
  "feelings": ["感じている気持ち（短く。最大3つ）"],
  "worries": ["まだ起きていない心配・想像（短く。最大3つ。なければ空配列）"],
  "position": "今のあなたの現在地（1文。責めずに状況を言語化）",
  "next_step": "次の1分でできる超・小さな一歩（25文字以内）"
}`;

  return callClaudeJSON<BrainDumpResult>({
    system: AZ_SELF_PERSONA + "\n必ずJSONのみで返してください。",
    prompt,
    maxTokens: 2048,
  });
}

/** AIが使えないときの最低限の応答 */
export function fallbackBrainDump(): BrainDumpResult {
  return {
    acceptance: "書き出してくれてありがとう。頭の外に出せた時点で、もう一歩進んでいるよ。",
    facts: [],
    feelings: [],
    worries: [],
    position: "いまは考えがたくさん重なっていて、脳が少し疲れている状態。",
    next_step: "深呼吸を3回して、水を一口飲む",
  };
}
