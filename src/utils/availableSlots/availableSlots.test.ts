import { describe, it, expect } from 'vitest';
import { availableSlots } from './availableSlots';
import type { Appointment, Doctor } from '@/types';

const MONDAY = '2026-06-01';

const patel: Doctor = {
  id: 'doc-patel',
  name: 'Dr. Patel',
  specialty: 'Cardiology',
  shift: 'morning',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  daysOff: [],
};

const reyes: Doctor = {
  id: 'doc-reyes',
  name: 'Dr. Reyes',
  specialty: 'Pulmonology',
  shift: 'afternoon',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  daysOff: [],
};

function booking(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'apt-1',
    doctorId: 'doc-patel',
    patientId: 'pat-demo',
    date: MONDAY,
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    ...overrides,
  };
}

describe('availableSlots', () => {
  it('booking removes the slot from availability', () => {
    const before = availableSlots([patel], [], MONDAY, { date: MONDAY });
    const after = availableSlots([patel], [booking()], MONDAY, {
      date: MONDAY,
    });

    expect(before).toHaveLength(5);
    expect(after).toHaveLength(4);
    expect(
      after.some((s) => s.date === MONDAY && s.startTime === '09:00')
    ).toBe(false);
  });

  it('cancelling restores the slot', () => {
    const cancelled = availableSlots(
      [patel],
      [booking({ status: 'cancelled' })],
      MONDAY,
      { date: MONDAY }
    );

    expect(cancelled).toHaveLength(5);
    expect(
      cancelled.some((s) => s.date === MONDAY && s.startTime === '09:00')
    ).toBe(true);
  });

  it('a completed appointment still occupies its slot', () => {
    const after = availableSlots(
      [patel],
      [booking({ status: 'completed' })],
      MONDAY,
      {
        date: MONDAY,
      }
    );
    expect(after).toHaveLength(4);
  });

  it('filters by specialty', () => {
    const slots = availableSlots([patel, reyes], [], MONDAY, {
      specialty: 'Cardiology',
      date: MONDAY,
    });
    expect(slots.every((s) => s.doctorId === 'doc-patel')).toBe(true);
  });

  it('filters by doctor', () => {
    const slots = availableSlots([patel, reyes], [], MONDAY, {
      doctorId: 'doc-reyes',
      date: MONDAY,
    });
    expect(slots.every((s) => s.doctorId === 'doc-reyes')).toBe(true);
  });

  it('filters by single date', () => {
    const slots = availableSlots([patel], [], MONDAY, { date: '2026-06-02' });
    expect(slots.every((s) => s.date === '2026-06-02')).toBe(true);
  });

  it('returns no slots when no slot matches the filter', () => {
    const slots = availableSlots([patel], [], MONDAY, {
      specialty: 'Neurology',
      date: MONDAY,
    });
    expect(slots).toEqual([]);
  });

  it('honours a day off even when an appointment exists that date', () => {
    // Edge case: doctor took the day off but already had a booking that date.
    // The day off wins — zero slots — and the stray booking does not resurrect any.
    const offDoctor: Doctor = { ...patel, daysOff: [MONDAY] };
    const slots = availableSlots([offDoctor], [booking()], MONDAY, {
      date: MONDAY,
    });
    expect(slots).toEqual([]);
  });

  it('returns results in a stable date/time order', () => {
    const slots = availableSlots([patel, reyes], [], MONDAY, { date: MONDAY });
    const keys = slots.map((s) => `${s.date} ${s.startTime} ${s.doctorId}`);
    expect(keys).toEqual([...keys].sort());
  });
});
