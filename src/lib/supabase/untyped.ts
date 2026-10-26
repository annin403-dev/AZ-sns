import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 型定義（database.types.ts）にまだ載っていないテーブルを扱うためのヘルパー
 * schema-v2 / v3 のテーブルは型が未生成なので、ここで緩い型として取り出す
 */
export function table(supabase: SupabaseClient<any, any, any>, name: string) {
  return (supabase as SupabaseClient<any, "public", any>).from(name);
}
