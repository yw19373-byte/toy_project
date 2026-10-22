import { redirect } from "next/navigation";

import { AuthForms } from "@/components/auth/auth-forms";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/settings");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 sm:py-12">
      <AuthForms />
    </main>
  );
}
