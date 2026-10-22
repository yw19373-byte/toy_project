import { describe, expect, test } from "vitest";

import type { SlangItem } from "@/lib/slang/types";

import { accuracyPercent } from "./stats";
import { buildQuestion } from "./question";

function makeCollection(size: number): SlangItem[] {
  return Array.from({ length: size }, (_, i) => ({
    expression: `expr-${i}`,
    definition: `definition ${i}`,
    ko: `뜻 ${i}`,
    example: `Example ${i}.`,
  }));
}

// 항상 같은 값을 돌려주는 난수. 시험을 결정적으로 만든다.
const constant = (value: number) => () => value;

// 씨앗마다 다른 값을 돌려주지만 같은 씨앗이면 같은 열을 돌려주는 난수(mulberry32).
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("퀴즈 문제 만들기", () => {
  const collection = makeCollection(10);

  test("본 표현이 없으면 문제를 만들지 않는다", () => {
    expect(buildQuestion([], collection, constant(0.5))).toBeNull();
  });

  test("모음에 없는 표현만 봤다면 문제를 만들지 않는다", () => {
    expect(buildQuestion(["unknown"], collection, constant(0.5))).toBeNull();
  });

  test("보기는 4개이고 서로 다르며 정답이 정확히 한 번 들어 있다", () => {
    const question = buildQuestion(["expr-3"], collection, constant(0.3));

    expect(question?.options).toHaveLength(4);
    expect(new Set(question?.options).size).toBe(4);
    expect(question?.options.filter((o) => o === "expr-3")).toHaveLength(1);
  });

  test("문제는 정답 표현의 한국어 번역과 영어 정의를 보여준다", () => {
    const question = buildQuestion(["expr-3"], collection, constant(0.3));

    expect(question).toMatchObject({
      expression: "expr-3",
      ko: "뜻 3",
      definition: "definition 3",
    });
  });

  test("본 표현 중에서만 문제를 낸다", () => {
    const seen = ["expr-2", "expr-7"];

    for (const value of [0, 0.2, 0.5, 0.8, 0.99]) {
      const question = buildQuestion(seen, collection, constant(value));
      expect(seen).toContain(question?.expression);
    }
  });

  test("난수에 따라 정답 보기의 위치가 달라질 수 있다", () => {
    const positions = new Set<number>();

    for (let seed = 1; seed <= 40; seed++) {
      const question = buildQuestion(["expr-3"], collection, seededRandom(seed));
      positions.add(question!.options.indexOf("expr-3"));
    }

    expect(positions.size).toBeGreaterThan(1);
  });

  test("모음이 4개보다 적으면 있는 만큼의 보기만 만든다", () => {
    const question = buildQuestion(["expr-0"], makeCollection(2), constant(0.4));

    expect(question?.options).toHaveLength(2);
  });
});

describe("정답률", () => {
  test("정답 수를 푼 횟수로 나눈 백분율을 반올림해서 돌려준다", () => {
    expect(accuracyPercent(7, 8)).toBe(88);
    expect(accuracyPercent(1, 3)).toBe(33);
    expect(accuracyPercent(0, 5)).toBe(0);
    expect(accuracyPercent(5, 5)).toBe(100);
  });

  test("푼 적이 없으면 정답률이 없다", () => {
    expect(accuracyPercent(0, 0)).toBeNull();
  });
});
