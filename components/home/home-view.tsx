import Link from "next/link";

import { AppNav } from "@/components/app-nav";
import { DailyContent } from "@/components/content/daily-content";
import { buttonVariants } from "@/components/ui/button";
import {
  HEALTH_CATEGORIES,
  HEALTH_CATEGORY_LABELS,
  type ContentKind,
} from "@/lib/content/kinds";
import type { HealthCategory } from "@/lib/slang/types";

function CategorySwitch({ current }: { current?: HealthCategory }) {
  const tabs: { href: string; label: string; active: boolean }[] = [
    { href: "/health", label: "전체", active: current === undefined },
    ...HEALTH_CATEGORIES.map((category) => ({
      href: `/health?category=${category}`,
      label: HEALTH_CATEGORY_LABELS[category],
      active: current === category,
    })),
  ];

  return (
    <nav aria-label="건강 분류" className="flex flex-wrap gap-2">
      {tabs.map(({ href, label, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={buttonVariants({
            variant: active ? "default" : "outline",
            size: "sm",
          })}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function HomeView({
  kind,
  category,
  signedIn,
}: {
  kind: ContentKind;
  category?: HealthCategory;
  signedIn: boolean;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      {signedIn ? (
        <AppNav current={kind === "health" ? "/health" : "/"} />
      ) : (
        <div className="flex flex-wrap justify-between gap-2">
          <nav aria-label="콘텐츠 종류" className="flex gap-2">
            <Link
              href="/"
              aria-current={kind === "slang" ? "page" : undefined}
              className={buttonVariants({
                variant: kind === "slang" ? "default" : "outline",
                size: "sm",
              })}
            >
              영어 표현
            </Link>
            <Link
              href="/health"
              aria-current={kind === "health" ? "page" : undefined}
              className={buttonVariants({
                variant: kind === "health" ? "default" : "outline",
                size: "sm",
              })}
            >
              건강
            </Link>
          </nav>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            로그인
          </Link>
        </div>
      )}
      {kind === "health" ? <CategorySwitch current={category} /> : null}
      <DailyContent
        key={`${kind}-${category ?? "all"}`}
        kind={kind}
        category={category}
        signedIn={signedIn}
      />
    </main>
  );
}
