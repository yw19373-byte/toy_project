import { HomeView } from "@/components/home/home-view";
import { isHealthCategory } from "@/lib/content/kinds";
import { createClient } from "@/lib/supabase/server";

export default async function HealthPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <HomeView
      kind="health"
      category={isHealthCategory(category) ? category : undefined}
      signedIn={Boolean(data?.claims)}
    />
  );
}
