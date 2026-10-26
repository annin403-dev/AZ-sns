import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import StampBar, { type StampType } from "@/components/features/StampBar";

/**
 * SNS タブ「小さな一歩の広場」
 *
 * 承認欲求や比較の沼にしないための設計：
 * - DMもコメントもない。返せるのは肯定のスタンプだけ
 * - フォロワー数・いいね数ランキングは出さない（自分が押したかだけ分かる）
 * - つながるのは「成長している仲間たちの静かな温かさ」
 */
export default async function SNSPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: posts } = await table(supabase, "posts")
    .select("id, content, post_type, created_at, user_id, profiles(display_name), reactions(reaction_type, user_id)")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(30);

  type FeedPost = {
    id: string;
    content: string;
    post_type: string;
    created_at: string;
    user_id: string;
    profiles: { display_name: string | null } | null;
    reactions: Array<{ reaction_type: StampType; user_id: string }>;
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
          小さな一歩の広場
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          比べない。競わない。スタンプで静かに応援し合う場所
        </p>
      </header>

      <main className="px-5 space-y-3">
        <Link href="/post/new" className="btn-primary block text-center no-tap-highlight">
          今日の小さな一歩をシェアする
        </Link>

        {(!posts || posts.length === 0) && (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm" style={{ color: "#7B78A0" }}>
              まだ投稿がありません。最初の一歩を置いてみよう
            </p>
          </div>
        )}

        {(posts as FeedPost[] | null)?.map((post) => {
          const reactions = post.reactions || [];
          const mine = reactions
            .filter((r) => r.user_id === user.id)
            .map((r) => r.reaction_type);
          return (
            <div key={post.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: "#7C5CDB" }}>
                  {post.user_id === user.id ? "あなた" : post.profiles?.display_name || "シーカー"}
                </p>
                <p className="text-xs" style={{ color: "#B0ACC8" }}>
                  {new Date(post.created_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                </p>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#1C1A2E" }}>
                {post.content}
              </p>
              <StampBar
                postId={post.id}
                mine={mine}
                receivedCount={post.user_id === user.id ? reactions.length : null}
              />
            </div>
          );
        })}
      </main>
    </div>
  );
}
