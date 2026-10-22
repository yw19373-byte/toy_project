import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { loadSeenExpressions } from "@/lib/quiz/data";
import { buildQuestion } from "@/lib/quiz/question";
import { createClient } from "@/lib/supabase/server";

export default async function QuizPage() {
  const supabase = await createClient();

  // 접근 판단은 서명이 검증되는 getClaims()로 한다.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const seen = await loadSeenExpressions(supabase);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <AppNav current="/quiz" />
      <QuizPlayer initialQuestion={buildQuestion(seen)} />
    </main>
  );
}
