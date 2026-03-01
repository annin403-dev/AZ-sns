"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSoulType } from "@/lib/ai/coach";
import { CardAData, CardBData, CardCData, CardDData } from "@/types/database.types";

/**
 * オンボーディングのカード進捗を保存する
 */
export async function saveOnboardingCard(
  cardNumber: number,
  data: CardAData | CardBData | CardCData | CardDData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const cardKey = `card_${["a", "b", "c", "d"][cardNumber - 1]}_data`;

  const { error } = await supabase
    .from("onboarding_progress")
    .update({
      [cardKey]: data,
      current_card: cardNumber,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("オンボーディング保存エラー:", error);
    return { error: "保存に失敗しました" };
  }

  return { success: true };
}

/**
 * オンボーディングを完了し、ソウルタイプを生成する
 */
export async function completeOnboarding(
  cardA: CardAData,
  cardB: CardBData,
  cardC: CardCData,
  cardD: CardDData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  try {
    // AIでソウルタイプを生成
    const soulTypeData = await generateSoulType(cardA, cardB, cardC, cardD);

    // ソウルタイプをDBに保存
    const { data: soulType, error: soulTypeError } = await supabase
      .from("soul_types")
      .upsert({
        user_id: user.id,
        ...soulTypeData,
        energy_sources: cardA.energy_sources,
        stop_triggers: cardB.stop_triggers,
        motivation_type: getMotivationType(cardC),
        goal_area: cardD.goal_area,
        autonomy_score: cardC.autonomy_score,
        competence_score: cardC.competence_score,
        relatedness_score: cardC.relatedness_score,
        is_complete: true,
      })
      .select()
      .single();

    if (soulTypeError) {
      throw new Error("ソウルタイプの保存に失敗しました");
    }

    // プロフィールのsoul_type_idを更新
    await supabase
      .from("profiles")
      .update({ soul_type_id: soulType.id })
      .eq("id", user.id);

    // オンボーディング完了を記録
    await supabase
      .from("onboarding_progress")
      .update({
        card_a_data: cardA,
        card_b_data: cardB,
        card_c_data: cardC,
        card_d_data: cardD,
        current_card: 4,
        is_complete: true,
      })
      .eq("user_id", user.id);

    revalidatePath("/", "layout");
    return { success: true, soulType };
  } catch (error) {
    console.error("オンボーディング完了エラー:", error);
    return { error: "ソウルタイプの生成に失敗しました" };
  }
}

/**
 * SDTスコアから主要な燃料タイプを判定する
 */
function getMotivationType(cardC: CardCData): string {
  const { autonomy_score, competence_score, relatedness_score } = cardC;
  const max = Math.max(autonomy_score, competence_score, relatedness_score);

  if (max === autonomy_score) return "自律性型";
  if (max === competence_score) return "有能感型";
  return "関係性型";
}

/**
 * オンボーディングの進捗を取得する
 */
export async function getOnboardingProgress() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}
