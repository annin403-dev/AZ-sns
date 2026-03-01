import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeFeed from "@/components/features/HomeFeed";

/**
 * ホームフィードページ（サーバーコンポーネント）
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // プロフィール＋ソウルタイプ取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, soul_types(*)")
    .eq("id", user.id)
    .single();

  // 今日のタスク取得
  const today = new Date().toISOString().split("T")[0];
  const { data: todayTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("scheduled_date", today)
    .order("created_at");

  // 公開投稿フィード（最新30件・ユーザーのフォロー優先）
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles(id, username, display_name, avatar_url),
      reactions(reaction_type)
    `
    )
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <HomeFeed
      profile={profile}
      todayTasks={todayTasks || []}
      posts={posts || []}
      currentUserId={user.id}
    />
  );
}
