"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** ログイン */
export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return { error: "メールアドレスの確認がまだです。届いた確認メールのリンクを開いてください" };
    }
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }
  revalidatePath("/", "layout");
  redirect("/home");
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
    options: {
      data: { username, display_name: displayName || username },
      // 確認メールのリンクを、このアプリ自身のURLに戻す
      emailRedirectTo: `${appOrigin()}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered"))
      return { error: "このメールアドレスはすでに登録されています" };
    return { error: "登録に失敗しました。もう一度お試しください" };
  }

  // メール確認が必要な設定だとセッションが無いので、確認メールの案内を出す
  if (!authData.session) {
    return {
      info: `${email} に確認メールを送りました。メール内のリンクを開くと登録が完了します（迷惑メールフォルダも確認してね）`,
    };
  }

  // 診断結果をprofilesに保存（トリガー待ち500ms）
  if (authData.user && jobType && auraType) {
    await new Promise((r) => setTimeout(r, 500));
    await supabase
      .from("profiles")
      .update({ job_type: jobType, aura_type: auraType })
      .eq("id", authData.user.id);
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

/** 今アクセスされているアプリのURL（例：https://az-sns.vercel.app） */
function appOrigin() {
  const h = headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
