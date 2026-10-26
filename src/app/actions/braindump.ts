"use server";

import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import { organizeBrainDump, fallbackBrainDump, type BrainDumpResult } from "@/lib/ai/braindump";

/** モヤモヤを吐き出してAZに整理してもらう */
export async function submitBrainDump(text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  const content = text.trim();
  if (!content) return { error: "なんでもいいので、書いてみてね" };
  if (content.length > 3000) return { error: "3000文字以内で書いてね" };

  let result: BrainDumpResult;
  try {
    result = await organizeBrainDump(content);
  } catch (error) {
    console.error("ブレインダンプ整理エラー:", error);
    result = fallbackBrainDump();
  }

  await table(supabase, "brain_dumps").insert({
    user_id: user.id,
    content,
    result,
  });

  return { result };
}
