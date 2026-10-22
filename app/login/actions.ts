"use server";

import { redirect } from "next/navigation";

import { parseCredentials } from "@/lib/auth/credentials";
import { signUpErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string } | undefined;

export async function signIn(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const input = parseCredentials(formData);
  if (!input.ok) return { error: input.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };

  redirect("/settings");
}

export async function signUp(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const input = parseCredentials(formData);
  if (!input.ok) return { error: input.error };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });
  if (error) {
    // 원인을 서버 로그에서 확인할 수 있게 코드와 상태만 남긴다. 이메일과 비밀번호는 남기지 않는다.
    console.error("signUp failed", { code: error.code, status: error.status });
    return { error: signUpErrorMessage(error) };
  }

  // 이메일 확인이 켜져 있으면 세션이 없다. 확인 후 로그인하도록 안내한다.
  if (!data.session) {
    return { notice: "확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요." };
  }

  redirect("/settings");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
