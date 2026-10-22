import Link from "next/link";
import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { accuracyPercent } from "@/lib/quiz/stats";
import { SLANG_COLLECTION } from "@/lib/slang/collection";
import { createClient } from "@/lib/supabase/server";

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        {note ? <CardDescription>{note}</CardDescription> : null}
      </CardHeader>
    </Card>
  );
}

export default async function StatsPage() {
  const supabase = await createClient();

  // 접근 판단은 서명이 검증되는 getClaims()로 한다.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  // RLS 덕분에 본인 기록만 집계된다.
  const [views, answers, correct] = await Promise.all([
    supabase.from("slang_views").select("expression", { count: "exact", head: true }),
    supabase.from("quiz_answers").select("id", { count: "exact", head: true }),
    supabase
      .from("quiz_answers")
      .select("id", { count: "exact", head: true })
      .eq("correct", true),
  ]);

  const seenCount = views.count ?? 0;
  const answerCount = answers.count ?? 0;
  const correctCount = correct.count ?? 0;
  const accuracy = accuracyPercent(correctCount, answerCount);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <AppNav current="/stats" />

      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          내 통계
        </h1>
        <p className="text-sm text-muted-foreground">
          지금까지 쌓인 내 기록입니다.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="본 표현"
          value={`${seenCount}개`}
          note={`전체 ${SLANG_COLLECTION.length}개 중`}
        />
        <StatCard
          label="정답률"
          value={accuracy === null ? "아직 없음" : `${accuracy}%`}
          note={accuracy === null ? "퀴즈를 풀면 보여요" : undefined}
        />
        <StatCard label="퀴즈 푼 횟수" value={`${answerCount}번`} />
        <StatCard label="정답 수" value={`${correctCount}개`} />
      </div>

      <Link href="/quiz" className={buttonVariants({ size: "lg" })}>
        퀴즈 풀기
      </Link>
    </main>
  );
}
