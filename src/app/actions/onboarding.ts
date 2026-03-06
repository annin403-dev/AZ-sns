"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** 深掘り診断の6カードデータ */
export interface DeepDiagnosisData {
  // Card A: エネルギー棚卸し
  energize: string;       // 没頭できること
  drains: string;         // 消耗すること
  // Card B: 得意の正体
  strengths: string[];    // 強み3つ
  // Card C: 苦手の正体
  weaknesses: string[];   // 苦手3つ
  // Card D: やる気の燃料（SDT）
  autonomy: number;       // 自律性スコア 1-5
  competence: number;     // 有能感スコア 1-5
  relatedness: number;    // 関係性スコア 1-5
  // Card E: 勝てる環境（COM-B）
  winContext: string;     // 勝てる状況テキスト
  // Card F: 自己定義
  selfDef: string;        // 自己定義一文
  noList: string[];       // やらないこと3つ
}

/**
 * 深掘り診断を完了・保存してホームへ
 */
export async function completeDeepDiagnosis(data: DeepDiagnosisData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // SDT優位型を判定
  const sdtMax = Math.max(data.autonomy, data.competence, data.relatedness);
  let motivationType = "自律性型";
  if (sdtMax === data.competence) motivationType = "有能感型";
  if (sdtMax === data.relatedness) motivationType = "関係性型";

  // 推進剤マップ（動くエネルギー）
  const propellantMap = {
    summary: `${data.energize}が推進剤。SDTは${motivationType}。`,
    items: [data.energize, `SDT優位：${motivationType}`],
    sdt: { autonomy: data.autonomy, competence: data.competence, relatedness: data.relatedness },
  };

  // 停止装置マップ（止まるトリガー）
  const blockerMap = {
    summary: data.drains,
    items: [data.drains, ...data.weaknesses],
  };

  // 勝てる条件マップ
  const winningCondition = {
    summary: data.winContext,
    items: [data.winContext, ...data.strengths],
  };

  // az_profilesに保存（upsert = あれば更新・なければ作成）
  const { error } = await supabase.from("az_profiles").upsert({
    user_id: user.id,
    propellant_map: propellantMap,
    blocker_map: blockerMap,
    winning_condition: winningCondition,
    self_definition: data.selfDef,
    no_list: data.noList.filter(Boolean),
  });

  if (error) {
    console.error("az_profiles保存エラー:", error);
    // テーブルがまだない場合でも続行（localStorageに保存済み）
  }

  // onboarding_doneをtrueに
  await supabase
    .from("profiles")
    .update({ onboarding_done: true })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/home");
}
