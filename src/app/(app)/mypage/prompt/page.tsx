import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { table } from "@/lib/supabase/untyped";
import { JOB_TYPE_INFO, AURA_INFO, getAZType } from "@/lib/diagnosis/types-data";
import type { JobType, AuraType } from "@/lib/diagnosis/questions";
import { BRAKE_INFO, savedBrakeType } from "@/lib/brake/data";
import CopyBox from "@/components/features/CopyBox";

/**
 * AI会話用プロンプト
 * ChatGPTやClaudeに貼るだけで「自分のことを分かった上で」相談に乗ってもらえる文章を作る
 * 診断が途中でも、分かっている情報だけで作る
 */
export default async function PromptPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: az }, { data: roadmap }] = await Promise.all([
    table(supabase, "profiles").select("display_name, job_type, aura_type").eq("id", user.id).maybeSingle(),
    table(supabase, "az_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    table(supabase, "roadmaps")
      .select("goal, plan")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const lines: string[] = [];
  const job = profile?.job_type as JobType | null;
  const aura = profile?.aura_type as AuraType | null;

  if (job && aura && JOB_TYPE_INFO[job] && AURA_INFO[aura]) {
    const t = getAZType(job, aura);
    lines.push(`・AZタイプ：${JOB_TYPE_INFO[job].nameJa}（${job}）× ${aura}${t ? `「${t.title}」` : ""}`);
    if (t) {
      lines.push(`・タイプの特徴：${t.description}`);
      lines.push(`・強み：${t.strengths.join("、")}`);
    }
  }

  const brake = savedBrakeType(az?.blocker_map);
  if (brake) {
    const b = BRAKE_INFO[brake];
    lines.push(`・動けなくなるときのブレーキ：${b.name}（${b.nickname}）`);
    lines.push(`・自分に合う一歩の作り方：${b.stepStyle}`);
  }

  const items = (m: unknown) => ((m as { items?: string[] } | null)?.items ?? []).filter(Boolean);
  if (items(az?.propellant_map).length) lines.push(`・やる気が出るもの：${items(az?.propellant_map).join("、")}`);
  if (items(az?.blocker_map).length) lines.push(`・止まるきっかけ：${items(az?.blocker_map).join("、")}`);
  if (items(az?.winning_condition).length) lines.push(`・うまくいく条件：${items(az?.winning_condition).join("、")}`);
  if (az?.self_definition) lines.push(`・自分についての一文：「${az.self_definition}」`);
  if (az?.no_list?.length) lines.push(`・やらないと決めたこと：${(az.no_list as string[]).join("、")}`);
  if (az?.yearly_goal) lines.push(`・今年の目標：${az.yearly_goal}`);
  if (roadmap?.goal) lines.push(`・いま取り組んでいる90日ゴール：${roadmap.goal}`);

  const hasInfo = lines.length > 0;
  const prompt = `これから相談に乗ってほしいです。まず私について知っておいてください。

【私について】
${lines.join("\n")}

【お願いしたい関わり方】
・評価したり、他の人と比べたりしないでください
・「〜すべき」ではなく、私に合うやり方を一緒に考えてください
・最後は必ず「今日1〜5分でできる、とても小さな一歩」を1つ提案してください
・質問は一度に1つずつにしてください

理解できたら「わかりました」とだけ答えて、私の相談を待ってください。`;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <Link href="/mypage" className="text-sm no-tap-highlight" style={{ color: "#7B78A0" }}>
          ← マイページ
        </Link>
        <h1 className="text-xl font-bold mt-2" style={{ color: "#1C1A2E" }}>
          🤖 AI会話用プロンプト
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          コピーしてChatGPTやClaudeに貼ると、あなたのことを分かった上で相談に乗ってくれます
        </p>
      </header>

      <main className="px-5 space-y-4">
        {hasInfo ? (
          <CopyBox text={prompt} />
        ) : (
          <div className="card text-center py-6">
            <p className="text-sm mb-3" style={{ color: "#7B78A0" }}>
              まだあなたの情報がありません。診断を1つ受けると、プロンプトが作られます
            </p>
            <Link href="/diagnosis" className="btn-primary block text-center no-tap-highlight">
              AZタイプ診断を受ける
            </Link>
          </div>
        )}

        <div className="card">
          <p className="text-sm font-bold mb-2" style={{ color: "#1C1A2E" }}>
            もっと詳しくするには
          </p>
          <div className="space-y-2 text-sm">
            {!job && <Link href="/diagnosis" className="block no-tap-highlight" style={{ color: "#7C5CDB" }}>✨ AZタイプ診断 →</Link>}
            {!brake && <Link href="/brake" className="block no-tap-highlight" style={{ color: "#7C5CDB" }}>🧠 ブレーキ診断 →</Link>}
            {!items(az?.propellant_map).length && <Link href="/onboarding" className="block no-tap-highlight" style={{ color: "#7C5CDB" }}>📖 深掘り診断（取扱説明書） →</Link>}
            {!roadmap && <Link href="/roadmap" className="block no-tap-highlight" style={{ color: "#7C5CDB" }}>🗺 90日ロードマップ →</Link>}
            {job && brake && items(az?.propellant_map).length > 0 && roadmap && (
              <p style={{ color: "#38C074" }}>✅ すべての情報が入っています</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
