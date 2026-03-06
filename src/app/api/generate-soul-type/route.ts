import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CardAData, CardBData, CardCData, CardDData } from "@/types/database.types";

/**
 * ゲストユーザー向けソウルタイプ生成API
 * Haiku（高速・軽量）を使用してVercel無料プランの10秒制限内に収める
 */
export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
  }

  let body: { cardA: CardAData; cardB: CardBData; cardC: CardCData; cardD: CardDData };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストデータが不正です" }, { status: 400 });
  }

  const { cardA, cardB, cardC, cardD } = body;
  if (!cardA || !cardB || !cardC || !cardD) {
    return NextResponse.json({ error: "カードデータが不足しています" }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `診断データからソウルタイプをJSON形式で生成してください。

エネルギー源: ${cardA.energy_sources.join("、")}
停止原因: ${cardB.stop_triggers.join("、")}
目標: ${cardD.goal_area}${cardD.goal_text ? `（${cardD.goal_text}）` : ""}

{"type_name":"神話的な命名（例:光を運ぶ開拓者）","type_description":"本質の説明（2文、肯定的に）","strengths":["強み1","強み2","強み3"],"growth_direction":"輝く方向性（1文）"}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
      system: "ユーザーのソウルタイプを命名する達人。必ずJSONのみ返す。",
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("AIの応答が不正です");

    // JSONブロックを抽出
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON形式で取得できませんでした");

    const soulType = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ soulType });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("ソウルタイプ生成エラー:", message);
    return NextResponse.json({ error: `生成失敗: ${message}` }, { status: 500 });
  }
}
