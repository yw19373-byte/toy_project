import { SLANG_COLLECTION } from "./collection";
import type { SlangItem } from "./types";

export const DAILY_COUNT = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// 기기 달력의 날짜(년/월/일)만 쓰므로 하루는 기기의 자정에 바뀐다.
function dayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY,
  );
}

// 그날의 시작 위치부터 모음을 처음으로 되돌아가며 count개를 이어서 돌려준다.
export function slangSequence(
  date: Date,
  count: number,
  collection: readonly SlangItem[] = SLANG_COLLECTION,
): SlangItem[] {
  const size = collection.length;
  if (size === 0) return [];

  const start = (dayNumber(date) * DAILY_COUNT) % size;

  return Array.from({ length: count }, (_, i) => collection[(start + i) % size]);
}

// 3개씩 묶어 돌려주되, 가장 나중에 이어진 묶음이 맨 앞에 오도록 뒤집는다.
export function slangBatches(
  date: Date,
  batchCount: number,
  collection: readonly SlangItem[] = SLANG_COLLECTION,
): SlangItem[][] {
  const size = collection.length;
  if (size === 0) return [];

  const perBatch = Math.min(DAILY_COUNT, size);
  const sequence = slangSequence(date, perBatch * batchCount, collection);

  return Array.from({ length: batchCount }, (_, i) =>
    sequence.slice(i * perBatch, (i + 1) * perBatch),
  ).reverse();
}

export function todaysSlang(
  date: Date,
  collection: readonly SlangItem[] = SLANG_COLLECTION,
): SlangItem[] {
  return slangSequence(date, Math.min(DAILY_COUNT, collection.length), collection);
}
