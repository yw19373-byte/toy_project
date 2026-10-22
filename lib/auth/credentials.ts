const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_DISPLAY_NAME_LENGTH = 40;

type Failure = { ok: false; error: string };

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

export function parseCredentials(
  data: FormData,
): { ok: true; email: string; password: string } | Failure {
  const email = text(data, "email").trim();
  const password = text(data, "password");

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "이메일 주소를 확인해 주세요." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: "비밀번호는 6자 이상이어야 합니다." };
  }
  return { ok: true, email, password };
}

export function parseDisplayName(
  data: FormData,
): { ok: true; displayName: string | null } | Failure {
  const displayName = text(data, "displayName").trim();

  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return { ok: false, error: "이름은 40자 이하로 입력해 주세요." };
  }
  return { ok: true, displayName: displayName === "" ? null : displayName };
}
