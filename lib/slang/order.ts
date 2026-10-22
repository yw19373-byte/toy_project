import type { SlangItem } from "./types";

const BATCH_SIZE = 3;

export type SeenRecord = { expression: string; firstSeenAt: string };

// 안 본 표현을 모음 순서대로 앞에 놓고, 본 표현은 처음 본 시각이 오래된 순서로 뒤에 놓는다.
export function buildPriorityOrder(
  collection: readonly SlangItem[],
  seen: readonly SeenRecord[],
): string[] {
  const seenAt = new Map(seen.map((record) => [record.expression, record.firstSeenAt]));
  const indexOf = new Map(collection.map((item, i) => [item.expression, i]));

  const unseen = collection
    .filter((item) => !seenAt.has(item.expression))
    .map((item) => item.expression);

  const seenInOrder = collection
    .filter((item) => seenAt.has(item.expression))
    .map((item) => item.expression)
    .sort((a, b) => {
      const byTime = Date.parse(seenAt.get(a)!) - Date.parse(seenAt.get(b)!);
      return byTime !== 0 ? byTime : indexOf.get(a)! - indexOf.get(b)!;
    });

  return [...unseen, ...seenInOrder];
}

// 순서에서 batchIndex번째 묶음 3개를 꺼낸다. 끝을 지나면 처음부터 이어서 꺼낸다.
export function pickBatch(order: readonly string[], batchIndex: number): string[] {
  if (order.length === 0) return [];

  const start = batchIndex * BATCH_SIZE;
  return Array.from(
    { length: Math.min(BATCH_SIZE, order.length) },
    (_, i) => order[(start + i) % order.length],
  );
}
