"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import type { BrakeResult } from "@/lib/brake/data";

/** ブレーキ診断の結果を az_profiles.blocker_map に保存する（ログイン時のみ） */
export async function saveBrakeResult(result: BrakeResult) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { saved: false };

  const { error } = await table(supabase, "az_profiles").upsert(
    {
      user_id: user.id,
      blocker_map: { ...result, diagnosed_at: new Date().toISOString() },
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("ブレーキ診断の保存エラー:", error);
    return { saved: false, error: "保存に失敗しました" };
  }

  revalidatePath("/diagnosis/menu");
  revalidatePath("/roadmap");
  return { saved: true };
}
