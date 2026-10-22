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

export function todaysSlang(
  date: Date,
  collection: readonly SlangItem[] = SLANG_COLLECTION,
): SlangItem[] {
  return slangSequence(date, Math.min(DAILY_COUNT, collection.length), collection);
}
