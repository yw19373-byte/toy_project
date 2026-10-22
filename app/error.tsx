"use client";

import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Error({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:py-12">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>화면을 불러오지 못했습니다</EmptyTitle>
          <EmptyDescription>
            잠시 후 다시 시도해 주세요.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => retry()}>다시 시도</Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
