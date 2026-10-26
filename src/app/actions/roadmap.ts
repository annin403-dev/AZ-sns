"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import { generateRoadmap, fallbackRoadmap, type RoadmapPlan } from "@/lib/ai/roadmap";
import { BRAKE_INFO, type BrakeType } from "@/lib/brake/data";

/** 90日ロードマップを生成して保存する */
export async function createRoadmap(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const goal = (formData.get("goal") as string)?.trim();
  const current = (formData.get("current") as string)?.trim() || "";
  const minutesPerDay = Number(formData.get("minutes_per_day")) || 5;
  const brakeRaw = formData.get("brake") as string | null;
  const brake = brakeRaw && brakeRaw in BRAKE_INFO ? (brakeRaw as BrakeType) : null;

  if (!goal) return { error: "ゴールを入力してください" };

  const input = { goal, current, brake, minutesPerDay };
  let plan: RoadmapPlan;
  let usedFallback = false;
  try {
    plan = await generateRoadmap(input);
  } catch (error) {
    console.error("ロードマップ生成エラー（テンプレートで代替）:", error);
    plan = fallbackRoadmap(input);
    usedFallback = true;
  }

  // 既存のアクティブなロードマップは終了扱いにする
  await table(supabase, "roadmaps")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const { error } = await table(supabase, "roadmaps").insert({
    user_id: user.id,
    goal,
    current_state: current,
    brake_type: brake,
    minutes_per_day: minutesPerDay,
    plan,
  });
  if (error) {
    console.error("ロードマップ保存エラー:", error);
    return { error: "保存に失敗しました" };
  }

  // ロードマップの If-Then をそのまま習慣計画として登録する
  await table(supabase, "if_then_plans").insert({
    user_id: user.id,
    trigger_text: plan.if_then.trigger,
    action_text: plan.if_then.action,
  });

  revalidatePath("/roadmap");
  revalidatePath("/home");
  return { success: true, usedFallback };
}

/** ロードマップのステップを今日のクエストにする */
export async function addStepToToday(step: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const today = new Date().toISOString().split("T")[0];

  // 同じステップが今日すでにあれば追加しない
  const { data: existing } = await table(supabase, "quests")
    .select("id")
    .eq("user_id", user.id)
    .eq("scheduled_date", today)
    .eq("title", step)
    .maybeSingle();
  if (existing) return { success: true, already: true };

  const { error } = await table(supabase, "quests").insert({
    user_id: user.id,
    title: step,
    context: "90日ロードマップ",
    scheduled_date: today,
    luck_xp_reward: 10,
  });
  if (error) return { error: "追加に失敗しました" };

  revalidatePath("/home");
  return { success: true };
}
