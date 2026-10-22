import Link from "next/link";

import { AppNav } from "@/components/app-nav";
import { TodaySlang } from "@/components/slang/today-slang";
import { buttonVariants } from "@/components/ui/button";

export function HomeView({ signedIn }: { signedIn: boolean }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      {signedIn ? (
        <AppNav current="/" />
      ) : (
        <div className="flex justify-end">
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            로그인
          </Link>
        </div>
      )}
      <TodaySlang signedIn={signedIn} />
    </main>
  );
}
