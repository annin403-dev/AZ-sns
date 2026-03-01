"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 投稿を作成する
 */
export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const content = formData.get("content") as string;
  const postType = (formData.get("post_type") as string) || "insight";
  const visibility = (formData.get("visibility") as string) || "public";

  if (!content || content.length === 0) {
    return { error: "内容を入力してください" };
  }

  if (content.length > 300) {
    return { error: "300文字以内で入力してください" };
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content,
    post_type: postType as "insight" | "progress" | "task_complete" | "emotion",
    visibility: visibility as "public" | "circle" | "private",
  });

  if (error) {
    console.error("投稿作成エラー:", error);
    return { error: "投稿に失敗しました" };
  }

  // XPを付与（投稿=5XP）
  await supabase.rpc("increment_xp", { user_id_input: user.id, xp_amount: 5 }).catch(() => {
    // XP付与に失敗しても投稿自体は成功とする
  });

  revalidatePath("/home");
  return { success: true };
}

/**
 * 投稿を削除する
 */
export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "削除に失敗しました" };
  }

  revalidatePath("/home");
  return { success: true };
}

/**
 * リアクションを追加/削除する（トグル）
 */
export async function toggleReaction(
  postId: string,
  reactionType: "empathy" | "helpful" | "cheer"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  // 既存のリアクションを確認
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .eq("reaction_type", reactionType)
    .single();

  if (existing) {
    // 削除（トグルオフ）
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    // 追加（トグルオン）
    await supabase.from("reactions").insert({
      user_id: user.id,
      post_id: postId,
      reaction_type: reactionType,
    });
  }

  revalidatePath("/home");
  return { success: true };
}
