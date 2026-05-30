import type { Appointment, Doctor, BookingRequest, Result } from '@/types';
import {
  SHIFT_HOURS,
  SLOT_DURATION_HOURS,
  UTC_DAY_TO_WEEKDAY,
} from '@/constants/shifts';

// Parses a "HH:mm" string into whole hours, returning null unless it is exactly on
// the hour (mm === "00"). The slot grid is hourly, so any minutes make it off-grid.
function parseSlotHour(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute !== 0) {
    return null;
  }
  return hour;
}

// A booking is on-grid only if it is a 1-hour slot whose start hour falls within the doctor's shift window.
function isOnGrid(doctor: Doctor, request: BookingRequest): boolean {
  const start = parseSlotHour(request.startTime);
  const end = parseSlotHour(request.endTime);
  if (start === null || end === null) {
    return false;
  }
  if (end - start !== SLOT_DURATION_HOURS) {
    return false;
  }
  const { start: shiftStart, end: shiftEnd } = SHIFT_HOURS[doctor.shift];
  return start >= shiftStart && end <= shiftEnd;
}

export function validateBooking(
  request: BookingRequest,
  doctors: Doctor[],
  appointments: Appointment[]
): Result {
  const doctor = doctors.find((d) => d.id === request.doctorId);
  if (!doctor) {
    return { ok: false, reason: 'Doctor not found.' };
  }

  if (!isOnGrid(doctor, request)) {
    return { ok: false, reason: 'This is not a valid consultation slot.' };
  }

  const weekday = UTC_DAY_TO_WEEKDAY[new Date(request.date).getUTCDay()];
  if (!weekday || !doctor.workingDays.includes(weekday)) {
    return { ok: false, reason: 'Doctor does not work on this day.' };
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
