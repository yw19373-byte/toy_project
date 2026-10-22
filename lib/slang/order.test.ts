import { describe, expect, test } from "vitest";

import { buildPriorityOrder, pickBatch } from "./order";
import type { SlangItem } from "./types";

function makeCollection(names: string[]): SlangItem[] {
  return names.map((name) => ({
    expression: name,
    definition: `definition of ${name}`,
    ko: `뜻 ${name}`,
    example: `Example ${name}.`,
  }));
}

const collection = makeCollection(["a", "b", "c", "d", "e", "f"]);

describe("하루 순서 만들기", () => {
  test("본 기록이 없으면 모음 순서 그대로다", () => {
    expect(buildPriorityOrder(collection, [])).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  test("안 본 표현이 앞에 오고 본 표현은 뒤로 간다", () => {
    const seen = [
      { expression: "a", firstSeenAt: "2026-10-20T09:00:00Z" },
      { expression: "c", firstSeenAt: "2026-10-20T09:00:01Z" },
    ];

    expect(buildPriorityOrder(collection, seen).slice(0, 4)).toEqual([
      "b",
      "d",
      "e",
      "f",
    ]);
  });

  test("본 표현은 처음 본 시각이 오래된 순서로 뒤에 놓인다", () => {
    const seen = [
      { expression: "a", firstSeenAt: "2026-10-22T09:00:00Z" },
      { expression: "b", firstSeenAt: "2026-10-20T09:00:00Z" },
      { expression: "c", firstSeenAt: "2026-10-21T09:00:00Z" },
    ];

    expect(buildPriorityOrder(collection, seen)).toEqual([
      "d",
      "e",
      "f",
      "b",
      "c",
      "a",
    ]);
  });

  test("처음 본 시각이 같으면 모음 순서로 정한다", () => {
    const seen = ["c", "a", "b"].map((expression) => ({
      expression,
      firstSeenAt: "2026-10-20T09:00:00Z",
    }));

    expect(buildPriorityOrder(collection, seen).slice(3)).toEqual(["a", "b", "c"]);
  });

  test("모음에 없는 표현의 기록은 무시하고 모든 표현이 한 번씩만 들어간다", () => {
    const seen = [
      { expression: "ghost", firstSeenAt: "2026-10-20T09:00:00Z" },
      { expression: "a", firstSeenAt: "2026-10-20T09:00:00Z" },
    ];
    const order = buildPriorityOrder(collection, seen);

    expect(order).toHaveLength(6);
    expect(new Set(order).size).toBe(6);
    expect(order).not.toContain("ghost");
  });
});

describe("순서에서 묶음 꺼내기", () => {
  const order = ["a", "b", "c", "d", "e", "f", "g"];

  test("묶음 번호에 따라 3개씩 이어서 꺼낸다", () => {
    expect(pickBatch(order, 0)).toEqual(["a", "b", "c"]);
    expect(pickBatch(order, 1)).toEqual(["d", "e", "f"]);
  });

  test("끝을 지나면 처음부터 이어서 꺼낸다", () => {
    expect(pickBatch(order, 2)).toEqual(["g", "a", "b"]);
  });

  test("순서가 비어 있으면 빈 목록이다", () => {
    expect(pickBatch([], 0)).toEqual([]);
  });
});
