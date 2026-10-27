"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import { JOB_TYPE_INFO, AURA_INFO } from "@/lib/diagnosis/types-data";

/**
 * AZタイプ診断の結果を保存する（ログイン中のときだけ）
 * 未ログインなら saved: false を返し、結果画面は登録への案内を出す
 */
export async function saveDiagnosisResult(jobType: string, auraType: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { saved: false };

  if (!(jobType in JOB_TYPE_INFO) || !(auraType in AURA_INFO)) {
    return { saved: false, error: "診断結果が不正です" };
  }

  const { error } = await table(supabase, "profiles")
    .update({ job_type: jobType, aura_type: auraType })
    .eq("id", user.id);
  if (error) {
    console.error("診断結果の保存エラー:", error);
    return { saved: false, error: "保存に失敗しました" };
  }

  await table(supabase, "az_profiles").upsert(
    { user_id: user.id, job_type: jobType, aura_type: auraType, type_key: `${jobType}_${auraType}` },
    { onConflict: "user_id" }
  );

  revalidatePath("/home");
  revalidatePath("/diagnosis/menu");
  revalidatePath("/mypage");
  return { saved: true };
}
