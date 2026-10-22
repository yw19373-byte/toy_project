import type { SupabaseClient } from "@supabase/supabase-js";

// 로그인한 사용자가 본 표현 목록. RLS 덕분에 본인 기록만 조회된다.
export async function loadSeenExpressions(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase.from("slang_views").select("expression");
  if (error || !data) return [];
  return data.map((row) => row.expression as string);
}
