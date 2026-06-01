// ISO date <-> Date conversions and predicates. All UTC-based for timezone consistency.

// Sunday is index 0 in getUTCDay(); the clinic is closed Sundays.
export function isSunday(date: Date): boolean {
  return date.getUTCDay() === 0;
}

// "2026-06-01" -> Date at UTC midnight. Returns null for a malformed string.
export function isoToDate(iso: string): Date | null {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Date -> "YYYY-MM-DD" using its UTC calendar day.
export function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Today's ISO date (local wall-clock day). Used as the earliest selectable date.
export function todayISO(): string {
  return localDateToISO(new Date());
}

// If iso is a Sunday, return the Monday after; otherwise return iso unchanged.
export function nextOpenDay(iso: string): string {
  const date = isoToDate(iso);
  if (!date) return iso;
  if (isSunday(date)) {
    date.setUTCDate(date.getUTCDate() + 1);
    return dateToISO(date);
  }
  return iso;
}

// Local-time bridge: react-day-picker uses local dates; we store UTC ISO dates.
// Convert at the boundary to keep the picked day correct across timezones.

// "2026-06-02" -> Date at *local* midnight on that calendar day.
export function isoToLocalDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

// Local Date -> "YYYY-MM-DD" using its *local* calendar day.
export function localDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
