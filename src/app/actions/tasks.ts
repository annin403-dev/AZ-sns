"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateDailyTasks } from "@/lib/ai/coach";

/**
 * 今日の光のタスクを取得する（なければAIで生成）
 */
export async function getTodayTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "ログインが必要です" };

  const today = new Date().toISOString().split("T")[0];

  // 今日のタスクを確認
  const { data: existingTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("scheduled_date", today);

  if (existingTasks && existingTasks.length > 0) {
    return { tasks: existingTasks };
  }

  // ソウルタイプ情報を取得してAIでタスク生成
  const { data: soulType } = await supabase
    .from("soul_types")
    .select("energy_sources, stop_triggers, goal_area")
    .eq("user_id", user.id)
    .single();

  if (!soulType) {
    return { error: "オンボーディングを完了してください" };
  }

  try {
    const generatedTasks = await generateDailyTasks(
      soulType.energy_sources,
      soulType.stop_triggers,
      soulType.goal_area
    );

    // タスクをDBに保存
    const tasksToInsert = generatedTasks.map((task) => ({
      user_id: user.id,
      title: task.title,
      description: task.description,
      estimated_minutes: task.estimated_minutes,
      scheduled_date: today,
      xp_reward: 10,
    }));

    const { data: newTasks, error } = await supabase
      .from("tasks")
      .insert(tasksToInsert)
      .select();

    if (error) throw error;

    return { tasks: newTasks };
  } catch (error) {
    console.error("タスク生成エラー:", error);
    return { error: "タスクの生成に失敗しました" };
  }
}

/**
 * タスクを完了としてマークする
 */
export async function completeTask(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "ログインが必要です" };

  const { data: task, error } = await supabase
    .from("tasks")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: "タスクの更新に失敗しました" };
  }

  // 投稿を自動作成（タスク完了の記録）
  await supabase.from("posts").insert({
    user_id: user.id,
    content: `✨ 光のタスク完了！「${task.title}」を達成しました`,
    post_type: "task_complete",
    visibility: "public",
  });

  revalidatePath("/home");
  return { success: true, task, xpGained: task.xp_reward };
}
