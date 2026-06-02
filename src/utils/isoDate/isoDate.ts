// ISO date <-> Date conversions and predicates. All UTC-based for timezone consistency.
import type { Weekday } from '@/types';
import { UTC_DAY_TO_WEEKDAY } from '@/constants';

// Sunday is index 0 in getUTCDay(); the clinic is closed Sundays.
export function isSunday(date: Date): boolean {
  return date.getUTCDay() === 0;
}

// The clinic weekday an ISO date falls on, or null if closed (Sunday) or malformed.
export function weekdayOf(iso: string): Weekday | null {
  const date = isoToDate(iso);
  return date ? (UTC_DAY_TO_WEEKDAY[date.getUTCDay()] ?? null) : null;
}

// "2026-06-01" -> Date at UTC midnight. Returns null for a malformed string.
// The round-trip check rejects overflow days: new Date() silently normalizes
// 2026-02-30 to Mar 2, so we reject any input that doesn't serialize back to itself.
export function isoToDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || dateToISO(date) !== iso) return null;
  return date;
}

// Date -> "YYYY-MM-DD" using its UTC calendar day.
export function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Today's ISO date (local wall-clock day). Used as the earliest selectable date.
export function todayISO(): string {
  return localDateToISO(new Date());
}

// Current local wall-clock time as "HH:mm". Pairs with todayISO() to compare
// against a slot's (date, startTime) and hide today's already-started slots.
export function nowHHmm(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// True if a slot has already started relative to (todayDate, nowTime). A slot is
// in the past on its own day once its start time is at or before now; earlier
// days are always past, later days never are.
export function isSlotInPast(
  slotDate: string,
  slotStartTime: string,
  todayDate: string,
  nowTime: string
): boolean {
  if (slotDate < todayDate) return true;
  if (slotDate > todayDate) return false;
  return slotStartTime <= nowTime;
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
// Mirrors isoToDate's round-trip guard: new Date() normalizes overflow days
// (2026-02-30 -> Mar 2), so reject any input that doesn't serialize back to itself.
export function isoToLocalDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (localDateToISO(date) !== iso) return null;
  return date;
}

// Local Date -> "YYYY-MM-DD" using its *local* calendar day.
export function localDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
