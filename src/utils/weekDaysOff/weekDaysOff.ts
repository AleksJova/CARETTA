import type { Doctor } from '@/types';
import { getWeekStart } from '../getWeekStart/getWeekStart';

// Counts doctor day-off entries within the clinic week containing `anchorISO`.
// Each (doctor, date) counts once, so two doctors off the same day count as two.
export function weekDaysOff(doctors: Doctor[], anchorISO: string): number {
  const monday = getWeekStart(anchorISO);
  const end = new Date(`${monday}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  const endISO = end.toISOString().slice(0, 10);

  let count = 0;
  for (const doctor of doctors) {
    for (const date of doctor.daysOff) {
      if (date >= monday && date < endISO) count += 1;
    }
  }
  return count;
}
