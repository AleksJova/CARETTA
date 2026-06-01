import type { Appointment } from '@/types';

export function upcomingAppointments(
  appointments: Appointment[],
  patientId: string,
  today: string
): Appointment[] {
  return appointments
    .filter(
      (a) =>
        a.patientId === patientId && a.status === 'confirmed' && a.date >= today
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    );
}
