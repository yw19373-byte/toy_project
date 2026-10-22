"use client";

import { useState, useSyncExternalStore } from "react";

import { BookOpenIcon } from "lucide-react";

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
import { dateFromKey, dayKey } from "@/lib/slang/day-key";
import { LICENSE_NAME, LICENSE_URL, wiktionaryUrl } from "@/lib/slang/source";
import { slangBatches, todaysSlang } from "@/lib/slang/today";

const DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

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
      aria-label="오늘의 slang을 불러오는 중"
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

export function TodaySlang() {
  const key = useSyncExternalStore(subscribe, getDayKey, getServerDayKey);
  const [batchCount, setBatchCount] = useState(1);

  if (key === null) return <LoadingState />;

  const date = dateFromKey(key);
  const hasToday = todaysSlang(date).length > 0;
  // 가장 나중에 이어진 묶음이 맨 앞이므로, 묶음 번호는 뒤에서부터 센다.
  const batches = slangBatches(date, batchCount).map((items, i) => ({
    id: batchCount - 1 - i,
    items,
  }));

  return (
    <section className="flex flex-col gap-4" aria-labelledby="today-slang">
      <header className="flex flex-col gap-1">
        <h1
          id="today-slang"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          오늘의 slang
        </h1>
        <p className="text-sm text-muted-foreground">
          <time dateTime={key}>{DATE_FORMAT.format(date)}</time>
        </p>
      </header>

      {hasToday ? (
        <Button
          variant="outline"
          size="lg"
          onClick={() => setBatchCount((count) => count + 1)}
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
            <EmptyTitle>오늘 보여줄 slang이 없습니다</EmptyTitle>
            <EmptyDescription>
              아직 준비된 slang이 없어요. 나중에 다시 열어 보세요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol className="flex flex-col gap-4">
          {batches.flatMap(({ id, items }) =>
            items.map((item, index) => ({ key: `${id}-${index}`, item })),
          ).map(({ key: itemKey, item }) => (
            <li key={itemKey}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{item.expression}</CardTitle>
                  <CardDescription className="text-base text-foreground">
                    {item.ko}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-muted-foreground">{item.definition}</p>
                  <blockquote className="border-l-2 pl-3 italic">
                    {item.example}
                  </blockquote>
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
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
