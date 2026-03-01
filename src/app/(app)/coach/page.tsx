import { createClient } from "@/lib/supabase/server";
import CoachChat from "@/components/features/CoachChat";

/**
 * AIコーチページ（サーバーコンポーネント）
 */
export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 過去の会話を取得（最新20件）
  const { data: history } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(20);

  // ソウルタイプを取得
  const { data: soulType } = await supabase
    .from("soul_types")
    .select("type_name")
    .eq("user_id", user.id)
    .single();

  return <CoachChat history={history || []} soulTypeName={soulType?.type_name} />;
}
