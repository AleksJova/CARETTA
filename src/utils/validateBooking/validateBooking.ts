import type { Appointment, Doctor, BookingRequest, Result } from '@/types';

export function validateBooking(
  request: BookingRequest,
  doctors: Doctor[],
  appointments: Appointment[]
): Result {
  const doctor = doctors.find((d) => d.id === request.doctorId);
  if (!doctor) {
    return { ok: false, reason: 'Doctor not found.' };
  }

  if (doctor.daysOff.includes(request.date)) {
    return { ok: false, reason: 'Doctor is not available on this date.' };
  }

  const conflict = appointments.find(
    (a) =>
      a.doctorId === request.doctorId &&
      a.date === request.date &&
      a.startTime === request.startTime &&
      a.status !== 'cancelled'
  );
  if (conflict) {
    return { ok: false, reason: 'This slot has already been booked.' };
  }

  return { ok: true };
}
