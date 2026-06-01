import type { Doctor } from '@/types';
import { getWeekStart } from '../getWeekStart/getWeekStart';

// A single day off in the current week: which doctor, which ISO date.
export interface DayOffEntry {
  doctorId: string;
  doctorName: string;
  date: string;
}

// The Mon..Sun-exclusive bounds of the clinic week containing `anchorISO`.
function weekBounds(anchorISO: string): {
  start: string;
  endExclusive: string;
} {
  const start = getWeekStart(anchorISO);
  const end = new Date(`${start}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  return { start, endExclusive: end.toISOString().slice(0, 10) };
}

// Every doctor day-off falling in the clinic week of `anchorISO`, soonest first.
// Each (doctor, date) is one entry, so two doctors off the same day are two.
export function weekDaysOffList(
  doctors: Doctor[],
  anchorISO: string
): DayOffEntry[] {
  const { start, endExclusive } = weekBounds(anchorISO);

  const entries: DayOffEntry[] = [];
  for (const doctor of doctors) {
    for (const date of doctor.daysOff) {
      if (date >= start && date < endExclusive) {
        entries.push({ doctorId: doctor.id, doctorName: doctor.name, date });
      }
    }
  }
  return entries.sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.doctorName.localeCompare(b.doctorName)
  );
}

// Count of day-off entries in the clinic week containing `anchorISO`.
export function weekDaysOff(doctors: Doctor[], anchorISO: string): number {
  return weekDaysOffList(doctors, anchorISO).length;
}
