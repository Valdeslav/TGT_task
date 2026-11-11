const DAY_MS = 24 * 60 * 60 * 1000;

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = parseISODate(fromISO).getTime();
  const to = parseISODate(toISO).getTime();
  return Math.round((to - from) / DAY_MS);
}

export function daysSince(iso: string, today = todayISO()): number {
  return daysBetween(iso, today);
}

export function daysUntil(iso: string, today = todayISO()): number {
  return daysBetween(today, iso);
}

export function isPast(iso: string, today = todayISO()): boolean {
  return daysUntil(iso, today) < 0;
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(
    parseISODate(iso),
  );
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(
    parseISODate(iso),
  );
}

export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(parseISODate(iso));
}

export function pluralRu(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}

export function dayWord(day: number): string {
  return `${day}-й день`;
}

export function relativeDay(iso: string, today = todayISO()): string {
  const diff = daysUntil(iso, today);
  if (diff === 0) return 'сегодня';
  if (diff === 1) return 'завтра';
  if (diff === -1) return 'вчера';
  if (diff > 1) return `через ${diff} ${pluralRu(diff, 'день', 'дня', 'дней')}`;
  const past = Math.abs(diff);
  return `${past} ${pluralRu(past, 'день', 'дня', 'дней')} назад`;
}
