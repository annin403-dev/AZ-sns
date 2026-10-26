"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";

/** 今日の自己効力感スコア（1〜10）を記録する。同じ日は上書き */
export async function recordEfficacy(score: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const value = Math.round(score);
  if (value < 1 || value > 10) return { error: "1〜10で選んでね" };

  const today = new Date().toISOString().split("T")[0];
  const { error } = await table(supabase, "efficacy_checks").upsert(
    { user_id: user.id, score: value, check_date: today },
    { onConflict: "user_id,check_date" }
  );
  if (error) return { error: "保存に失敗しました" };

  revalidatePath("/growth");
  return { success: true };
}
