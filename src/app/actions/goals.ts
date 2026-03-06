"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** 目標を追加する */
export async function addGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const title = (formData.get("title") as string)?.trim();
  const area  = (formData.get("area") as string) || "work";
  const minAction = (formData.get("min_action") as string)?.trim() || "";
  const winContext = (formData.get("win_context") as string)?.trim() || "";

  if (!title) return { error: "タイトルを入力してください" };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title, area,
    min_action: minAction,
    win_context: winContext,
  });

  if (error) return { error: "保存に失敗しました" };

  revalidatePath("/home");
  return { success: true };
}
