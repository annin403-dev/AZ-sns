import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import { BRAKE_INFO, savedBrakeType, type BrakeType } from "@/lib/brake/data";
import { currentWeek, type RoadmapPlan } from "@/lib/ai/roadmap";
import RoadmapForm from "@/components/features/RoadmapForm";
import RoadmapView from "@/components/features/RoadmapView";

// AIによるロードマップ生成に時間がかかるため延長
export const maxDuration = 120;

/**
 * 90日ロードマップ
 * - まだ無ければ：ゴール・現在地・ブレーキから自動生成するフォーム
 * - あれば：今週のマイクロステップと全体の道のり
 */
export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: { brake?: string; new?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: roadmap } = await table(supabase, "roadmaps")
    .select("id, goal, plan, start_date")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // ブレーキ：URL指定 > 保存済みの診断結果
  const { data: azProfile } = await table(supabase, "az_profiles")
    .select("blocker_map")
    .eq("user_id", user.id)
    .maybeSingle();
  const brakeParam = searchParams.brake as BrakeType | undefined;
  const brake =
    brakeParam && brakeParam in BRAKE_INFO ? brakeParam : savedBrakeType(azProfile?.blocker_map);

  if (!roadmap || searchParams.new === "1") {
    return <RoadmapForm brake={brake} hasExisting={!!roadmap} />;
  }

  return (
    <RoadmapView
      goal={roadmap.goal as string}
      plan={roadmap.plan as RoadmapPlan}
      week={currentWeek(roadmap.start_date as string)}
      startDate={roadmap.start_date as string}
    />
  );
}
