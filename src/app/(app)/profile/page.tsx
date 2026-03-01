import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileView from "@/components/features/ProfileView";

/**
 * プロフィールページ（サーバーコンポーネント）
 */
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // プロフィール＋ソウルタイプ取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: soulType } = await supabase
    .from("soul_types")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // 自分の投稿取得（最新10件）
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // バッジ取得
  const { data: badges } = await supabase
    .from("badges")
    .select("*")
    .eq("user_id", user.id);

  // フォロワー・フォロー数
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact" })
    .eq("following_id", user.id);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact" })
    .eq("follower_id", user.id);

  return (
    <ProfileView
      profile={profile}
      soulType={soulType}
      posts={posts || []}
      badges={badges || []}
      followerCount={followerCount || 0}
      followingCount={followingCount || 0}
      currentUserId={user.id}
    />
  );
}
