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
