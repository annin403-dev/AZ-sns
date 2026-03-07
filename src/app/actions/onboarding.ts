"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** 深掘り診断の6カードデータ＋目標設定 */
export interface DeepDiagnosisData {
  // Card A: エネルギー棚卸し
  energize: string;       // 没頭できること
  drains: string;         // 消耗すること
  // Card B: 得意の正体
  strengths: string[];    // 強み3つ（早く終わること・褒められること・再現手順）
  // Card C: 苦手の正体
  weaknesses: string[];   // 止まる条件3つ
  // Card D: やる気の燃料（SDT）
  autonomy: number;       // 自律性スコア 1-5
  competence: number;     // 有能感スコア 1-5
  relatedness: number;    // 関係性スコア 1-5
  // Card E: 勝てる環境（COM-B）
  winContext: string;     // 勝てる状況テキスト（4フィールドを結合）
  // Card F: 自己定義
  selfDef: string;        // 自己定義一文
  noList: string[];       // やらないこと1〜3つ
  // 目標設定
  goalArea?: string;      // 今年の目標領域
  goalText?: string;      // 目標の一言説明
}

/**
 * 深掘り診断を完了・保存してホームへ
 */
export async function completeDeepDiagnosis(data: DeepDiagnosisData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // SDT優位型を判定（同点は自律性 > 有能感 > 関係性の優先順位）
  const sdtMax = Math.max(data.autonomy, data.competence, data.relatedness);
  let motivationType = "自律性型";
  if (data.competence === sdtMax && data.competence > data.autonomy) motivationType = "有能感型";
  if (data.relatedness === sdtMax && data.relatedness > data.autonomy && data.relatedness > data.competence) motivationType = "関係性型";

  // 推進剤マップ（動くエネルギー）
  const propellantMap = {
    summary: `${data.energize}が推進剤。SDTは${motivationType}。`,
    items: [data.energize, `SDT優位：${motivationType}`],
    sdt: { autonomy: data.autonomy, competence: data.competence, relatedness: data.relatedness },
  };

  // 停止装置マップ（止まるトリガー）
  const blockerMap = {
    summary: data.drains,
    items: [data.drains, ...data.weaknesses].filter(Boolean),
  };

  // 勝てる条件マップ
  const winningCondition = {
    summary: data.winContext,
    items: [data.winContext, ...data.strengths].filter(Boolean),
  };

  // 今年の目標テキスト
  const yearlyGoal = data.goalArea
    ? [data.goalArea, data.goalText].filter(Boolean).join("：")
    : "";

  // az_profilesに保存（upsert = あれば更新・なければ作成）
  const { error } = await supabase.from("az_profiles").upsert({
    user_id: user.id,
    propellant_map: propellantMap,
    blocker_map: blockerMap,
    winning_condition: winningCondition,
    self_definition: data.selfDef,
    no_list: data.noList.filter(Boolean),
    yearly_goal: yearlyGoal,
  });

  if (error) {
    console.error("az_profiles保存エラー:", error);
    // テーブルがまだない場合でも続行
  }

  // onboarding_doneをtrueに
  await supabase
    .from("profiles")
    .update({ onboarding_done: true })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/home");
}
