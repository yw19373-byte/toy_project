import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { KindSwitch } from "@/components/quiz/kind-switch";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { collectionFor, isKind } from "@/lib/content/kinds";
import { loadSeenExpressions } from "@/lib/quiz/data";
import { buildQuestion } from "@/lib/quiz/question";
import { createClient } from "@/lib/supabase/server";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind: requested } = await searchParams;
  const kind = isKind(requested) ? requested : "slang";

  const supabase = await createClient();

  // 접근 판단은 서명이 검증되는 getClaims()로 한다.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const seen = await loadSeenExpressions(supabase, kind);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <AppNav current="/quiz" />
      <KindSwitch current={kind} />
      <QuizPlayer
        key={kind}
        kind={kind}
        initialQuestion={buildQuestion(seen, collectionFor(kind))}
      />
    </main>
  );
}
