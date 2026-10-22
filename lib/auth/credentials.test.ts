import { describe, expect, test } from "vitest";

import { parseCredentials, parseDisplayName } from "./credentials";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("로그인 입력 검증", () => {
  test("올바른 이메일과 비밀번호는 통과하고 이메일 앞뒤 공백은 지운다", () => {
    expect(
      parseCredentials(form({ email: "  me@example.com ", password: "secret1" })),
    ).toEqual({ ok: true, email: "me@example.com", password: "secret1" });
  });

  test("이메일 형식이 아니면 이메일 오류를 돌려준다", () => {
    expect(
      parseCredentials(form({ email: "not-an-email", password: "secret1" })),
    ).toEqual({ ok: false, error: "이메일 주소를 확인해 주세요." });
  });

  test("비밀번호가 6자 미만이면 비밀번호 오류를 돌려준다", () => {
    expect(
      parseCredentials(form({ email: "me@example.com", password: "12345" })),
    ).toEqual({ ok: false, error: "비밀번호는 6자 이상이어야 합니다." });
  });

  test("값이 없으면 이메일 오류를 돌려준다", () => {
    expect(parseCredentials(form({}))).toEqual({
      ok: false,
      error: "이메일 주소를 확인해 주세요.",
    });
  });
});

describe("표시 이름 검증", () => {
  test("앞뒤 공백을 지운 이름을 돌려준다", () => {
    expect(parseDisplayName(form({ displayName: "  민수 " }))).toEqual({
      ok: true,
      displayName: "민수",
    });
  });

  test("비워 두면 이름을 지우는 것으로 본다", () => {
    expect(parseDisplayName(form({ displayName: "   " }))).toEqual({
      ok: true,
      displayName: null,
    });
  });

  test("40자를 넘으면 오류를 돌려준다", () => {
    expect(parseDisplayName(form({ displayName: "가".repeat(41) }))).toEqual({
      ok: false,
      error: "이름은 40자 이하로 입력해 주세요.",
    });
  });
});
