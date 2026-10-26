"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";

/** If-Thenプランを追加する */
export async function addIfThen(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const trigger = (formData.get("trigger") as string)?.trim();
  const action = (formData.get("action") as string)?.trim();
  if (!trigger || !action) return { error: "きっかけと行動の両方を入れてね" };

  const { error } = await table(supabase, "if_then_plans").insert({
    user_id: user.id,
    trigger_text: trigger,
    action_text: action,
  });
  if (error) return { error: "保存に失敗しました" };

  revalidatePath("/ifthen");
  revalidatePath("/home");
  return { success: true };
}

/** 今日のIf-Thenを実行した記録をつける（1日1回） */
export async function markIfThenDone(planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const today = new Date().toISOString().split("T")[0];
  const { data: plan } = await table(supabase, "if_then_plans")
    .select("done_count, last_done_date")
    .eq("id", planId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!plan) return { error: "プランが見つかりません" };
  if (plan.last_done_date === today) return { success: true, already: true };

  const { error } = await table(supabase, "if_then_plans")
    .update({ done_count: plan.done_count + 1, last_done_date: today })
    .eq("id", planId)
    .eq("user_id", user.id);
  if (error) return { error: "更新に失敗しました" };

  revalidatePath("/ifthen");
  revalidatePath("/home");
  revalidatePath("/growth");
  return { success: true };
}

/** If-Thenプランをお休み/再開する */
export async function setIfThenActive(planId: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { error } = await table(supabase, "if_then_plans")
    .update({ is_active: isActive })
    .eq("id", planId)
    .eq("user_id", user.id);
  if (error) return { error: "更新に失敗しました" };

  revalidatePath("/ifthen");
  revalidatePath("/home");
  return { success: true };
}
