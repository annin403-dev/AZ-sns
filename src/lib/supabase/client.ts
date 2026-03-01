import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

/**
 * クライアントサイド用のSupabaseクライアントを作成する
 * ブラウザでのセッション管理に使用
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
