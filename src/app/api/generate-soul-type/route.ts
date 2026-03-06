import { NextRequest, NextResponse } from "next/server";
import { generateSoulType } from "@/lib/ai/coach";
import { CardAData, CardBData, CardCData, CardDData } from "@/types/database.types";

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

    const soulType = await generateSoulType(cardA, cardB, cardC, cardD);
    return NextResponse.json({ soulType });
  } catch (error) {
    console.error("ソウルタイプ生成エラー:", error);
    return NextResponse.json({ error: "ソウルタイプの生成に失敗しました" }, { status: 500 });
  }
}
