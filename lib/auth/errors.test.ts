import { describe, expect, test } from "vitest";

import { signUpErrorMessage } from "./errors";

describe("가입 오류 안내", () => {
  test("이미 가입한 이메일이면 로그인하라고 안내한다", () => {
    expect(signUpErrorMessage({ code: "user_already_exists" })).toBe(
      "이미 가입한 이메일입니다. 로그인 탭에서 로그인해 주세요.",
    );
    expect(signUpErrorMessage({ code: "email_exists" })).toBe(
      "이미 가입한 이메일입니다. 로그인 탭에서 로그인해 주세요.",
    );
  });

  test("비밀번호가 약하면 더 길고 복잡하게 만들라고 안내한다", () => {
    expect(signUpErrorMessage({ code: "weak_password" })).toBe(
      "비밀번호가 너무 약합니다. 더 길게 만들고 숫자나 기호를 섞어 주세요.",
    );
  });

  test("이메일이 받아들여지지 않으면 다른 이메일을 쓰라고 안내한다", () => {
    expect(signUpErrorMessage({ code: "email_address_invalid" })).toBe(
      "이 이메일 주소로는 가입할 수 없습니다. 다른 이메일을 사용해 주세요.",
    );
  });

  test("가입이 막혀 있으면 관리자에게 문의하라고 안내한다", () => {
    expect(signUpErrorMessage({ code: "signup_disabled" })).toBe(
      "지금은 새로 가입할 수 없습니다. 앱 관리자에게 문의해 주세요.",
    );
    expect(signUpErrorMessage({ code: "email_provider_disabled" })).toBe(
      "지금은 새로 가입할 수 없습니다. 앱 관리자에게 문의해 주세요.",
    );
  });

  test("요청이 너무 잦으면 잠시 후 다시 하라고 안내한다", () => {
    for (const code of ["over_request_rate_limit", "over_email_send_rate_limit"]) {
      expect(signUpErrorMessage({ code })).toBe(
        "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
    expect(signUpErrorMessage({ status: 429 })).toBe(
      "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    );
  });

  test("알 수 없는 오류는 일반 안내를 돌려준다", () => {
    expect(signUpErrorMessage({ code: "something_new" })).toBe(
      "가입하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
    expect(signUpErrorMessage({})).toBe(
      "가입하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  });
});
