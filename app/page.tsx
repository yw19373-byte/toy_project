import { TodaySlang } from "@/components/slang/today-slang";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <TodaySlang />
    </main>
  );
}
