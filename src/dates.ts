export function uid(): string {
  return crypto.randomUUID();
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function startOfWeek(date: Date): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = next.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  next.setDate(next.getDate() + offset);
  return next;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

let dateLocale = 'en-US';

export function setDateLocale(lang: 'en' | 'ru'): void {
  dateLocale = lang === 'ru' ? 'ru-RU' : 'en-US';
}

export function formatLong(iso: string): string {
  return capitalize(
    parseISODate(iso).toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );
}

export function formatMedium(iso: string): string {
  return capitalize(
    parseISODate(iso).toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'long',
    }),
  );
}

export function formatWeekday(iso: string): string {
  return capitalize(
    parseISODate(iso)
      .toLocaleDateString(dateLocale, { weekday: 'short' })
      .replace('.', ''),
  );
}

export function formatDayNumber(iso: string): string {
  return String(parseISODate(iso).getDate());
}

export function monthLabel(year: number, month: number): string {
  return capitalize(
    new Date(year, month - 1, 1).toLocaleDateString(dateLocale, {
      month: 'long',
    }),
  );
}

export function formatMonthYear(year: number, month: number): string {
  return capitalize(
    new Date(year, month - 1, 1).toLocaleDateString(dateLocale, {
      month: 'long',
      year: 'numeric',
    }),
  );
}

export function weekdayShortNames(): string[] {
  const monday = startOfWeek(new Date(2024, 0, 1));
  return Array.from({ length: 7 }, (_, index) =>
    capitalize(
      addDays(monday, index)
        .toLocaleDateString(dateLocale, { weekday: 'short' })
        .replace('.', ''),
    ),
  );
}

export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const weekday = first.getDay();
  const pad = weekday === 0 ? 6 : weekday - 1;
  const cells: (string | null)[] = Array.from({ length: pad }, () => null);
  for (let day = 1; day <= lastDay; day += 1) {
    cells.push(toISODate(new Date(year, month - 1, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function maxISODate(a: string, b: string): string {
  return a > b ? a : b;
}

export function minISODate(a: string, b: string): string {
  return a < b ? a : b;
}

export function formatWeekRange(start: string, end: string): string {
  if (start === end) return formatMedium(start);
  const first = parseISODate(start);
  const last = parseISODate(end);
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return `${first.getDate()}–${formatMedium(end)}`;
  }
  return `${formatMedium(start)} – ${formatMedium(end)}`;
}

export function weekDays(startDate: string, endDate: string): string[] {
  return eachDate(startDate, endDate);
}

export function isWeekday(iso: string): boolean {
  const weekday = parseISODate(iso).getDay();
  return weekday !== 0 && weekday !== 6;
}

export function eachDate(start: string, end: string, predicate?: (iso: string) => boolean): string[] {
  const dates: string[] = [];
  let cursor = parseISODate(start);
  const last = parseISODate(end);
  while (cursor <= last) {
    const iso = toISODate(cursor);
    if (!predicate || predicate(iso)) dates.push(iso);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function clampDate(iso: string, start: string, end: string): string {
  if (iso < start) return start;
  if (iso > end) return end;
  return iso;
}
