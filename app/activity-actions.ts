"use server";

import {
  collectionFor,
  collectionForCategory,
  isHealthCategory,
  isKind,
  tablesFor,
  type ContentKind,
} from "@/lib/content/kinds";
import { isDayKey } from "@/lib/slang/day-key";
import { buildPriorityOrder, pickBatch } from "@/lib/slang/order";
import type { ContentItem } from "@/lib/slang/types";
import { createClient } from "@/lib/supabase/server";

const MAX_BATCH_INDEX = 1000;
const MAX_PER_CALL = 100;
const ALL_CATEGORIES = "all";

function byExpression(kind: ContentKind): Map<string, ContentItem> {
  return new Map(collectionFor(kind).map((item) => [item.expression, item]));
}

// 로그인한 사용자의 하루 순서에서 batchIndex번째 묶음을 돌려준다.
// 하루 순서는 그날 처음 부를 때 정해 저장하므로, 이후 본 항목이 늘어도 바뀌지 않는다.
// 건강은 category를 주면 그 분류의 항목만으로 따로 순서를 만든다.
export async function getDailyBatch(
  kind: ContentKind,
  dayKey: string,
  batchIndex: number,
  category?: string,
): Promise<ContentItem[] | null> {
  if (!isKind(kind)) return null;
  if (typeof dayKey !== "string" || !isDayKey(dayKey)) return null;
  if (!Number.isInteger(batchIndex) || batchIndex < 0 || batchIndex > MAX_BATCH_INDEX) {
    return null;
  }
  if (category !== undefined && !isHealthCategory(category)) return null;

  const healthCategory = kind === "health" ? category : undefined;
  const categoryKey = healthCategory ?? ALL_CATEGORIES;
  const collection = collectionForCategory(kind, healthCategory);

  const tables = tablesFor(kind);
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;

  const loadStored = async (): Promise<string[] | null> => {
    const { data } = await supabase
      .from(tables.order)
      .select("expressions")
      .eq("user_id", userId)
      .eq("day", dayKey)
      .eq("category", categoryKey)
      .maybeSingle();
    return (data?.expressions as string[] | undefined) ?? null;
  };

  let order = await loadStored();
  if (!order) {
    const { data: views, error } = await supabase
      .from(tables.views)
      .select("expression, first_seen_at");
    if (error) return null;

    const built = buildPriorityOrder(
      collection,
      (views ?? []).map((row) => ({
        expression: row.expression as string,
        firstSeenAt: row.first_seen_at as string,
      })),
    );

    // 동시에 처음 부른 요청이 있으면 먼저 저장된 순서를 쓴다.
    await supabase.from(tables.order).upsert(
      { user_id: userId, day: dayKey, category: categoryKey, expressions: built },
      { onConflict: "user_id,day,category", ignoreDuplicates: true },
    );
    order = (await loadStored()) ?? built;
  }

  const lookup = new Map(collection.map((item) => [item.expression, item]));
  const items = pickBatch(order, batchIndex)
    .map((expression) => lookup.get(expression))
    .filter((item): item is ContentItem => item !== undefined);
  return items.length > 0 ? items : null;
}

// 로그인한 사용자가 본 항목을 기록한다. 이미 기록된 항목은 건너뛴다.
export async function recordViews(
  kind: ContentKind,
  expressions: string[],
): Promise<void> {
  if (!isKind(kind) || !Array.isArray(expressions)) return;

  const known = byExpression(kind);
  const unique = [...new Set(expressions)]
    .filter((expression) => known.has(expression))
    .slice(0, MAX_PER_CALL);
  if (unique.length === 0) return;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return;

  const table = tablesFor(kind).views;
  const { error } = await supabase.from(table).upsert(
    unique.map((expression) => ({ user_id: userId, expression })),
    { onConflict: "user_id,expression", ignoreDuplicates: true },
  );
  if (error) {
    console.error(`${table} upsert failed`, { code: error.code, message: error.message });
  }
}
