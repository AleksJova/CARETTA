import type { Shift, Weekday } from '@/types';

export const SHIFT_HOURS: Record<Shift, { start: number; end: number }> = {
  morning: { start: 8, end: 13 }, // 5 slots: 08–09 … 12–13
  afternoon: { start: 13, end: 19 }, // 6 slots: 13–14 … 18–19
} as const;

export const SLOT_DURATION_HOURS = 1;

// The clinic's fixed specialties — the doctor form and seed data both use these.
export const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pulmonology',
] as const;

// Clinic working days, Mon–Sat (no Sunday). Order matters: used for the
// working-days picker and for compact range rendering.
export const WEEKDAYS: readonly Weekday[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

// Maps Date.getUTCDay() values to clinic weekdays.
// Sunday is null because the clinic is closed.
export const UTC_DAY_TO_WEEKDAY: readonly (Weekday | null)[] = [
  null,
  ...WEEKDAYS,
] as const;
