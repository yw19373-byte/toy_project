import { describe, expect, test } from "vitest";

import { SLANG_COLLECTION } from "./collection";
import { slangSequence, todaysSlang } from "./today";
import type { SlangItem } from "./types";

function makeCollection(size: number): SlangItem[] {
  return Array.from({ length: size }, (_, i) => ({
    expression: `expr-${i}`,
    definition: `definition ${i}`,
    ko: `뜻 ${i}`,
    example: `Example ${i}.`,
  }));
}

const names = (items: readonly SlangItem[]) => items.map((i) => i.expression);

describe("오늘의 slang", () => {
  const collection = makeCollection(9);

  test("항상 3개를 돌려준다", () => {
    expect(todaysSlang(new Date(2026, 9, 22), collection)).toHaveLength(3);
  });

  test("같은 날에는 시각이 달라도 같은 3개가 같은 순서로 나온다", () => {
    const morning = todaysSlang(new Date(2026, 9, 22, 0, 0, 1), collection);
    const night = todaysSlang(new Date(2026, 9, 22, 23, 59, 59), collection);

    expect(names(night)).toEqual(names(morning));
  });

  test("다음 날에는 전날과 겹치지 않는 3개가 나온다", () => {
    const today = names(todaysSlang(new Date(2026, 9, 22), collection));
    const tomorrow = names(todaysSlang(new Date(2026, 9, 23), collection));

    expect(tomorrow.filter((name) => today.includes(name))).toEqual([]);
  });

  test("모음을 한 바퀴 돌면 처음으로 돌아간다", () => {
    const first = names(todaysSlang(new Date(2026, 9, 22), collection));
    const afterOneCycle = names(todaysSlang(new Date(2026, 9, 25), collection));

    expect(afterOneCycle).toEqual(first);
  });

  test("모음 크기가 3의 배수가 아니어도 한 바퀴를 넘어가며 이어서 고른다", () => {
    const odd = makeCollection(7);
    const days = [22, 23, 24].map((day) =>
      names(todaysSlang(new Date(2026, 9, day), odd)),
    );

    for (const day of days) {
      expect(new Set(day).size).toBe(3);
    }
    expect(names(todaysSlang(new Date(2026, 9, 23), odd))).not.toEqual(days[0]);
  });

  test("모음이 3개보다 적으면 있는 것만 돌려준다", () => {
    expect(todaysSlang(new Date(2026, 9, 22), makeCollection(2))).toHaveLength(2);
  });

  test("모음이 비어 있으면 빈 목록을 돌려준다", () => {
    expect(todaysSlang(new Date(2026, 9, 22), [])).toEqual([]);
  });

  test("연속된 날짜가 달 경계를 넘어도 하루씩 이어진다", () => {
    const lastDay = names(todaysSlang(new Date(2026, 9, 31), collection));
    const nextDay = names(todaysSlang(new Date(2026, 10, 1), collection));

    expect(nextDay.filter((name) => lastDay.includes(name))).toEqual([]);
  });
});

describe("더 보기", () => {
  const collection = makeCollection(9);
  const date = new Date(2026, 9, 22);

  test("앞의 3개는 오늘의 slang과 같고 그 다음 순서가 이어진다", () => {
    const six = names(slangSequence(date, 6, collection));
    const today = names(todaysSlang(date, collection));

    expect(six).toHaveLength(6);
    expect(six.slice(0, 3)).toEqual(today);
    expect(six.slice(3).filter((name) => today.includes(name))).toEqual([]);
  });

  test("모음의 끝을 지나도 처음부터 이어서 계속 돌려준다", () => {
    const sequence = names(slangSequence(date, 30, collection));

    expect(sequence).toHaveLength(30);
    expect(sequence.slice(9, 18)).toEqual(sequence.slice(0, 9));
  });

  test("모음이 비어 있으면 몇 개를 요청해도 빈 목록을 돌려준다", () => {
    expect(slangSequence(date, 6, [])).toEqual([]);
  });
});

describe("검수 모음", () => {
  test("항목마다 표현, 영어 정의, 한국어 번역, 예문이 모두 채워져 있다", () => {
    for (const item of SLANG_COLLECTION) {
      expect(item.expression.trim()).not.toBe("");
      expect(item.definition.trim()).not.toBe("");
      expect(item.ko.trim()).not.toBe("");
      expect(item.example.trim()).not.toBe("");
    }
  });

  test("표현이 중복되지 않는다", () => {
    const expressions = SLANG_COLLECTION.map((item) => item.expression);

    expect(new Set(expressions).size).toBe(expressions.length);
  });

  test("연속된 이틀이 겹치지 않을 만큼 충분히 크다", () => {
    expect(SLANG_COLLECTION.length).toBeGreaterThanOrEqual(6);
  });
});
