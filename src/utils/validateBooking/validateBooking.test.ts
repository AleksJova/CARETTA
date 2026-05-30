import { describe, it, expect } from 'vitest';
import { validateBooking } from './validateBooking';
import type { Appointment, Doctor } from '@/types';

const doctor: Doctor = {
  id: 'doc-1',
  name: 'Dr. Patel',
  specialty: 'Cardiology',
  shift: 'morning',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  daysOff: [],
};

const otherDoctor: Doctor = { ...doctor, id: 'doc-2', name: 'Dr. Okafor' };

const baseRequest = {
  doctorId: 'doc-1',
  patientId: 'pat-1',
  date: '2026-06-01',
  startTime: '09:00',
  endTime: '10:00',
};

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'apt-1',
    doctorId: 'doc-1',
    patientId: 'pat-other',
    date: '2026-06-01',
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    ...overrides,
  };
}

describe('validateBooking', () => {
  it('accepts a valid booking when the doctor is free', () => {
    expect(validateBooking(baseRequest, [doctor], [])).toEqual({ ok: true });
  });

  it('rejects when the doctor does not exist', () => {
    expect(
      validateBooking({ ...baseRequest, doctorId: 'missing' }, [doctor], [])
    ).toEqual({ ok: false, reason: 'Doctor not found.' });
  });

  it('rejects a start time that is not on the hour', () => {
    expect(
      validateBooking(
        { ...baseRequest, startTime: '09:30', endTime: '10:30' },
        [doctor],
        []
      )
    ).toEqual({ ok: false, reason: 'This is not a valid consultation slot.' });
  });

  it('rejects a slot that is not exactly one hour long', () => {
    expect(
      validateBooking(
        { ...baseRequest, startTime: '09:00', endTime: '11:00' },
        [doctor],
        []
      )
    ).toEqual({ ok: false, reason: 'This is not a valid consultation slot.' });
  });

  it('rejects a slot outside the doctor shift window', () => {
    // Morning shift is 08–13; a 13:00–14:00 slot belongs to the afternoon.
    expect(
      validateBooking(
        { ...baseRequest, startTime: '13:00', endTime: '14:00' },
        [doctor],
        []
      )
    ).toEqual({ ok: false, reason: 'This is not a valid consultation slot.' });
  });

  it('accepts the last morning slot at the shift boundary (12–13)', () => {
    expect(
      validateBooking(
        { ...baseRequest, startTime: '12:00', endTime: '13:00' },
        [doctor],
        []
      )
    ).toEqual({ ok: true });
  });

  it('accepts an afternoon slot for an afternoon doctor', () => {
    const pmDoctor: Doctor = { ...doctor, shift: 'afternoon' };
    expect(
      validateBooking(
        { ...baseRequest, startTime: '18:00', endTime: '19:00' },
        [pmDoctor],
        []
      )
    ).toEqual({ ok: true });
  });

  it('rejects a confirmed-slot conflict only after the slot is on-grid', () => {
    // An off-grid overlapping request is rejected for being off-grid, not as a conflict.
    expect(
      validateBooking(
        { ...baseRequest, startTime: '09:30', endTime: '10:30' },
        [doctor],
        [makeAppointment()]
      )
    ).toEqual({ ok: false, reason: 'This is not a valid consultation slot.' });
  });

  it('rejects when the requested date falls on a non-working weekday', () => {
    // 2026-06-06 is a Saturday; this doctor works Mon–Fri only.
    expect(
      validateBooking({ ...baseRequest, date: '2026-06-06' }, [doctor], [])
    ).toEqual({ ok: false, reason: 'Doctor does not work on this day.' });
  });

  it('rejects a Sunday booking (clinic is closed Sundays)', () => {
    // 2026-06-07 is a Sunday; Weekday has no Sunday so it can never be a working day.
    expect(
      validateBooking({ ...baseRequest, date: '2026-06-07' }, [doctor], [])
    ).toEqual({ ok: false, reason: 'Doctor does not work on this day.' });
  });

  it('accepts a Saturday booking when the doctor works Saturdays', () => {
    const satDoctor: Doctor = { ...doctor, workingDays: ['Sat'] };
    expect(
      validateBooking({ ...baseRequest, date: '2026-06-06' }, [satDoctor], [])
    ).toEqual({ ok: true });
  });

  it('rejects when the doctor has a day off on the requested date', () => {
    const offDoctor = { ...doctor, daysOff: ['2026-06-01'] };
    expect(validateBooking(baseRequest, [offDoctor], [])).toEqual({
      ok: false,
      reason: 'Doctor is not available on this date.',
    });
  });

  it('rejects when a confirmed appointment occupies the slot', () => {
    expect(validateBooking(baseRequest, [doctor], [makeAppointment()])).toEqual(
      { ok: false, reason: 'This slot has already been booked.' }
    );
  });

  it('rejects when a completed appointment occupies the slot', () => {
    expect(
      validateBooking(
        baseRequest,
        [doctor],
        [makeAppointment({ status: 'completed' })]
      )
    ).toEqual({ ok: false, reason: 'This slot has already been booked.' });
  });

  it('allows booking a cancelled slot', () => {
    expect(
      validateBooking(
        baseRequest,
        [doctor],
        [makeAppointment({ status: 'cancelled' })]
      )
    ).toEqual({ ok: true });
  });

  it('does not conflict with a different doctor at the same time', () => {
    expect(
      validateBooking(
        baseRequest,
        [doctor, otherDoctor],
        [makeAppointment({ doctorId: 'doc-2' })]
      )
    ).toEqual({ ok: true });
  });

  it('does not conflict with the same doctor at a different time', () => {
    expect(
      validateBooking(
        baseRequest,
        [doctor],
        [makeAppointment({ startTime: '10:00', endTime: '11:00' })]
      )
    ).toEqual({ ok: true });
  });

  it('does not conflict with the same doctor on a different date', () => {
    expect(
      validateBooking(
        baseRequest,
        [doctor],
        [makeAppointment({ date: '2026-06-02' })]
      )
    ).toEqual({ ok: true });
  });
});
