"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccumulationCategory =
  | "skill"
  | "knowledge"
  | "network"
  | "habit"
  | "health"
  | "work"
  | "other";

/** 積み上げ記録を追加する */
export async function addAccumulationRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string) || "habit";
  const minutesStr = (formData.get("minutes_spent") as string) || "0";
  const note = (formData.get("note") as string)?.trim() || null;
  const recordDate =
    (formData.get("record_date") as string) ||
    new Date().toISOString().split("T")[0];

  if (!title) return { error: "内容を入力してください" };

  const minutes = parseInt(minutesStr, 10) || 0;

  const { error } = await supabase.from("accumulation_records").insert({
    user_id: user.id,
    title,
    category,
    minutes_spent: minutes,
    note,
    record_date: recordDate,
  });

  if (error) return { error: "保存に失敗しました" };

  // Luck XPを加算（積み上げ記録1件 = 5XP）
  await supabase
    .rpc("increment_luck_xp", { user_id: user.id, amount: 5 })
    .maybeSingle();

  revalidatePath("/accumulation");
  revalidatePath("/home");
  return { success: true };
}

/** 積み上げ記録を削除する */
export async function deleteAccumulationRecord(recordId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { error } = await supabase
    .from("accumulation_records")
    .delete()
    .eq("id", recordId)
    .eq("user_id", user.id);

  if (error) return { error: "削除に失敗しました" };

  revalidatePath("/accumulation");
  revalidatePath("/home");
  return { success: true };
}
