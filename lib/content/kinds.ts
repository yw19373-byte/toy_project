import { HEALTH_COLLECTION } from "@/lib/health/collection";
import { SLANG_COLLECTION } from "@/lib/slang/collection";
import type { ContentItem, HealthCategory } from "@/lib/slang/types";

export type ContentKind = "slang" | "health";

type KindConfig = {
  heading: string;
  label: string;
  collection: readonly ContentItem[];
  // 종류마다 따로 기록하는 테이블 이름.
  tables: { views: string; answers: string; order: string };
};

export const KINDS: Record<ContentKind, KindConfig> = {
  slang: {
    heading: "오늘의 slang",
    label: "영어 표현",
    collection: SLANG_COLLECTION,
    tables: {
      views: "slang_views",
      answers: "quiz_answers",
      order: "daily_slang_order",
    },
  },
  health: {
    heading: "오늘의 건강",
    label: "건강",
    collection: HEALTH_COLLECTION,
    tables: {
      views: "health_views",
      answers: "health_quiz_answers",
      order: "daily_health_order",
    },
  },
};

export function isKind(value: unknown): value is ContentKind {
  return value === "slang" || value === "health";
}

export function collectionFor(kind: ContentKind): readonly ContentItem[] {
  return KINDS[kind].collection;
}

export function tablesFor(kind: ContentKind): KindConfig["tables"] {
  return KINDS[kind].tables;
}

// 한국어 이름이 있으면 그것을, 없으면 표현을 화면과 퀴즈 보기에 쓴다.
export function displayTitle(item: ContentItem): string {
  return item.titleKo ?? item.expression;
}

export const HEALTH_CATEGORIES: readonly HealthCategory[] = [
  "exercise",
  "food",
  "sleep",
  "mind",
];

export const HEALTH_CATEGORY_LABELS: Record<HealthCategory, string> = {
  exercise: "운동",
  food: "음식",
  sleep: "수면",
  mind: "정신건강",
};

export function isHealthCategory(value: unknown): value is HealthCategory {
  return HEALTH_CATEGORIES.includes(value as HealthCategory);
}

// 분류를 고르면 그 분류의 항목만, 고르지 않으면 모음 전체를 돌려준다.
export function collectionForCategory(
  kind: ContentKind,
  category?: HealthCategory,
): readonly ContentItem[] {
  const all = collectionFor(kind);
  if (kind !== "health" || !category) return all;
  return all.filter((item) => item.category === category);
}
