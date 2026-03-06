"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** 感情ログを保存 + Three Good Things */
export async function saveEmotionLog(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const mood      = (formData.get("mood") as string)     || "neutral";
  const hp        = Number(formData.get("hp"))            || 7;
  const mp        = Number(formData.get("mp"))            || 7;
  const memo      = (formData.get("memo") as string)?.trim() || "";
  const good1     = (formData.get("good1") as string)?.trim() || "";
  const good2     = (formData.get("good2") as string)?.trim() || "";
  const good3     = (formData.get("good3") as string)?.trim() || "";
  const goodThings = [good1, good2, good3].filter(Boolean);

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("emotion_logs_v2").insert({
    user_id: user.id,
    log_date: today,
    mood, hp_value: hp, mp_value: mp,
    memo, good_things: goodThings,
  });

  if (error) {
    console.error("感情ログ保存エラー:", error);
    return { error: "保存に失敗しました" };
  }

  // HP/MPをprofilesにも反映
  await supabase.from("profiles").update({ hp, mp }).eq("id", user.id);

  // Luck XP付与
  if (goodThings.length > 0) {
    await supabase.from("luck_events").insert({
      user_id: user.id,
      event_type: "three_good_things",
      xp_gained: goodThings.length * 5,
    });
  }
  await supabase.from("luck_events").insert({
    user_id: user.id,
    event_type: "emotion_log",
    xp_gained: 5,
  });

  revalidatePath("/home");
  return { success: true };
}
