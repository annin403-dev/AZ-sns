import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

/**
 * オンボーディングページ
 * ゲスト（未登録）でも診断を体験できる
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログイン済みでオンボーディング完了済みならホームへ
  if (user) {
    const { data: progress } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (progress?.is_complete) {
      redirect("/home");
    }

    return <OnboardingFlow initialProgress={progress} isGuest={false} />;
  }

  // 未ログインはゲストモードで診断を体験
  return <OnboardingFlow initialProgress={null} isGuest={true} />;
}
