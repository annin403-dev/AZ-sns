import { NextRequest, NextResponse } from "next/server";
import { generateSoulType } from "@/lib/ai/coach";
import { CardAData, CardBData, CardCData, CardDData } from "@/types/database.types";

// Vercelの関数タイムアウトを60秒に設定
export const maxDuration = 60;

/**
 * ゲストユーザー向けソウルタイプ生成API
 * 認証不要でソウルタイプを生成する（DBには保存しない）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardA, cardB, cardC, cardD } = body as {
      cardA: CardAData;
      cardB: CardBData;
      cardC: CardCData;
      cardD: CardDData;
    };

    if (!cardA || !cardB || !cardC || !cardD) {
      return NextResponse.json({ error: "カードデータが不足しています" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY が設定されていません");
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const soulType = await generateSoulType(cardA, cardB, cardC, cardD);
    return NextResponse.json({ soulType });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("ソウルタイプ生成エラー:", message);
    return NextResponse.json(
      { error: `ソウルタイプの生成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
