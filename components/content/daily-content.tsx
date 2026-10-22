"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { BookOpenIcon } from "lucide-react";

import { getDailyBatch, recordViews } from "@/app/activity-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  collectionForCategory,
  HEALTH_CATEGORY_LABELS,
  KINDS,
  type ContentKind,
} from "@/lib/content/kinds";
import { dateFromKey, dayKey } from "@/lib/slang/day-key";
import { LICENSE_NAME, LICENSE_URL, wiktionaryUrl } from "@/lib/slang/source";
import { slangBatches, todaysSlang } from "@/lib/slang/today";
import type { ContentItem, HealthCategory } from "@/lib/slang/types";

const DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

type Batch = { id: number; items: ContentItem[] };

// 날짜는 기기에서만 알 수 있어 서버 렌더링 때는 null이다.
function subscribe() {
  return () => {};
}

function getDayKey(): string {
  return dayKey(window.location.search, new Date());
}

function getServerDayKey(): null {
  return null;
}

function LoadingState() {
  return (
    <div
      className="flex flex-col gap-4"
      role="status"
      aria-label="불러오는 중"
    >
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SlangCard({ item }: { item: ContentItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{item.expression}</CardTitle>
        <CardDescription className="text-base text-foreground">
          {item.ko}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-muted-foreground">{item.definition}</p>
        <blockquote className="border-l-2 pl-3 italic">{item.example}</blockquote>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          출처:{" "}
          <a
            className="underline underline-offset-4"
            href={wiktionaryUrl(item.expression)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Wiktionary
          </a>
          , 라이선스:{" "}
          <a
            className="underline underline-offset-4"
            href={LICENSE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {LICENSE_NAME}
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

function HealthCard({ item }: { item: ContentItem }) {
  return (
    <Card>
      <CardHeader>
        {item.category ? (
          <Badge variant="secondary">{HEALTH_CATEGORY_LABELS[item.category]}</Badge>
        ) : null}
        <CardTitle className="text-xl">{item.titleKo}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p>{item.ko}</p>
        <blockquote className="border-l-2 pl-3 text-muted-foreground italic">
          {item.definition}
        </blockquote>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          원문 논문:{" "}
          <a
            className="underline underline-offset-4"
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.paperTitle}
          </a>{" "}
          ({item.citation}). 라이선스 CC BY. 한국어 제목과 요약은 초록을 바탕으로 이 앱에서
          썼으며 공식 번역이 아닙니다.
        </p>
      </CardFooter>
    </Card>
  );
}

// 가장 나중에 이어진 묶음이 맨 앞이므로, 묶음 번호는 뒤에서부터 센다.
function newestFirst(batches: ContentItem[][]): Batch[] {
  return batches.map((items, i) => ({ id: i, items })).reverse();
}

export function DailyContent({
  kind,
  category,
  signedIn,
}: {
  kind: ContentKind;
  category?: HealthCategory;
  signedIn: boolean;
}) {
  const key = useSyncExternalStore(subscribe, getDayKey, getServerDayKey);
  const [localBatchCount, setLocalBatchCount] = useState(1);
  // 로그인한 사용자의 서버 순서. 오래된 묶음부터 담는다.
  const [remote, setRemote] = useState<{
    key: string;
    batches: ContentItem[][];
  } | null>(null);
  const [remoteFailed, setRemoteFailed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const recorded = useRef(new Set<string>());

  const config = KINDS[kind];
  const useRemote = signedIn && !remoteFailed;
  const date = key === null ? null : dateFromKey(key);

  // 로그인한 사용자는 그날 처음 연 순서(안 본 항목 우선)를 서버에서 받아 온다.
  useEffect(() => {
    if (!signedIn || key === null) return;

    let cancelled = false;
    getDailyBatch(kind, key, 0, category)
      .then((items) => {
        if (cancelled) return;
        if (items) setRemote({ key, batches: [items] });
        else setRemoteFailed(true);
      })
      .catch(() => {
        // 불러오지 못하면 날짜로 정해지는 순서로 보여준다.
        if (!cancelled) setRemoteFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [signedIn, kind, category, key]);

  const remoteReady = useRemote && remote !== null && remote.key === key;
  const batches: Batch[] = useRemote
    ? remoteReady
      ? newestFirst(remote.batches)
      : []
    : date
      ? newestFirst(
          slangBatches(
            date,
            localBatchCount,
            collectionForCategory(kind, category),
          ).reverse(),
        )
      : [];
  const shownKey = batches
    .flatMap(({ items }) => items.map((item) => item.expression))
    .join("|");

  // 로그인한 사용자에게 보인 항목을 한 번씩만 서버에 기록한다.
  useEffect(() => {
    if (!signedIn || shownKey === "") return;

    const fresh = shownKey
      .split("|")
      .filter((expression) => !recorded.current.has(expression));
    if (fresh.length === 0) return;

    for (const expression of fresh) recorded.current.add(expression);
    void recordViews(kind, fresh).catch(() => {
      // 기록 실패가 화면을 막으면 안 된다. 다음에 다시 보일 때 기록된다.
      for (const expression of fresh) recorded.current.delete(expression);
    });
  }, [signedIn, kind, shownKey]);

  if (key === null || date === null) return <LoadingState />;
  if (useRemote && !remoteReady) return <LoadingState />;

  const hasToday = useRemote
    ? remote !== null && remote.batches[0].length > 0
    : todaysSlang(date, collectionForCategory(kind, category)).length > 0;

  function showMore() {
    if (!useRemote) {
      setLocalBatchCount((count) => count + 1);
      return;
    }
    if (!remote || loadingMore) return;

    setLoadingMore(true);
    getDailyBatch(kind, remote.key, remote.batches.length, category)
      .then((items) => {
        if (items) {
          setRemote((current) =>
            current && current.key === remote.key
              ? { key: current.key, batches: [...current.batches, items] }
              : current,
          );
        }
      })
      .catch(() => {
        // 더 불러오지 못해도 이미 보이는 항목은 그대로 둔다.
      })
      .finally(() => setLoadingMore(false));
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="today-heading">
      <header className="flex flex-col gap-1">
        <h1
          id="today-heading"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          {config.heading}
        </h1>
        <p className="text-sm text-muted-foreground">
          <time dateTime={key}>{DATE_FORMAT.format(date)}</time>
        </p>
      </header>

      {kind === "health" ? (
        <Alert>
          <AlertDescription>
            소개하는 내용은 연구 결과이며 모든 사람에게 같은 효과를 보장하지 않습니다.
            의학적 조언이 아니니, 증상이 있거나 걱정되면 의사나 약사 같은 전문가와
            상담하세요.
          </AlertDescription>
        </Alert>
      ) : null}

      {hasToday ? (
        <Button
          variant="outline"
          size="lg"
          disabled={loadingMore}
          onClick={showMore}
        >
          더 보기
        </Button>
      ) : null}

      {!hasToday ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenIcon />
            </EmptyMedia>
            <EmptyTitle>오늘 보여줄 항목이 없습니다</EmptyTitle>
            <EmptyDescription>
              아직 준비된 내용이 없어요. 나중에 다시 열어 보세요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol className="flex flex-col gap-4">
          {batches
            .flatMap(({ id, items }) =>
              items.map((item, index) => ({ key: `${id}-${index}`, item })),
            )
            .map(({ key: itemKey, item }) => (
              <li key={itemKey}>
                {kind === "health" ? (
                  <HealthCard item={item} />
                ) : (
                  <SlangCard item={item} />
                )}
              </li>
            ))}
        </ol>
      )}
    </section>
  );
}
