import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * ルートページ：認証状態に応じてリダイレクト
 */
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // オンボーディング完了チェック
  const { data: progress } = await supabase
    .from("onboarding_progress")
    .select("is_complete")
    .eq("user_id", user.id)
    .single();

  if (!progress?.is_complete) {
    redirect("/onboarding");
  }

  redirect("/home");
}
