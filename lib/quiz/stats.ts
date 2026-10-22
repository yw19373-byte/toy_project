// 정답 수를 푼 횟수로 나눈 백분율. 푼 적이 없으면 null.
export function accuracyPercent(correct: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((correct / total) * 100);
}
