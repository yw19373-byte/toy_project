"use server";

import { SLANG_COLLECTION } from "@/lib/slang/collection";
import { createClient } from "@/lib/supabase/server";

const KNOWN_EXPRESSIONS = new Set(SLANG_COLLECTION.map((item) => item.expression));
const MAX_PER_CALL = 100;

// 로그인한 사용자가 본 표현을 기록한다. 이미 기록된 표현은 건너뛴다.
export async function recordViews(expressions: string[]): Promise<void> {
  if (!Array.isArray(expressions)) return;

  const unique = [...new Set(expressions)]
    .filter((expression) => KNOWN_EXPRESSIONS.has(expression))
    .slice(0, MAX_PER_CALL);
  if (unique.length === 0) return;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return;

  const { error } = await supabase.from("slang_views").upsert(
    unique.map((expression) => ({ user_id: userId, expression })),
    { onConflict: "user_id,expression", ignoreDuplicates: true },
  );
  if (error) {
    console.error("slang_views upsert failed", {
      code: error.code,
      message: error.message,
    });
  }
}
