type AuthErrorLike = { code?: string; status?: number };

const GENERIC = "가입하지 못했습니다. 잠시 후 다시 시도해 주세요.";

const BY_CODE: Record<string, string> = {
  user_already_exists: "이미 가입한 이메일입니다. 로그인 탭에서 로그인해 주세요.",
  email_exists: "이미 가입한 이메일입니다. 로그인 탭에서 로그인해 주세요.",
  weak_password: "비밀번호가 너무 약합니다. 더 길게 만들고 숫자나 기호를 섞어 주세요.",
  email_address_invalid: "이 이메일 주소로는 가입할 수 없습니다. 다른 이메일을 사용해 주세요.",
  signup_disabled: "지금은 새로 가입할 수 없습니다. 앱 관리자에게 문의해 주세요.",
  email_provider_disabled: "지금은 새로 가입할 수 없습니다. 앱 관리자에게 문의해 주세요.",
  over_request_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  over_email_send_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
};

// Supabase Auth 오류를 사용자가 다음에 할 일을 알 수 있는 한국어 문구로 바꾼다.
export function signUpErrorMessage(error: AuthErrorLike): string {
  if (error.code && error.code in BY_CODE) return BY_CODE[error.code];
  if (error.status === 429) return BY_CODE.over_request_rate_limit;
  return GENERIC;
}
