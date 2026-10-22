"use server";

import { revalidatePath } from "next/cache";

import { parseDisplayName } from "@/lib/auth/credentials";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; saved?: boolean } | undefined;

export async function updateDisplayName(
  _previous: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const input = parseDisplayName(formData);
  if (!input.ok) return { error: input.error };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { error: "로그인이 필요합니다." };

  // RLS가 본인 행만 허용한다. 갱신된 행이 없으면 조용히 실패한 것이므로 확인한다.
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: input.displayName })
    .eq("id", claims.claims.sub)
    .select("id");
  if (error || !data || data.length === 0) {
    console.error("profiles update failed", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      updatedRows: data?.length,
    });
    return { error: "이름을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath("/settings");
  return { saved: true };
}
