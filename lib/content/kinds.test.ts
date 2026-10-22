import { describe, expect, test } from "vitest";

import { HEALTH_COLLECTION } from "@/lib/health/collection";
import { SLANG_COLLECTION } from "@/lib/slang/collection";

import {
  collectionFor,
  collectionForCategory,
  displayTitle,
  HEALTH_CATEGORIES,
  HEALTH_CATEGORY_LABELS,
  isHealthCategory,
  isKind,
  KINDS,
  tablesFor,
} from "./kinds";

describe("콘텐츠 종류", () => {
  test("slang과 건강만 종류로 인정한다", () => {
    expect(isKind("slang")).toBe(true);
    expect(isKind("health")).toBe(true);
    expect(isKind("sports")).toBe(false);
    expect(isKind(undefined)).toBe(false);
  });

  test("종류마다 자기 모음을 돌려준다", () => {
    expect(collectionFor("slang")).toBe(SLANG_COLLECTION);
    expect(collectionFor("health")).toBe(HEALTH_COLLECTION);
  });

  test("종류마다 기록 테이블이 서로 다르다", () => {
    const slang = tablesFor("slang");
    const health = tablesFor("health");

    expect(slang.views).not.toBe(health.views);
    expect(slang.answers).not.toBe(health.answers);
    expect(slang.order).not.toBe(health.order);
  });

  test("한국어 이름이 있으면 그것을, 없으면 표현을 화면 이름으로 쓴다", () => {
    expect(displayTitle({ expression: "tea", definition: "d", ko: "k" })).toBe("tea");
    expect(
      displayTitle({ expression: "Sleep", definition: "d", ko: "k", titleKo: "수면" }),
    ).toBe("수면");
  });

  test("모든 종류에 제목, 라벨, 모음이 있다", () => {
    for (const kind of Object.keys(KINDS) as (keyof typeof KINDS)[]) {
      expect(KINDS[kind].heading).not.toBe("");
      expect(KINDS[kind].label).not.toBe("");
      expect(collectionFor(kind).length).toBeGreaterThanOrEqual(6);
    }
  });
});

describe("건강 모음", () => {
  test("항목마다 제목, 요약, 영어 핵심 문장, 분류, 논문 정보, 출처가 채워져 있다", () => {
    for (const item of HEALTH_COLLECTION) {
      expect(item.expression).toMatch(/^PMC\d+$/);
      expect(item.titleKo?.trim()).toBeTruthy();
      expect(item.definition.trim()).not.toBe("");
      expect(item.ko.trim()).not.toBe("");
      expect(HEALTH_CATEGORIES).toContain(item.category);
      expect(item.paperTitle?.trim()).toBeTruthy();
      expect(item.citation).toMatch(/ et al\., \d{4}/);
      expect(item.sourceUrl).toBe(
        `https://pmc.ncbi.nlm.nih.gov/articles/${item.expression}/`,
      );
    }
  });

  test("논문 번호와 한국어 제목이 중복되지 않는다", () => {
    const ids = HEALTH_COLLECTION.map((item) => item.expression);
    const titles = HEALTH_COLLECTION.map((item) => item.titleKo);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(titles).size).toBe(titles.length);
  });

  test("분류마다 같은 수의 항목이 있다", () => {
    for (const category of HEALTH_CATEGORIES) {
      expect(collectionForCategory("health", category)).toHaveLength(12);
    }
  });
});

describe("건강 분류", () => {
  test("네 가지 분류만 인정하고 한국어 이름이 있다", () => {
    expect(HEALTH_CATEGORIES).toEqual(["exercise", "food", "sleep", "mind"]);
    expect(HEALTH_CATEGORY_LABELS).toEqual({
      exercise: "운동",
      food: "음식",
      sleep: "수면",
      mind: "정신건강",
    });
    expect(isHealthCategory("sleep")).toBe(true);
    expect(isHealthCategory("sports")).toBe(false);
    expect(isHealthCategory(undefined)).toBe(false);
  });

  test("분류를 고르면 그 분류의 항목만 돌려주고 고르지 않으면 전체를 돌려준다", () => {
    const sleep = collectionForCategory("health", "sleep");

    expect(sleep.every((item) => item.category === "sleep")).toBe(true);
    expect(collectionForCategory("health")).toBe(HEALTH_COLLECTION);
  });

  test("영어 표현에는 분류가 적용되지 않는다", () => {
    expect(collectionForCategory("slang", "sleep")).toBe(SLANG_COLLECTION);
  });
});
