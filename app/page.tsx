import Link from "next/link";

import { TodaySlang } from "@/components/slang/today-slang";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <div className="flex justify-end">
        <Link
          href="/settings"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          내 설정
        </Link>
      </div>
      <TodaySlang />
    </main>
  );
}
