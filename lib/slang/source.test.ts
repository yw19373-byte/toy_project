import { describe, expect, test } from "vitest";

import { dateFromKey, dayKey } from "./day-key";
import { wiktionaryUrl } from "./source";

describe("출처 링크", () => {
  test("한 단어 표현은 Wiktionary 문서 주소가 된다", () => {
    expect(wiktionaryUrl("tea")).toBe("https://en.wiktionary.org/wiki/tea");
  });

  test("띄어쓰기는 밑줄로 바뀌어 여러 단어 표현도 문서를 가리킨다", () => {
    expect(wiktionaryUrl("shoot the breeze")).toBe(
      "https://en.wiktionary.org/wiki/shoot_the_breeze",
    );
  });
});

describe("날짜 키", () => {
  const now = new Date(2026, 9, 22, 15, 30);

  test("날짜 지정이 없으면 기기의 오늘 날짜를 쓴다", () => {
    expect(dayKey("", now)).toBe("2026-10-22");
  });

  test("?date=YYYY-MM-DD로 날짜를 바꿔 볼 수 있다", () => {
    expect(dayKey("?date=2026-12-01", now)).toBe("2026-12-01");
  });

  test("형식이 틀리거나 없는 날짜는 무시하고 오늘 날짜를 쓴다", () => {
    expect(dayKey("?date=tomorrow", now)).toBe("2026-10-22");
    expect(dayKey("?date=2026-13-40", now)).toBe("2026-10-22");
  });

  test("날짜 키를 해당 날짜의 정오 Date로 되돌린다", () => {
    const date = dateFromKey("2026-12-01");

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 11, 1,
    ]);
  });
});
