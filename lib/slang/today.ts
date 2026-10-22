import { SLANG_COLLECTION } from "./collection";
import type { SlangItem } from "./types";

const DAILY_COUNT = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// 기기 달력의 날짜(년/월/일)만 쓰므로 하루는 기기의 자정에 바뀐다.
function dayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY,
  );
}

export function todaysSlang(
  date: Date,
  collection: readonly SlangItem[] = SLANG_COLLECTION,
): SlangItem[] {
  const size = collection.length;
  if (size === 0) return [];

  const count = Math.min(DAILY_COUNT, size);
  const start = (dayNumber(date) * DAILY_COUNT) % size;

  return Array.from({ length: count }, (_, i) => collection[(start + i) % size]);
}
