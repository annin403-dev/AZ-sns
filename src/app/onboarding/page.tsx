import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

/**
 * オンボーディングページ（サーバーコンポーネント）
 * 進捗を取得してクライアントに渡す
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 既にオンボーディング完了済みならホームへ
  const { data: progress } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (progress?.is_complete) {
    redirect("/home");
  }

  return <OnboardingFlow initialProgress={progress} />;
}
