"use server";

import { createClient } from "@/lib/supabase/server";
import { chatWithCoach, generateAlternativeViews, transformEmotion, generateDailyOracle } from "@/lib/ai/coach";

/**
 * AIコーチとチャットする
 */
export async function sendMessageToCoach(message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "ログインが必要です" };

  // 過去の会話履歴を取得（最新20件）
  const { data: history } = await supabase
    .from("ai_conversations")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(20);

  // ソウルタイプ情報を取得
  const { data: soulType } = await supabase
    .from("soul_types")
    .select("type_name, energy_sources, stop_triggers, goal_area")
    .eq("user_id", user.id)
    .single();

  const messages = [
    ...(history || []).map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user" as const, content: message },
  ];

  try {
    const response = await chatWithCoach(messages, {
      soul_type_name: soulType?.type_name,
      energy_sources: soulType?.energy_sources,
      stop_triggers: soulType?.stop_triggers,
      goal_area: soulType?.goal_area,
    });

    // 会話をDBに保存
    await supabase.from("ai_conversations").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: response },
    ]);

    return { response };
  } catch (error) {
    console.error("AIコーチエラー:", error);
    return { error: "コーチとの接続に失敗しました" };
  }
}

/**
 * 詰まりボタン：代替の見方を生成する
 */
export async function getAlternativeViews(
  situation: string,
  emotion: string,
  autoThought: string
) {
  try {
    const views = await generateAlternativeViews(situation, emotion, autoThought);
    return { views };
  } catch (error) {
    console.error("代替の見方生成エラー:", error);
    return { error: "生成に失敗しました" };
  }
}

/**
 * 感情ログを保存しAIで変換する
 */
export async function logEmotion(emotion: string, context: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "ログインが必要です" };

  try {
    const reframe = await transformEmotion(emotion, context);

    const { error } = await supabase.from("emotion_logs").insert({
      user_id: user.id,
      emotion,
      context,
      ai_reframe: reframe,
      is_private: true,
    });

    if (error) throw error;

    return { reframe };
  } catch (error) {
    console.error("感情ログエラー:", error);
    return { error: "保存に失敗しました" };
  }
}

/**
 * 詰まり記録を保存する
 */
export async function saveStuckRecord(data: {
  situation: string;
  emotion: string;
  auto_thought: string;
  alternative_view: string;
  next_action: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "ログインが必要です" };

  const { error } = await supabase.from("stuck_records").insert({
    user_id: user.id,
    ...data,
  });

  if (error) {
    return { error: "保存に失敗しました" };
  }

  return { success: true };
}

/**
 * 今日のお告げを取得する
 */
export async function getDailyOracle() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "ログインが必要です" };

  const { data: soulType } = await supabase
    .from("soul_types")
    .select("type_name")
    .eq("user_id", user.id)
    .single();

  try {
    const oracle = await generateDailyOracle(soulType?.type_name);
    return { oracle };
  } catch {
    return { oracle: "今日もあなたの光が、誰かの道を照らしている。" };
  }
}
