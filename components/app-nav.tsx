import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

const LINKS = [
  { href: "/", label: "오늘의 slang" },
  { href: "/quiz", label: "퀴즈" },
  { href: "/stats", label: "내 통계" },
  { href: "/settings", label: "내 설정" },
] as const;

export function AppNav({ current }: { current: (typeof LINKS)[number]["href"] }) {
  return (
    <nav aria-label="주요 메뉴" className="flex flex-wrap gap-2">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === current ? "page" : undefined}
          className={buttonVariants({
            variant: href === current ? "default" : "outline",
            size: "sm",
          })}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
