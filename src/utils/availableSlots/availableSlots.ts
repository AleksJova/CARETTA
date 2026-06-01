import type { Appointment, Doctor, Slot } from '@/types';
import { generateSlots } from '@/utils/generateSlots/generateSlots';

// Filters a patient can apply; undefined fields = no constraint.
export interface SlotFilters {
  specialty?: string;
  doctorId?: string;
  date?: string; // ISO date — when set, only that single day's slots are returned
}

// Cancelled appointments are excluded from booked slots (so their slots reappear).
function bookedKey(doctorId: string, date: string, startTime: string): string {
  return `${doctorId}|${date}|${startTime}`;
}

/**
 * Derives available slots: schedule (minus days off) minus booked appointments.
 */
export function availableSlots(
  doctors: Doctor[],
  appointments: Appointment[],
  weekStart: string,
  filters: SlotFilters = {}
): Slot[] {
  const booked = new Set(
    appointments
      .filter((a) => a.status !== 'cancelled')
      .map((a) => bookedKey(a.doctorId, a.date, a.startTime))
  );

  const candidates = doctors.filter((doctor) => {
    if (filters.specialty && doctor.specialty !== filters.specialty) {
      return false;
    }
    if (filters.doctorId && doctor.id !== filters.doctorId) {
      return false;
    }
    return true;
  });

  const slots: Slot[] = [];
  for (const doctor of candidates) {
    for (const slot of generateSlots(doctor, weekStart)) {
      if (filters.date && slot.date !== filters.date) {
        continue;
      }
      if (booked.has(bookedKey(slot.doctorId, slot.date, slot.startTime))) {
        continue;
      }
      slots.push(slot);
    }
  }

  slots.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.startTime.localeCompare(b.startTime) ||
      a.doctorId.localeCompare(b.doctorId)
  );

  return slots;
}
