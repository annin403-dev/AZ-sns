"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** クエストを追加する */
export async function addQuest(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const title = (formData.get("title") as string)?.trim();
  const context = (formData.get("context") as string)?.trim() || "";
  const scheduledDate = (formData.get("scheduled_date") as string)
    || new Date().toISOString().split("T")[0];

  if (!title) return { error: "タイトルを入力してください" };

  const { error } = await supabase.from("quests").insert({
    user_id: user.id,
    title,
    context,
    scheduled_date: scheduledDate,
    luck_xp_reward: 10,
  });

  if (error) return { error: "保存に失敗しました" };

  revalidatePath("/home");
  return { success: true };
}

/** クエストを完了/未完了にトグルする */
export async function toggleQuest(questId: string, isDone: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const { error } = await supabase
    .from("quests")
    .update({
      is_done: isDone,
      done_at: isDone ? new Date().toISOString() : null,
    })
    .eq("id", questId)
    .eq("user_id", user.id);

  if (error) return { error: "更新に失敗しました" };

  // Luck XPをprofilesに加算（完了時のみ）
  if (isDone) {
    await supabase.rpc("increment_luck_xp", { user_id: user.id, amount: 10 }).maybeSingle();
  }

  revalidatePath("/home");
  return { success: true };
}
