import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import IfThenManager, { type IfThenPlan } from "@/components/features/IfThenManager";

/**
 * If-Thenプランニング
 * 「もし〇〇したら、〇〇する」で、既存の習慣に新しい行動をくっつける
 */
export default async function IfThenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: plans } = await table(supabase, "if_then_plans")
    .select("id, trigger_text, action_text, is_active, done_count, last_done_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <IfThenManager plans={(plans as IfThenPlan[]) || []} />;
}
