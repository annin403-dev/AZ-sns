import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

/**
 * オンボーディングページ
 * ログイン済み → 深掘り6カード
 * 未ログイン   → カードをゲストとして記入 → 最後に登録
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_done")
      .eq("id", user.id)
      .single();

    if (profile?.onboarding_done) {
      redirect("/home");
    }
  }

  return <OnboardingFlow initialProgress={null} isGuest={!user} />;
}
