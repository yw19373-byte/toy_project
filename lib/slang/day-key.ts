const KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 키가 실제로 존재하는 달력 날짜일 때만 Date로 바꾼다.
function parseKey(key: string): Date | null {
  const match = KEY_PATTERN.exec(key);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, 12);
  return toKey(date) === key ? date : null;
}

// 날짜를 바꿔 확인할 수 있도록 ?date=YYYY-MM-DD를 받고, 없거나 틀리면 오늘을 쓴다.
export function dayKey(search: string, now: Date): string {
  const requested = new URLSearchParams(search).get("date");
  return requested !== null && parseKey(requested) ? requested : toKey(now);
}

export function isDayKey(key: string): boolean {
  return parseKey(key) !== null;
}

export function dateFromKey(key: string): Date {
  const date = parseKey(key);
  if (!date) throw new Error(`Invalid day key: ${key}`);
  return date;
}
