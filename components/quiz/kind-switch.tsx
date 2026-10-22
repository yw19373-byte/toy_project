import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { KINDS, type ContentKind } from "@/lib/content/kinds";

const ORDER: ContentKind[] = ["slang", "health"];

// 퀴즈에서 풀 콘텐츠 종류를 고른다. 선택은 주소의 kind 값으로 정해진다.
export function KindSwitch({ current }: { current: ContentKind }) {
  return (
    <nav aria-label="퀴즈 종류" className="flex gap-2">
      {ORDER.map((kind) => (
        <Link
          key={kind}
          href={`/quiz?kind=${kind}`}
          aria-current={kind === current ? "page" : undefined}
          className={buttonVariants({
            variant: kind === current ? "default" : "outline",
            size: "sm",
          })}
        >
          {KINDS[kind].label}
        </Link>
      ))}
    </nav>
  );
}
