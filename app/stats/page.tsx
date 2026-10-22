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
import {
  collectionFor,
  HEALTH_CATEGORIES,
  HEALTH_CATEGORY_LABELS,
  KINDS,
  tablesFor,
  type ContentKind,
} from "@/lib/content/kinds";
import { accuracyPercent } from "@/lib/quiz/stats";
import { createClient } from "@/lib/supabase/server";

const ORDER: ContentKind[] = ["slang", "health"];

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

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

// RLS 덕분에 본인 기록만 집계된다. 본 항목은 지금 모음에 있는 것만 센다.
async function loadCounts(supabase: SupabaseServer, kind: ContentKind) {
  const tables = tablesFor(kind);
  const [views, answers, correct] = await Promise.all([
    supabase.from(tables.views).select("expression"),
    supabase.from(tables.answers).select("id", { count: "exact", head: true }),
    supabase
      .from(tables.answers)
      .select("id", { count: "exact", head: true })
      .eq("correct", true),
  ]);

  const collection = collectionFor(kind);
  const known = new Map(collection.map((item) => [item.expression, item]));
  const seenItems = (views.data ?? [])
    .map((row) => known.get(row.expression as string))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  return {
    seen: seenItems.length,
    seenByCategory: Object.fromEntries(
      HEALTH_CATEGORIES.map((category) => [
        category,
        seenItems.filter((item) => item.category === category).length,
      ]),
    ),
    answered: answers.count ?? 0,
    correct: correct.count ?? 0,
  };
}

export default async function StatsPage() {
  const supabase = await createClient();

  // 접근 판단은 서명이 검증되는 getClaims()로 한다.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const counts = await Promise.all(
    ORDER.map(async (kind) => [kind, await loadCounts(supabase, kind)] as const),
  );

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

      {counts.map(([kind, { seen, seenByCategory, answered, correct }]) => {
        const accuracy = accuracyPercent(correct, answered);
        const total = collectionFor(kind).length;

        return (
          <section
            key={kind}
            aria-labelledby={`stats-${kind}`}
            className="flex flex-col gap-3"
          >
            <h2
              id={`stats-${kind}`}
              className="font-heading text-lg font-medium"
            >
              {KINDS[kind].label}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="본 항목" value={`${seen}개`} note={`전체 ${total}개 중`} />
              <StatCard
                label="정답률"
                value={accuracy === null ? "아직 없음" : `${accuracy}%`}
                note={accuracy === null ? "퀴즈를 풀면 보여요" : undefined}
              />
              <StatCard label="퀴즈 푼 횟수" value={`${answered}번`} />
              <StatCard label="정답 수" value={`${correct}개`} />
            </div>
            {kind === "health" ? (
              <p className="text-sm text-muted-foreground">
                분류별 본 항목:{" "}
                {HEALTH_CATEGORIES.map(
                  (category) =>
                    `${HEALTH_CATEGORY_LABELS[category]} ${seenByCategory[category]}개`,
                ).join(", ")}
              </p>
            ) : null}
          </section>
        );
      })}

      <Link href="/quiz" className={buttonVariants({ size: "lg" })}>
        퀴즈 풀기
      </Link>
    </main>
  );
}
