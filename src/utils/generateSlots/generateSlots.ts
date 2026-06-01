import type { Doctor, Slot } from '@/types';
import {
  SHIFT_HOURS,
  SLOT_DURATION_HOURS,
  UTC_DAY_TO_WEEKDAY,
} from '@/constants';

// Clinic works Mon–Sat (6 days)
const CLINIC_DAYS_PER_WEEK = 6;

// Convert Date to ISO string ("YYYY-MM-DD") using UTC.
function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Pads an integer hour into "HH:mm". Slots are always on the hour, so minutes are "00".
function toTime(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * Generates 1-hour consultation slots for a doctor across a week (Mon–Sat only),
 * respecting their shift (morning or afternoon), working days, and days off.
 */
export function generateSlots(doctor: Doctor, weekStart: string): Slot[] {
  const { start, end } = SHIFT_HOURS[doctor.shift];
  const workingDays = new Set(doctor.workingDays);
  const daysOff = new Set(doctor.daysOff);
  const start0 = new Date(`${weekStart}T00:00:00Z`);

  // Guard against a malformed weekStart that cannot be parsed into a valid date.
  // In that case, return no slots
  if (Number.isNaN(start0.getTime())) {
    return [];
  }

  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset < CLINIC_DAYS_PER_WEEK; dayOffset++) {
    const day = new Date(start0);
    day.setUTCDate(day.getUTCDate() + dayOffset);

    const weekday = UTC_DAY_TO_WEEKDAY[day.getUTCDay()];
    if (!weekday || !workingDays.has(weekday)) {
      continue;
    }

    const date = toISODate(day);
    if (daysOff.has(date)) {
      continue;
    }

    for (let hour = start; hour + SLOT_DURATION_HOURS <= end; hour++) {
      slots.push({
        doctorId: doctor.id,
        date,
        startTime: toTime(hour),
        endTime: toTime(hour + SLOT_DURATION_HOURS),
      });
    }
  }

  return slots;
}
