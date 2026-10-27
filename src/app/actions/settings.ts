"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";

/** 表示名・ひとこと紹介を更新する */
export async function updateProfile(displayName: string, bio: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const name = displayName.trim();
  if (!name) return { error: "表示名を入れてね" };
  if (name.length > 30) return { error: "表示名は30文字以内です" };
  if (bio.length > 160) return { error: "ひとこと紹介は160文字以内です" };

  const { error } = await table(supabase, "profiles")
    .update({ display_name: name, bio: bio.trim() || null })
    .eq("id", user.id);
  if (error) return { error: "保存に失敗しました" };

  revalidatePath("/", "layout");
  return { success: true };
}
