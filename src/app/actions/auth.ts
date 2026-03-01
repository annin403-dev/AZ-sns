"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * メールアドレス・パスワードでログイン
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  revalidatePath("/", "layout");
  redirect("/home");
}

/**
 * 新規ユーザー登録
 */
export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const displayName = formData.get("display_name") as string;

  // ユーザー名の重複チェック
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  if (existingProfile) {
    return { error: "このユーザー名はすでに使用されています" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName || username,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "このメールアドレスはすでに登録されています" };
    }
    return { error: "登録に失敗しました。もう一度お試しください" };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

/**
 * ログアウト
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
