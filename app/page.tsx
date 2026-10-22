import { HomeView } from "@/components/home/home-view";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return <HomeView kind="slang" signedIn={Boolean(data?.claims)} />;
}
