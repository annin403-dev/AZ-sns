"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** ログイン */
export async function login(formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: "サーバー設定エラー: Supabase環境変数が未設定です" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    if (error) return { error: `ログインエラー: ${error.message}` };
    revalidatePath("/", "layout");
    redirect("/home");
  } catch (err) {
    return { error: `接続エラー: ${String(err)}` };
  }
}

/**
 * 新規ユーザー登録
 * job_type / aura_type を診断結果から受け取ってprofilesに保存する
 */
export async function register(formData: FormData) {
  const supabase = await createClient();

  const email       = formData.get("email") as string;
  const password    = formData.get("password") as string;
  const username    = formData.get("username") as string;
  const displayName = formData.get("display_name") as string;
  const jobType     = formData.get("job_type") as string;
  const auraType    = formData.get("aura_type") as string;

  // ユーザー名重複チェック
  const { data: existing } = await supabase
    .from("profiles").select("username").eq("username", username).single();
  if (existing) return { error: "このユーザー名はすでに使用されています" };

  // Supabaseにサインアップ
  const { data: authData, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { username, display_name: displayName || username } },
  });

  if (error) {
    const msg = (error.message ?? "").toLowerCase();
    if (msg.includes("already registered") || msg.includes("already in use") || msg.includes("already exists")) {
      return { error: "このメールアドレスはすでに登録されています" };
    }
    if (msg.includes("rate limit") || msg.includes("sending") || msg.includes("smtp") || msg.includes("email")) {
      return { error: "メール送信に問題があります。しばらく待ってから再試行してください（詳細: " + error.message + "）" };
    }
    // 実際のエラー内容を表示して原因特定を助ける
    return { error: "登録エラー: " + error.message };
  }

  // NOTE: profiles テーブルに job_type / aura_type カラムがないため
  // 診断タイプ情報はローカルストレージ（az_slider_answers）に保持する。
  // onboarding で soul_types テーブルに保存される。
  if (authData.user) {
    await new Promise((r) => setTimeout(r, 500));
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

/** ログアウト */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
