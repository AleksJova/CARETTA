import type { Appointment } from '@/types';
import { isSlotInPast } from '@/utils/isoDate/isoDate';

export function upcomingAppointments(
  appointments: Appointment[],
  patientId: string,
  today: string,
  now: string
): Appointment[] {
  return appointments
    .filter(
      (a) =>
        a.patientId === patientId &&
        a.status === 'confirmed' &&
        !isSlotInPast(a.date, a.startTime, today, now)
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    );
}
