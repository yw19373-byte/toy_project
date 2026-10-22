import { redirect } from "next/navigation";

import { signOut } from "@/app/login/actions";
import { AppNav } from "@/components/app-nav";
import { ProfileForm } from "@/components/settings/profile-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  // 접근 판단은 서명이 검증되는 getClaims()로 한다.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login");

  // RLS 덕분에 본인 행만 조회된다.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", claims.sub)
    .maybeSingle();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8 sm:py-12">
      <AppNav current="/settings" />
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">내 설정</CardTitle>
          <CardDescription>{claims.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm displayName={profile?.display_name ?? ""} />
        </CardContent>
        <CardFooter>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              로그아웃
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
