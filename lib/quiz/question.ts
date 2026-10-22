import { SLANG_COLLECTION } from "@/lib/slang/collection";
import type { SlangItem } from "@/lib/slang/types";

const OPTION_COUNT = 4;

export type QuizQuestion = {
  expression: string;
  ko: string;
  definition: string;
  options: string[];
};

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 본 표현 중 하나를 정답으로 고르고, 모음의 다른 표현으로 오답 보기를 채운다.
export function buildQuestion(
  seen: readonly string[],
  collection: readonly SlangItem[] = SLANG_COLLECTION,
  random: () => number = Math.random,
): QuizQuestion | null {
  const byExpression = new Map(collection.map((item) => [item.expression, item]));
  const candidates = seen.filter((expression) => byExpression.has(expression));
  if (candidates.length === 0) return null;

  const answer = byExpression.get(pick(candidates, random))!;
  const others = collection
    .filter((item) => item.expression !== answer.expression)
    .map((item) => item.expression);
  const distractors = shuffle(others, random).slice(0, OPTION_COUNT - 1);

  return {
    expression: answer.expression,
    ko: answer.ko,
    definition: answer.definition,
    options: shuffle([answer.expression, ...distractors], random),
  };
}
