"use server";

import { collectionFor, isKind, tablesFor, type ContentKind } from "@/lib/content/kinds";
import { loadSeenExpressions } from "@/lib/quiz/data";
import { buildQuestion, type QuizQuestion } from "@/lib/quiz/question";
import { createClient } from "@/lib/supabase/server";

export type AnswerResult = { correct: boolean } | { error: string };

// 정답 여부는 서버에서 판정하고 답안으로 기록한다.
export async function submitAnswer(
  kind: ContentKind,
  expression: string,
  chosen: string,
): Promise<AnswerResult> {
  if (!isKind(kind) || typeof expression !== "string" || typeof chosen !== "string") {
    return { error: "답을 확인하지 못했습니다." };
  }

  const known = new Set(collectionFor(kind).map((item) => item.expression));
  if (!known.has(expression) || !known.has(chosen)) {
    return { error: "답을 확인하지 못했습니다." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return { error: "로그인이 필요합니다." };

  const correct = chosen === expression;
  const table = tablesFor(kind).answers;
  const { error } = await supabase
    .from(table)
    .insert({ user_id: userId, expression, correct });
  if (error) {
    console.error(`${table} insert failed`, { code: error.code, message: error.message });
    return { error: "답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { correct };
}

// 방금 푼 항목이 연달아 나오지 않도록, 본 항목이 둘 이상이면 이전 항목을 뺀다.
export async function nextQuestion(
  kind: ContentKind,
  previous?: string,
): Promise<QuizQuestion | null> {
  if (!isKind(kind)) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return null;

  const seen = await loadSeenExpressions(supabase, kind);
  const candidates =
    seen.length > 1 ? seen.filter((expression) => expression !== previous) : seen;

  return buildQuestion(candidates, collectionFor(kind));
}
