import type { AppointmentStatus } from '@/types';

export type AppointmentView =
  | 'completed' // stored status === 'completed'
  | 'in-progress' // confirmed, now within the slot
  | 'awaiting' // confirmed, slot has fully ended, not yet completed
  | 'upcoming'; // confirmed, slot hasn't started

// `now` is local "HH:mm"; date/today are ISO dates; times are "HH:mm".
export function deriveAppointmentView(
  status: AppointmentStatus,
  date: string,
  startTime: string,
  endTime: string,
  today: string,
  now: string
): AppointmentView {
  if (status === 'completed') return 'completed';

  // A confirmed appointment is positioned against the clock.
  if (date < today) return 'awaiting'; // any earlier day is over
  if (date > today) return 'upcoming'; // any later day hasn't started

  // Same day: compare against the slot window. The slot is over once now has
  // reached its end; in progress while now is inside [start, end); else ahead.
  if (now >= endTime) return 'awaiting';
  if (now >= startTime) return 'in-progress';
  return 'upcoming';
}
